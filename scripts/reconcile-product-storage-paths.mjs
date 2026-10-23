import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("=== Auditing & Reconciling Digital Product Storage Paths ===");

  const { data: products, error } = await admin
    .from("digital_products")
    .select("id, title, type, file_url, status")
    .order("created_at", { ascending: false });

  if (error || !products) {
    console.error("Failed to query digital_products:", error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products to audit.\n`);

  let verifiedCount = 0;
  let updatedCount = 0;
  let missingDeliverableCount = 0;

  for (const product of products) {
    if (!product.file_url) {
      console.log(`[NO FILE] ${product.title.slice(0, 45)} (ID: ${product.id})`);
      missingDeliverableCount++;
      continue;
    }

    const raw = product.file_url;
    const stripped = raw.replace(/^product-files\//, "").replace(/^\/+/, "");
    const prefixed = raw.startsWith("product-files/") ? raw : `product-files/${stripped}`;

    // Candidates in priority: stripped (clean root), prefixed (subfolder), raw
    const candidates = Array.from(new Set([stripped, prefixed, raw])).filter(Boolean);

    let workingPath = null;
    for (const candidate of candidates) {
      const { data } = await admin.storage.from("product-files").createSignedUrl(candidate, 10);
      if (data?.signedUrl) {
        workingPath = candidate;
        break;
      }
    }

    if (!workingPath) {
      console.warn(`[MISSING IN STORAGE] "${product.title}" - tested:`, candidates);
      missingDeliverableCount++;
      continue;
    }

    verifiedCount++;

    if (workingPath !== raw) {
      console.log(`[UPDATING] "${product.title.slice(0, 40)}"`);
      console.log(`   From: ${raw}`);
      console.log(`   To:   ${workingPath}`);

      const { error: updateErr } = await admin
        .from("digital_products")
        .update({ file_url: workingPath })
        .eq("id", product.id);

      if (updateErr) {
        console.error(`   ERROR updating product ${product.id}:`, updateErr);
      } else {
        updatedCount++;
        console.log(`   -> Successfully reconciled in database!`);
      }
    } else {
      console.log(`[OK] "${product.title.slice(0, 45)}" -> ${workingPath}`);
    }
  }

  console.log("\n=== Reconciliation Complete ===");
  console.log(`Total Products:         ${products.length}`);
  console.log(`Verified in Storage:    ${verifiedCount}`);
  console.log(`Reconciled in Database: ${updatedCount}`);
  console.log(`Without Files / Drafts: ${missingDeliverableCount}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
