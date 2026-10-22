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

  const [{ data: licenses }, { data: products }, { data: members }] =
    await Promise.all([
      query,
      admin.from("digital_products").select("id, title").order("title"),
      admin.from("profiles").select("id, full_name").order("full_name"),
    ]);

  return (
    <div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">Product Licences</h2>
      <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
        All cryptographic licences issued from paid orders or manual administrative assignment. Reset device activations, revoke keys, or issue manual licences.
      </p>
      <div className="mt-6">
        <LicensesList
          licenses={
            (licenses as unknown as Parameters<typeof LicensesList>[0]["licenses"]) ?? []
          }
          products={products || []}
          members={members || []}
        />
      </div>
    </div>
  );
}