"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { error?: string };

async function actor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,full_name")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "super_admin") return null;
  return { id: user.id, name: profile.full_name ?? user.email ?? "Super Admin" };
}

export async function resetActivationsAction(licenseId: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const who = await actor();
  if (!who) return { error: "Super Admin only." };

  const { data: lic } = await admin
    .from("product_licenses")
    .select("license_key")
    .eq("id", licenseId)
    .single();
  if (!lic) return { error: "License not found." };

  const { error } = await admin
    .from("license_activations")
    .delete()
    .eq("license_id", licenseId);
  if (error) return { error: error.message };

  await admin
    .from("product_licenses")
    .update({ activation_count: 0, is_revoked: false })
    .eq("id", licenseId);
  await admin.from("audit_log").insert({
    actor_id: who.id,
    action: "license.activation_reset",
    target_table: "product_licenses",
    target_id: licenseId,
  });

  revalidatePath("/admin/licenses");
  return {};
}

export async function revokeLicenseAction(licenseId: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const who = await actor();
  if (!who) return { error: "Super Admin only." };

  const { data: lic } = await admin
    .from("product_licenses")
    .select("license_key,is_revoked")
    .eq("id", licenseId)
    .single();
  if (!lic) return { error: "License not found." };

  await admin
    .from("product_licenses")
    .update({ is_revoked: !lic.is_revoked })
    .eq("id", licenseId);
  await admin.from("audit_log").insert({
    actor_id: who.id,
    action: lic.is_revoked ? "license.unrevoked" : "license.revoked",
    target_table: "product_licenses",
    target_id: licenseId,
  });

  revalidatePath("/admin/licenses");
  return {};
}

export async function issueManualLicenseAction(formData: FormData): Promise<ActionResult> {
  const admin = createAdminClient();
  const who = await actor();
  if (!who) return { error: "Super Admin only." };

  const productId = formData.get("productId") as string;
  const buyerId = formData.get("buyerId") as string;
  const maxActivations = Number(formData.get("maxActivations") || 3);

  if (!productId || !buyerId) {
    return { error: "Please select both a product and a recipient member." };
  }

  // 1. Create a complementary zero-cost order
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      buyer_id: buyerId,
      product_id: productId,
      amount: 0,
      paystack_reference: `MANUAL-${Date.now()}`,
      status: "paid",
    })
    .select("id")
    .single();

  if (orderError) return { error: orderError.message };

  // 2. Generate signed cryptographic key
  const { generateLicenseKey } = await import("@/lib/licenses");
  const licenseKey = generateLicenseKey(productId, buyerId);

  // 3. Insert license
  const { error: licError } = await admin.from("product_licenses").insert({
    order_id: order.id,
    product_id: productId,
    buyer_id: buyerId,
    license_key: licenseKey,
    max_activations: maxActivations,
    activation_count: 0,
    is_revoked: false,
  });

  if (licError) return { error: licError.message };

  await admin.from("audit_log").insert({
    actor_id: who.id,
    action: "license.manual_issue",
    target_table: "product_licenses",
    target_id: order.id,
  });

  revalidatePath("/admin/licenses");
  return {};
}