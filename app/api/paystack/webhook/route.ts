import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/paystack";
import { generateLicenseKey } from "@/lib/licenses";
import { sendTransactionalEmail } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebhookEvent = {
  event: string;
  data: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
  };
};

export async function POST(req: Request) {
  const raw = await req.text();

  if (!verifyWebhookSignature(raw, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ message: "invalid signature" }, { status: 401 });
  }

  let payload: WebhookEvent;
  try {
    payload = JSON.parse(raw) as WebhookEvent;
  } catch {
    return NextResponse.json({ message: "invalid body" }, { status: 400 });
  }

  // Always ack Paystack quickly; act only on success events.
  if (payload.event === "charge.success" && payload.data.reference) {
    const reference = payload.data.reference;
    const admin = createAdminClient();

    // Check for Lifetime Membership payment
    if (reference.startsWith("mla_membership_")) {
      const { data: memPayment } = await admin
        .from("membership_payments")
        .select("*")
        .eq("reference", reference)
        .maybeSingle();

      if (memPayment && memPayment.status !== "paid") {
        const { activateMembership } = await import("@/lib/membership");
        await activateMembership({
          email: memPayment.email,
          fullName: memPayment.full_name,
          reference,
          amount: Number(memPayment.amount),
          userId: memPayment.user_id,
          paymentMethod: "paystack",
        });

        await admin.from("audit_log").insert({
          actor_id: memPayment.user_id || null,
          action: "membership.paid",
          target_table: "membership_payments",
          target_id: memPayment.id,
          category: "membership",
          severity: "notice",
          details: {
            email: memPayment.email,
            amount: memPayment.amount,
            reference,
          },
        });
      }
      return NextResponse.json({ received: true });
    }

    const re = /^mla_([0-9a-f-]+)$/i;
    const match = re.exec(reference);

    if (match) {
      const orderId = match[1];
      const { data: order } = await admin
        .from("orders")
        .select("id,buyer_id,buyer_email,buyer_name,product_id,bundle_id,amount,status,paystack_reference")
        .eq("id", orderId)
        .single();

      if (order && order.status !== "paid") {
        // Re-verify the charged amount/currency against the stored order.
        const expectedKobo = Math.round(Number(order.amount) * 100);
        const paidKobo = Number(payload.data.amount);
        const paidCurrency = String(payload.data.currency ?? "NGN");
        if (Number.isFinite(paidKobo) && (paidKobo !== expectedKobo || paidCurrency !== "NGN")) {
          await admin
            .from("orders")
            .update({ status: "failed" })
            .eq("id", order.id);
          await admin.from("audit_log").insert({
            actor_id: order.buyer_id || null,
            action: "order.amount_mismatch",
            target_table: "orders",
            target_id: order.id,
            category: "shop",
            severity: "critical",
            details: {
              expected_kobo: expectedKobo,
              paid_kobo: paidKobo,
              currency: paidCurrency,
              reference,
            },
          });
          return NextResponse.json({ received: true });
        }

        const { data: existingLic } = await admin
          .from("product_licenses")
          .select("id")
          .eq("order_id", order.id)
          .maybeSingle();

        // Idempotency: if a replayed charge.success already produced a licence, skip issuance
        if (!existingLic) {
          let email = order.buyer_email || "";
          let buyerName = order.buyer_name || "";

          if (order.buyer_id) {
            const { data: buyer } = await admin
              .from("profiles")
              .select("id,full_name")
              .eq("id", order.buyer_id)
              .single();
            try {
              const res = await admin.auth.admin.getUserById(order.buyer_id);
              const identity = res.data as { user: { email?: string } | null };
              email = identity?.user?.email ?? email;
            } catch {
              // ignore
            }
            buyerName = buyer?.full_name ?? buyerName;
          }

          const buyerIdentifier = order.buyer_id || email || order.id;
          const productIdsToIssue: string[] = [];

          if (order.bundle_id) {
            const { data: bundleItems } = await admin
              .from("product_bundle_items")
              .select("product_id")
              .eq("bundle_id", order.bundle_id);
            for (const item of bundleItems ?? []) {
              productIdsToIssue.push(item.product_id);
            }
          } else if (order.product_id) {
            productIdsToIssue.push(order.product_id);
          }

          const issuedLicenses: { title: string; key: string }[] = [];

          for (const pid of productIdsToIssue) {
            let licenseKey: string;
            try {
              licenseKey = generateLicenseKey(pid, buyerIdentifier);
            } catch {
              console.error(`[webhook] License generation failed for ${pid}`);
              continue;
            }

            const { error: licError } = await admin.from("product_licenses").insert({
              order_id: order.id,
              product_id: pid,
              bundle_id: order.bundle_id || null,
              buyer_id: order.buyer_id || null,
              buyer_email: email,
              license_key: licenseKey,
              max_activations: 5,
            });

            if (!licError) {
              const { data: p } = await admin.from("digital_products").select("title").eq("id", pid).single();
              issuedLicenses.push({ title: p?.title ?? "Lecture Notes", key: licenseKey });
            }
          }

          await admin.from("audit_log").insert({
            actor_id: order.buyer_id || null,
            action: "license.issued",
            target_table: "product_licenses",
            category: "licenses",
            severity: "notice",
            details: { count: issuedLicenses.length, order_id: order.id },
          });

          const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mla.org.ng";
          if (email && issuedLicenses.length > 0) {
            const licensesList = issuedLicenses
              .map((l) => `<li style="margin-bottom:8px"><strong>${l.title}</strong>: <code style="font-size:15px;background:#f0f0f0;padding:2px 6px">${l.key}</code></li>`)
              .join("");

            await sendTransactionalEmail({
              to: email,
              subject: `Your Lecture Materials & License Keys (Order ${order.id.slice(0, 8)})`,
              html: `
                <p>Hi ${buyerName || "there"},</p>
                <p>Thank you for your purchase! Here are your digital lecture notes and license keys:</p>
                <ul>${licensesList}</ul>
                <p><a href="${site}/dashboard/library">Open Your Library</a> to download your materials.</p>
                <p style="color:#666;font-size:12px">All downloads are secured and personal-watermarked with your details.</p>
              `,
            }).catch(() => {});
          }
        }

        await admin
          .from("orders")
          .update({ status: "paid" })
          .eq("id", order.id);
        await admin.from("audit_log").insert({
          actor_id: order.buyer_id,
          action: "order.paid",
          target_table: "orders",
          target_id: order.id,
          category: "shop",
          severity: "info",
          details: { reference },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}