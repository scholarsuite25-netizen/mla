import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { DeliveryClient } from "@/components/shop/delivery-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Delivery & Downloads | Scholar Suite Store",
  description: "Access your licensed digital publication downloads and cryptographic keys.",
};

interface DeliveryPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function DeliveryPage({ params }: DeliveryPageProps) {
  const { orderId } = await params;

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, amount, status, buyer_name, buyer_email, paystack_reference, created_at")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    notFound();
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
    <div className="min-h-screen bg-[#070503] py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <DeliveryClient order={order} licenses={formattedLicenses} />
      </div>
    </div>
  );
}
