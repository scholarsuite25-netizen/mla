import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/paystack";
import { generateLicenseKey } from "@/lib/licenses";
import { sendTransactionalEmail } from "@/lib/email/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebhookEvent = {
  event: string;
  data: { reference?: string; status?: string };
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

        const licenseKey = generateLicenseKey(order.product_id, order.buyer_id);

        const { error: licError } = await admin.from("product_licenses").insert({
          order_id: order.id,
          product_id: order.product_id,
          buyer_id: order.buyer_id,
          license_key: licenseKey,
          max_activations: 3,
        });

        if (!licError) {
          await admin
            .from("orders")
            .update({ status: "paid" })
            .eq("id", order.id);
          await admin.from("audit_log").insert({
            actor_id: order.buyer_id,
            action: "order.paid",
            target_table: "orders",
            target_id: order.id,
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
      }
    }
  }

  return NextResponse.json({ received: true });
}