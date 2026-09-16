"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSuperAdmin } from "@/lib/auth-guard";
import { generateLicenseKey, isValidLicenseFormat } from "@/lib/licenses";

export type ActionResult = { error?: string };

export type DeviceActivationItem = {
  id: string;
  device_fingerprint: string;
  activated_at: string;
};

export async function resetActivationsAction(licenseId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { data: lic } = await admin
    .from("product_licenses")
    .select("license_key")
    .eq("id", licenseId)
    .single();

  if (!lic) return { error: "License not found." };

  // 1. Delete all device fingerprint activations for this license
  const { error: delError } = await admin
    .from("license_activations")
    .delete()
    .eq("license_id", licenseId);

  if (delError) return { error: delError.message };

  // 2. Reset count to 0 and unrevoke if desired
  await admin
    .from("product_licenses")
    .update({ activation_count: 0 })
    .eq("id", licenseId);

  // 3. Security audit trail
  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: "license.activation_reset",
    target_table: "product_licenses",
    target_id: licenseId,
  });

  revalidatePath("/admin/licenses");
  return {};
}

export async function revokeLicenseAction(licenseId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { data: lic } = await admin
    .from("product_licenses")
    .select("license_key, is_revoked")
    .eq("id", licenseId)
    .single();

  if (!lic) return { error: "License not found." };

  const nextRevoked = !lic.is_revoked;

  await admin
    .from("product_licenses")
    .update({ is_revoked: nextRevoked })
    .eq("id", licenseId);

  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: nextRevoked ? "license.revoked" : "license.unrevoked",
    target_table: "product_licenses",
    target_id: licenseId,
  });

  revalidatePath("/admin/licenses");
  return {};
}

export async function updateMaxActivationsAction(
  licenseId: string,
  newMax: number
): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  if (newMax < 1 || newMax > 50) {
    return { error: "Device activation limit must be between 1 and 50." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("product_licenses")
    .update({ max_activations: newMax })
    .eq("id", licenseId);

  if (error) return { error: error.message };

  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: "license.update_max_activations",
    target_table: "product_licenses",
    target_id: licenseId,
  });

  revalidatePath("/admin/licenses");
  return {};
}

export async function issueManualLicenseAction(formData: FormData): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const productId = formData.get("productId") as string;
  const buyerId = formData.get("buyerId") as string;
  const maxActivations = Math.max(1, Number(formData.get("maxActivations") || 3));

  if (!productId || !buyerId) {
    return { error: "Please select both a product and a recipient member." };
  }

  // 1. Create a zero-cost administrative order
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      buyer_id: buyerId,
      product_id: productId,
      amount: 0,
      paystack_reference: `MANUAL-ASSIGN-${Date.now()}`,
      status: "paid",
    })
    .select("id")
    .single();

  if (orderError) return { error: orderError.message };

  // 2. Generate signed cryptographic key
  const licenseKey = generateLicenseKey(productId, buyerId);

  // 3. Insert license into product_licenses
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
    actor_id: actor.id,
    action: "license.manual_issue",
    target_table: "product_licenses",
    target_id: order.id,
  });

  revalidatePath("/admin/licenses");
  return {};
}

export async function getLicenseDevicesAction(
  licenseId: string
): Promise<{ devices?: DeviceActivationItem[]; error?: string }> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("license_activations")
    .select("id, device_fingerprint, activated_at")
    .eq("license_id", licenseId)
    .order("activated_at", { ascending: false });

  if (error) return { error: error.message };
  return { devices: data ?? [] };
}

export async function verifyLicenseKeyAction(key: string): Promise<{
  valid: boolean;
  message: string;
  license?: {
    id: string;
    key: string;
    productTitle: string;
    buyerName: string;
    activations: string;
    isRevoked: boolean;
    createdAt: string;
  };
}> {
  try {
    await assertSuperAdmin();
  } catch {
    return { valid: false, message: "Unauthorized." };
  }

  const trimmed = key.trim();
  if (!isValidLicenseFormat(trimmed)) {
    return {
      valid: false,
      message: "Invalid license format. Expected format: MLA-XXXX-XXXX-XXXXXXXX-XXXXXXXX",
    };
  }

  const admin = createAdminClient();
  const { data: lic, error } = await admin
    .from("product_licenses")
    .select(
      "id, license_key, max_activations, activation_count, is_revoked, created_at, buyer:profiles(full_name), digital_products(title)"
    )
    .eq("license_key", trimmed)
    .maybeSingle();

  if (error || !lic) {
    return {
      valid: false,
      message: "Key matches MLA cryptographic format but is not registered in the database.",
    };
  }

  const prodRaw = lic.digital_products;
  const productTitle = Array.isArray(prodRaw)
    ? prodRaw[0]?.title ?? "Unknown Product"
    : (prodRaw as { title: string } | null)?.title ?? "Unknown Product";

  const buyerRaw = lic.buyer;
  const buyerName = Array.isArray(buyerRaw)
    ? buyerRaw[0]?.full_name ?? "Anonymous Member"
    : (buyerRaw as unknown as { full_name: string | null } | null)?.full_name ?? "Anonymous Member";

  return {
    valid: true,
    message: lic.is_revoked
      ? "Valid cryptographic key, but currently REVOKED."
      : "Authentic active cryptographic license key.",
    license: {
      id: lic.id,
      key: lic.license_key,
      productTitle,
      buyerName,
      activations: `${lic.activation_count}/${lic.max_activations}`,
      isRevoked: lic.is_revoked,
      createdAt: new Date(lic.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    },
  };
}