import { createHmac, randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type LicenseRow = {
  id: string;
  product_id: string;
  buyer_id: string;
  license_key: string;
  max_activations: number;
  activation_count: number;
  is_revoked: boolean;
  orders?: { paystack_reference: string | null }[];
};

/**
 * Signed license key: MLA-XXXX-XXXX-SSSSSSSS where the last 32 hex chars
 * are HMAC-SHA256(secret, RAND8) so the key can be validated offline and
 * is unguessable (spec §9: not sequential/guessable IDs).
 */
export function generateLicenseKey(productId: string, buyerId: string): string {
  const randomHex = randomBytes(4).toString("hex").toUpperCase();
  const mac = createHmac("sha256", process.env.LICENSE_KEY_SECRET ?? "mla-dev-key")
    .update(`${productId}:${buyerId}:${randomHex}`)
    .digest("hex")
    .toUpperCase();
  return `MLA-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}-${mac.slice(0, 8)}-${mac.slice(8, 16)}`;
}

export function isValidLicenseFormat(key: string): boolean {
  return /^MLA-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{8}-[A-F0-9]{8}$/.test(key);
}

/** Look up the buyer's license and materialise its order reference. */
export async function getLicenseWithOrder(licenseId: string, buyerId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("product_licenses")
    .select("id,product_id,buyer_id,license_key,max_activations,activation_count,is_revoked,orders(paystack_reference)")
    .eq("id", licenseId)
    .eq("buyer_id", buyerId)
    .single();
  return (data as unknown as LicenseRow | null) ?? null;
}

export async function allowActivation(
  licenseId: string,
  deviceFingerprint: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const admin = createAdminClient();

  const { data: lic } = await admin
    .from("product_licenses")
    .select("max_activations,activation_count,is_revoked")
    .eq("id", licenseId)
    .single();
  if (!lic) return { ok: false, reason: "License not found." };
  if (lic.is_revoked) return { ok: false, reason: "This license has been revoked." };

  const { data: existing } = await admin
    .from("license_activations")
    .select("id")
    .eq("license_id", licenseId)
    .eq("device_fingerprint", deviceFingerprint)
    .maybeSingle();
  if (existing) return { ok: true }; // same device, already counted

  if (lic.activation_count >= lic.max_activations) {
    return { ok: false, reason: "Activation limit reached for this license." };
  }

  const { error } = await admin.from("license_activations").insert({
    license_id: licenseId,
    device_fingerprint: deviceFingerprint,
  });
  if (error) return { ok: false, reason: error.message };

  await admin
    .from("product_licenses")
    .update({ activation_count: lic.activation_count + 1 })
    .eq("id", licenseId);

  return { ok: true };
}