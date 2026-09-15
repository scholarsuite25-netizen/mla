import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DownloadLink } from "@/components/shop/download-link";

export const dynamic = "force-dynamic";

type LibraryRow = {
  id: string;
  license_key: string;
  max_activations: number;
  activation_count: number;
  is_revoked: boolean;
  created_at: string;
  digital_products: { title: string; type: string } | { title: string; type: string }[];
  orders: { paystack_reference: string | null; amount: number } | { paystack_reference: string | null; amount: number }[];
};

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <p className="text-parchment/60">
        Sign in to see your library.
      </p>
    );
  }

  // buyer-facing view uses RLS (product_licenses_select_own).
  const { data: licenses } = await supabase
    .from("product_licenses")
    .select(
      "id,license_key,max_activations,activation_count,is_revoked,created_at,digital_products(title,type),orders(paystack_reference,amount)"
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (licenses ?? []) as unknown as LibraryRow[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl text-parchment">My Library</h1>
      <p className="mt-2 text-sm text-parchment/60">
        Everything you&apos;ve purchased, your licence keys, and device
        activations. Reaching your activation limit? Ask the Super Admin for a
        reset.
      </p>

      <div className="mt-8 space-y-4">
        {rows.length === 0 && (
          <p className="text-parchment/60">
            No purchases yet.{" "}
            <Link href="/shop" className="text-gold hover:underline">
              Visit the shop
            </Link>
            .
          </p>
        )}

        {rows.map((lic) => {
          const product = Array.isArray(lic.digital_products)
            ? lic.digital_products[0]
            : (lic.digital_products as { title: string; type: string });
          const order = Array.isArray(lic.orders)
            ? lic.orders[0]
            : (lic.orders as { paystack_reference: string | null; amount: number });
          const consumed = lic.activation_count;

          return (
            <div
              key={lic.id}
              className="rounded-md border border-parchment/10 bg-panel p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-display text-xl text-parchment">
                    {product?.title}
                  </h2>
                  <p className="mt-1 text-xs text-parchment/50">
                    {product?.type} · ₦{Number(order?.amount ?? 0).toFixed(2)} ·{" "}
                    {new Date(lic.created_at).toLocaleDateString("en-NG")}
                  </p>
                  <p className="mt-2 font-mono text-sm text-gold">
                    {lic.license_key}
                  </p>
                  <p className="mt-1 text-xs text-parchment/50">
                    {consumed}/{lic.max_activations} device
                    {consumed === 1 ? "" : "s"} activated
                    {lic.is_revoked && " · REVOKED"}
                  </p>
                </div>
                <div className="shrink-0">
                  {lic.is_revoked ? (
                    <span className="rounded-sm border border-crest-red/40 px-4 py-2 text-xs text-crest-red">
                      Revoked
                    </span>
                  ) : (
                    <DownloadLink licenseId={lic.id} title={product?.title ?? "product"} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}