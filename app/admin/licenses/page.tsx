import { createAdminClient } from "@/lib/supabase/admin";
import { LicensesList } from "@/components/admin/licenses-list";

export const dynamic = "force-dynamic";

export default async function AdminLicensesPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("product_licenses")
    .select(
      "id,license_key,max_activations,activation_count,is_revoked,created_at,buyer_id,buyer:profiles(full_name),digital_products(title),orders(paystack_reference)"
    )
    .order("created_at", { ascending: false });

  if (product) query = query.eq("product_id", product);
  const { data: licenses } = await query;

  return (
    <div>
      <h2 className="font-display text-2xl text-parchment">Product Licences</h2>
      <p className="mt-1 text-xs text-parchment/50">
        All licences issued from paid orders. Reset a buyer&apos;s device
        activations or revoke a licence from here.
      </p>
      <div className="mt-6">
        <LicensesList
          licenses={
            (licenses as unknown as Parameters<typeof LicensesList>[0]["licenses"]) ?? []
          }
        />
      </div>
    </div>
  );
}