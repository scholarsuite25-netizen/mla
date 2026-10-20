import { createAdminClient } from "@/lib/supabase/admin";
import { assertSuperAdmin } from "@/lib/auth-guard";
import { BankTransfersManager } from "@/components/admin/bank-transfers-manager";
import { getStoreSettings } from "@/lib/store";
import type { OrderRecord } from "@/app/admin/orders/actions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await assertSuperAdmin();

  const admin = createAdminClient();
  const [{ data: orders }, storeSettings] = await Promise.all([
    admin
      .from("orders")
      .select(`
        id,
        created_at,
        buyer_id,
        buyer_name,
        buyer_email,
        product_id,
        bundle_id,
        amount,
        discount_amount,
        payment_method,
        status,
        transfer_reference,
        transfer_proof_note,
        paystack_reference,
        digital_products (title, type),
        product_bundles (title)
      `)
      .order("created_at", { ascending: false }),
    getStoreSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-parchment">
          Orders & Bank Transfers
        </h1>
        <p className="mt-1 text-xs text-parchment/60">
          Monitor incoming orders, approve direct GTBank transfers via WhatsApp receipts, and manage fulfilled digital deliveries.
        </p>
      </div>

      <BankTransfersManager
        initialOrders={(orders ?? []) as unknown as OrderRecord[]}
        storeSettings={storeSettings}
      />
    </div>
  );
}
