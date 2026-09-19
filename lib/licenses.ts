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

// Fail closed: if LICENSE_KEY_SECRET is unset, license signing/verification
// refuses to operate rather than falling back to a hardcoded dev key.
function licenseSecret(): string {
  const secret = process.env.LICENSE_KEY_SECRET;
  if (!secret) {
    throw new Error("LICENSE_KEY_SECRET is not configured.");
  }
  return secret;
}

/**
 * Signed license key: MLA-XXXX-XXXX-SSSSSSSS-SSSSSSSS where the signature
 * is HMAC-SHA256(secret, productId:buyerId:randHex) so the key can be validated
 * cryptographically and is unguessable.
 */
export function generateLicenseKey(productId: string, buyerId: string): string {
  const randomHex = randomBytes(4).toString("hex").toUpperCase();
  const mac = createHmac("sha256", licenseSecret())
    .update(`${productId}:${buyerId}:${randomHex}`)
    .digest("hex")
    .toUpperCase();
  return `MLA-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}-${mac.slice(0, 8)}-${mac.slice(8, 16)}`;
}

export function isValidLicenseFormat(key: string): boolean {
  return /^MLA-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{8}-[A-F0-9]{8}$/.test(key.trim());
}

/**
 * Cryptographically verifies that a license key was issued by MLA for a specific product and buyer.
 */
export function verifyLicenseKey(
  key: string,
  productId: string,
  buyerId: string
): boolean {
  if (!isValidLicenseFormat(key)) return false;
  const parts = key.trim().split("-");
  if (parts.length !== 5) return false;
  const randHex = parts[1] + parts[2];
  const providedMac = parts[3] + parts[4];
  let expectedMac: string;
  try {
    expectedMac = createHmac("sha256", licenseSecret())
      .update(`${productId}:${buyerId}:${randHex}`)
      .digest("hex")
      .toUpperCase()
      .slice(0, 16);
  } catch {
    return false;
  }
  return providedMac === expectedMac;
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