import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { DeliveryClient } from "@/components/shop/delivery-client";
import { verifyOrderPaymentAction } from "@/app/shop/actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmed & Downloads | MLA Academy",
  description: "Access your licensed digital publication downloads and cryptographic keys.",
};

interface DeliveryPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function DeliveryPage({ params, searchParams }: DeliveryPageProps) {
  const { orderId } = await params;
  const { email } = await searchParams;

  const admin = createAdminClient();

  let { data: order } = await admin
    .from("orders")
    .select("id, amount, status, buyer_name, buyer_email, payment_method, paystack_reference, transfer_reference, created_at")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  // If order is still pending and has paystack_reference, attempt instant synchronous verification
  if (order.status !== "paid" && order.paystack_reference) {
    const vRes = await verifyOrderPaymentAction(order.id);
    if (vRes.success) {
      const { data: updatedOrder } = await admin
        .from("orders")
        .select("id, amount, status, buyer_name, buyer_email, payment_method, paystack_reference, transfer_reference, created_at")
        .eq("id", orderId)
        .maybeSingle();
      if (updatedOrder) order = updatedOrder;
    }
  }

  // Load product licenses associated with this order
  const { data: licenses } = await admin
    .from("product_licenses")
    .select(`
      id,
      license_key,
      max_activations,
      activation_count,
      product:digital_products (
        id,
        title,
        type,
        file_url
      )
    `)
    .eq("order_id", orderId);

  const formattedLicenses = (licenses ?? []).map((l) => ({
    id: l.id,
    license_key: l.license_key,
    max_activations: l.max_activations,
    activation_count: l.activation_count,
    product: Array.isArray(l.product) ? l.product[0] : l.product,
  }));

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800 py-10 sm:py-14 px-4 sm:px-6 w-full">
      <div className="mx-auto max-w-4xl">
        <DeliveryClient order={order} licenses={formattedLicenses} buyerEmail={email ?? order.buyer_email ?? undefined} />
      </div>
    </div>
  );
}
