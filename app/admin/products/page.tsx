import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductActions } from "@/components/admin/product-actions";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  title: string;
  type: string;
  price: number;
  status: string;
  updated_at: string;
};

export default async function AdminProductsPage() {
  const admin = createAdminClient();
  const { data: products, error } = await admin
    .from("digital_products")
    .select("id,title,type,price,status,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return <p className="text-crest-red">{error.message}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-parchment">
          Digital Products
        </h2>
        <Link
          href="/admin/products/new"
          className="rounded-sm bg-crest-red px-4 py-2 text-sm font-medium text-white hover:bg-crest-red/90"
        >
          New product
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {(products as unknown as ProductRow[] | null)?.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-4 rounded-md border border-parchment/10 bg-panel p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-display text-lg text-parchment">
                {product.title}
              </p>
              <p className="mt-1 text-xs text-parchment/50">
                {product.type} · ₦{product.price.toFixed(2)} ·{" "}
                <span
                  className={
                    product.status === "published"
                      ? "text-gold"
                      : "text-parchment/40"
                  }
                >
                  {product.status}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/products/${product.id}`}
                className="rounded-sm border border-parchment/20 px-3 py-1.5 text-xs text-parchment/80 hover:border-gold/60 hover:text-gold"
              >
                Manage
              </Link>
              <ProductActions productId={product.id} status={product.status} />
            </div>
          </div>
        ))}
        {(!products || products.length === 0) && (
          <p className="text-parchment/60">
            No products yet. Create the first one.
          </p>
        )}
      </div>
    </div>
  );
}