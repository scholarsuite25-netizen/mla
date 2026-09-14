import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/product-form";
import { ProductActions } from "@/components/admin/product-actions";
import { LicensesList } from "@/components/admin/licenses-list";

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: product } = await admin
    .from("digital_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!product) notFound();

  const { data: licenses } = await admin
    .from("product_licenses")
    .select(
      "id,license_key,max_activations,activation_count,is_revoked,created_at,orders(paystack_reference)"
    )
    .eq("product_id", id)
    .order("created_at", { ascending: false });

  const { count: orderCount } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id)
    .neq("status", "pending");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-parchment">{product.title}</h2>
        <ProductActions productId={product.id} status={product.status} />
      </div>
      <p className="mt-1 text-xs text-parchment/50">
        {product.type} · ₦{Number(product.price).toFixed(2)} · {orderCount}{" "}
        sale{orderCount === 1 ? "" : "s"}
      </p>

      <ProductForm key={product.id} product={product} />

      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-parchment">Licenses</h3>
          <Link
            href={`/admin/licenses?product=${product.id}`}
            className="rounded-sm border border-parchment/20 px-3 py-1.5 text-xs text-parchment/80 hover:border-gold/60 hover:text-gold"
          >
            View all licences
          </Link>
        </div>
        <div className="mt-4">
          <LicensesList
            licenses={
              (licenses as unknown as Parameters<typeof LicensesList>[0]["licenses"]) ?? []
            }
          />
        </div>
      </div>
    </div>
  );
}