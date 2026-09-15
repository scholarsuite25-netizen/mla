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