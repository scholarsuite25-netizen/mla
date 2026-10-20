"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSuperAdmin } from "@/lib/auth-guard";
import { approveBankTransferOrder, type StoreSettings } from "@/lib/store";
import { logAuditEvent } from "@/lib/audit";

export type OrderRecord = {
  id: string;
  created_at: string;
  buyer_id: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  product_id: string | null;
  bundle_id: string | null;
  amount: number;
  discount_amount: number;
  payment_method: string;
  status: string;
  transfer_reference: string | null;
  transfer_proof_note: string | null;
  paystack_reference: string | null;
  digital_products?: { title: string; type: string } | null;
  product_bundles?: { title: string } | null;
};

export async function getOrdersAction(options?: {
  status?: string;
  paymentMethod?: string;
}): Promise<{ orders: OrderRecord[]; error?: string }> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { orders: [], error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  let query = admin
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
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.paymentMethod) {
    query = query.eq("payment_method", options.paymentMethod);
  }

  const { data, error } = await query;
  if (error) return { orders: [], error: error.message };

  return { orders: (data ?? []) as unknown as OrderRecord[] };
}

export async function approveTransferAction(orderId: string): Promise<{ success: boolean; error?: string }> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const res = await approveBankTransferOrder(orderId);
  if (!res.success) {
    return res;
  }

  await logAuditEvent({
    action: "order.transfer_approved",
    targetTable: "orders",
    targetId: orderId,
    actorId: actor.id,
    actorEmail: actor.email,
    category: "shop",
    severity: "notice",
    details: { order_id: orderId },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/licenses");
  revalidatePath("/shop");
  return { success: true };
}

export async function rejectTransferAction(orderId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status: "failed", transfer_proof_note: reason || "Declined by admin" })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  await logAuditEvent({
    action: "order.transfer_rejected",
    targetTable: "orders",
    targetId: orderId,
    actorId: actor.id,
    actorEmail: actor.email,
    category: "shop",
    severity: "warning",
    details: { order_id: orderId, reason },
  });

  revalidatePath("/admin/orders");
  return { success: true };
}

export async function updateStoreSettingsAction(settings: Partial<StoreSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("store_settings")
    .upsert({
      id: "default",
      ...settings,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/shop");
  return { success: true };
}
