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
    const re = /^mla_([0-9a-f-]+)$/i;
    const match = re.exec(reference);

    if (match) {
      const orderId = match[1];
      const { data: order } = await admin
        .from("orders")
        .select("id,buyer_id,product_id,amount,status,paystack_reference")
        .eq("id", orderId)
        .single();

      if (order && order.status !== "paid") {
        // Re-verify the charged amount/currency against the stored order. The
        // signature authenticates the payload, but product price could have
        // changed between checkout init and charge confirmation.
        const expectedKobo = Math.round(Number(order.amount) * 100);
        const paidKobo = Number(payload.data.amount);
        const paidCurrency = String(payload.data.currency ?? "NGN");
        if (Number.isFinite(paidKobo) && (paidKobo !== expectedKobo || paidCurrency !== "NGN")) {
          await admin
            .from("orders")
            .update({ status: "failed" })
            .eq("id", order.id);
          await admin.from("audit_log").insert({
            actor_id: order.buyer_id,
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

        // Idempotency: if a replayed charge.success already produced a licence,
        // just make sure the order is marked paid and re-send is skipped.
        if (!existingLic) {
          const { data: product } = await admin
            .from("digital_products")
            .select("id,title,type")
            .eq("id", order.product_id)
            .single();
          const { data: buyer } = await admin
            .from("profiles")
            .select("id,full_name")
            .eq("id", order.buyer_id)
            .single();

          let email = "";
          let identity: { user: { email?: string } | null } | null = null;
          try {
            const res = await admin.auth.admin.getUserById(order.buyer_id);
            identity = res.data as { user: { email?: string } | null };
          } catch {
            identity = null;
          }
          email = identity?.user?.email ?? "";
          const buyerName = buyer?.full_name ?? email;

          let licenseKey: string;
          try {
            licenseKey = generateLicenseKey(order.product_id, order.buyer_id);
          } catch {
            console.error(
              `[webhook] License generation skipped for order ${order.id}: LICENSE_KEY_SECRET unset.`
            );
            await admin.from("audit_log").insert({
              actor_id: order.buyer_id,
              action: "license.failed",
              target_table: "orders",
              target_id: order.id,
              category: "shop",
              severity: "critical",
              details: { error: "LICENSE_KEY_SECRET unset", reference },
            });
            return NextResponse.json({ message: "license generation failed" }, { status: 500 });
          }

          const { error: licError } = await admin.from("product_licenses").insert({
            order_id: order.id,
            product_id: order.product_id,
            buyer_id: order.buyer_id,
            license_key: licenseKey,
            max_activations: 3,
          });

          if (licError) {
            // Do not mark paid; Paystack will retry and the idempotency guard above
            // will finish any partially-committed issuance.
            console.error(`[webhook] Licence insert failed for order ${order.id}:`, licError.message);
            return NextResponse.json({ received: true });
          }

          await admin.from("audit_log").insert({
            actor_id: order.buyer_id,
            action: "license.issued",
            target_table: "product_licenses",
            category: "licenses",
            severity: "notice",
            details: { product_id: order.product_id, order_id: order.id },
          });

          const site =
            process.env.NEXT_PUBLIC_SITE_URL ?? "https://mla.org.ng";
          if (email) {
            await sendTransactionalEmail({
              to: email,
              subject: `Your licence for ${product?.title} on MLA`,
              html: `
                <p>Hi ${buyerName},</p>
                <p>Thanks for your purchase of <strong>${product?.title}</strong>.</p>
                <p>Your licence key is:</p>
                <p style="font-family:monospace;font-size:18px;letter-spacing:1px">${licenseKey}</p>
                <p><a href="${site}/dashboard/library">Open your MLA Library</a> to download the product. You can activate it on up to 3 devices.</p>
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