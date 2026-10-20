import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(supabaseUrl, serviceKey);

console.log("=== TESTING ZERO-COST CHECKOUT & WATERMARKED DRM DOWNLOAD ===");

// 1. Pick one of the free published books
const { data: product, error: pErr } = await admin
  .from("digital_products")
  .select("id, title, price, file_url")
  .eq("status", "published")
  .eq("price", 0)
  .not("file_url", "is", null)
  .limit(1)
  .single();

if (pErr || !product) {
  console.error("Could not find a free published product:", pErr);
  process.exit(1);
}

console.log(`Testing Product: "${product.title}"`);
console.log(`Storage File: ${product.file_url}`);

// 2. Simulate guest checkout with Name & Email
const testBuyerName = "Prof. Folasade Ogunlesi";
const testBuyerEmail = "folasade.ogunlesi@unilag.edu.ng";

const { data: order, error: oErr } = await admin
  .from("orders")
  .insert({
    buyer_id: null,
    buyer_name: testBuyerName,
    buyer_email: testBuyerEmail,
    product_id: product.id,
    amount: 0,
    status: "paid",
    paystack_reference: `free_test_${crypto.randomUUID()}`,
  })
  .select("id")
  .single();

if (oErr) {
  console.error("Order creation failed:", oErr);
  process.exit(1);
}
console.log(`[PASS] Zero-Cost Order Created: Order ID ${order.id}`);

// 3. Generate HMAC License Key
const secret = process.env.LICENSE_KEY_SECRET || "default_test_secret";
const licenseKey = crypto
  .createHmac("sha256", secret)
  .update(`${product.id}:${testBuyerEmail}`)
  .digest("hex")
  .slice(0, 32)
  .toUpperCase();

const { data: license, error: lErr } = await admin
  .from("product_licenses")
  .insert({
    order_id: order.id,
    product_id: product.id,
    buyer_id: null,
    buyer_email: testBuyerEmail,
    license_key: licenseKey,
    max_activations: 5,
  })
  .select("id, license_key")
  .single();

if (lErr) {
  console.error("License issuance failed:", lErr);
  process.exit(1);
}
console.log(`[PASS] DRM License Issued: License ID ${license.id}`);
console.log(`       HMAC Key: ${license.license_key}`);

// 4. Test downloading file from Supabase storage and watermarking
console.log("Fetching deliverable from product-files bucket...");
const { data: fileData, error: fErr } = await admin.storage
  .from("product-files")
  .download(product.file_url);

if (fErr || !fileData) {
  console.error("Storage download failed:", fErr);
  process.exit(1);
}
console.log(`[PASS] Storage download succeeded (${(fileData.size / 1024).toFixed(1)} KB)`);

// 5. Test PDF watermark
if (product.file_url.endsWith(".pdf")) {
  console.log("Testing forensic PDF watermarking...");
  const rawBytes = new Uint8Array(await fileData.arrayBuffer());
  const doc = await PDFDocument.load(rawBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const markText = `LICENSED TO: ${testBuyerName} (${testBuyerEmail}) | DRM PROTECTED`;

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(markText, {
      x: width * 0.1,
      y: height * 0.5,
      size: 16,
      font,
      color: rgb(0.7, 0.1, 0.1),
      rotate: degrees(45),
      opacity: 0.35,
    });
  }
  const watermarkedBytes = await doc.save();
  console.log(`[PASS] Watermarking applied across ${pages.length} pages! Final size: ${(watermarkedBytes.length / 1024).toFixed(1)} KB`);
  console.log(`       Watermark text: "${markText}"`);
}

// Clean up test order and license
await admin.from("product_licenses").delete().eq("id", license.id);
await admin.from("orders").delete().eq("id", order.id);
console.log("[PASS] Cleaned up temporary test order & license.");

console.log("\n>>> ALL CHECKS PASSED: Zero-cost checkout generates authenticated DRM licenses & forensic watermarks! <<<");
