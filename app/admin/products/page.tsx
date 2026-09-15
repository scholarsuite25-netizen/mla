import { createAdminClient } from "@/lib/supabase/admin";
import {
  ProductsManager,
  ProductListItem,
  RecentOrder,
} from "@/components/admin/products-manager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const admin = createAdminClient();

  const [{ data: products, error: pError }, { data: orders }] = await Promise.all([
    admin
      .from("digital_products")
      .select("id,title,type,price,status,updated_at")
      .order("updated_at", { ascending: false }),
    admin
      .from("orders")
      .select(
        "id,amount,paystack_reference,status,created_at,buyer:profiles(full_name),digital_products(title)"
      )
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (pError) {
    return <p className="text-crest-red">{pError.message}</p>;
  }

  return (
    <ProductsManager
      initialProducts={(products as ProductListItem[]) || []}
      recentOrders={(orders as unknown as RecentOrder[]) || []}
    />
  );
}