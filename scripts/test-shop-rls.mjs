/**
 * Phase 5 — Shop RLS verification.
 * Run: node scripts/test-shop-rls.mjs
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(URL, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(URL, ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let failures = 0;

function check(name, ok, extra = "") {
  if (ok) console.log(`PASS: ${name}`);
  else {
    failures++;
    console.log(`FAIL: ${name} ${extra}`);
  }
}

async function makeUser(email, role) {
  const { data } = await admin.auth.admin.createUser({
    email,
    password: "TestPass123!",
    email_confirm: true,
  });
  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", data.user.id);
  if (error) throw new Error(`profile update failed: ${error.message}`);
  return data.user.id;
}

async function signInAs(email) {
  const { data } = await anon.auth.signInWithPassword({
    email,
    password: "TestPass123!",
  });
  return createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
  });
}

async function cleanup(ids) {
  for (const id of ids) await admin.auth.admin.deleteUser(id).catch(() => {});
}

async function main() {
  const ts = Date.now();
  const superU = await makeUser(`super-shop-${ts}@test.local`, "super_admin");
  const buyerA = await makeUser(`buyer-a-shop-${ts}@test.local`, "member");
  const buyerB = await makeUser(`buyer-b-shop-${ts}@test.local`, "member");

  const cSuper = await signInAs(`super-shop-${ts}@test.local`);
  const cA = await signInAs(`buyer-a-shop-${ts}@test.local`);
  const cB = await signInAs(`buyer-b-shop-${ts}@test.local`);

  try {
    // -- super admin creates products (insert policy) ----------------
    const { data: published, error: ePub } = await cSuper
      .from("digital_products")
      .insert({ title: `Pub ${ts}`, type: "pdf", price: 5000, status: "published" })
      .select("id")
      .single();
    check("super admin creates published product", !ePub && !!published, ePub?.message);

    const { data: draft, error: eDraft } = await cSuper
      .from("digital_products")
      .insert({ title: `Draft ${ts}`, type: "ebook", price: 3000, status: "draft" })
      .select("id")
      .single();
    check("super admin creates draft product", !eDraft && !!draft, eDraft?.message);

    // -- a member cannot create products ------------------------------
    const { error: eMemberProduct } = await cA
      .from("digital_products")
      .insert({ title: "x", type: "pdf", price: 1, status: "published" });
    check("member cannot create products", !!eMemberProduct, "should be blocked");

    // -- visibility: published only ------------------------------------
    const { data: anonView } = await anon.from("digital_products").select("id,title");
    const anonTitles = anonView?.map((p) => p.title) ?? [];
    check("anon sees published products", anonTitles.includes(`Pub ${ts}`));
    check("anon cannot see draft products", !anonTitles.includes(`Draft ${ts}`));

    const { data: aView } = await cA.from("digital_products").select("id,title");
    const aTitles = aView?.map((p) => p.title) ?? [];
    check("member sees published products", aTitles.includes(`Pub ${ts}`));
    check("member cannot see draft products", !aTitles.includes(`Draft ${ts}`));

    // -- a member cannot create an order (server-side only) ------------
    const { error: eOrderInsert } = await cA.from("orders").insert({
      buyer_id: buyerA,
      product_id: published.id,
      amount: 5000,
      status: "paid",
    });
    check("member cannot create orders (RLS)", !!eOrderInsert, "should be blocked");

    // -- service role issues order + license for buyer A ----------------
    const { data: orderA, error: eOrderSvc } = await admin
      .from("orders")
      .insert({
        buyer_id: buyerA,
        product_id: published.id,
        amount: 5000,
        paystack_reference: `mla_test_${ts}`,
        status: "paid",
      })
      .select("id")
      .single();
    check("service issues paid order", !eOrderSvc && !!orderA, eOrderSvc?.message);

    const { data: licA, error: eLic } = await admin
      .from("product_licenses")
      .insert({
        order_id: orderA.id,
        product_id: published.id,
        buyer_id: buyerA,
        license_key: `MLA-TEST-${ts}`,
        max_activations: 3,
      })
      .select("id")
      .single();
    check("service creates license for buyer A", !eLic && !!licA, eLic?.message);

    // -- buyer A sees own order + license; buyer B does not ------------
    const { data: aOrders } = await cA.from("orders").select("paystack_reference");
    check("buyer A sees own order", (aOrders ?? []).some((o) => o.paystack_reference === `mla_test_${ts}`));

    const { data: aLics } = await cA.from("product_licenses").select("license_key");
    check("buyer A sees own license", (aLics ?? []).some((l) => l.license_key === `MLA-TEST-${ts}`));

    const { data: bOrders } = await cB.from("orders").select("paystack_reference");
    check("buyer B cannot see A's order", !(bOrders ?? []).some((o) => o.paystack_reference === `mla_test_${ts}`));

    const { data: bLics } = await cB.from("product_licenses").select("license_key");
    check("buyer B cannot see A's license", !(bLics ?? []).some((l) => l.license_key === `MLA-TEST-${ts}`));

    // -- members cannot write licenses / activations -------------------
    const { error: eLicWrite } = await cB
      .from("product_licenses")
      .insert({ order_id: orderA.id, product_id: published.id, buyer_id: buyerB, license_key: "MLA-X" });
    check("member cannot write licenses", !!eLicWrite, "should be blocked");

    const { error: eActWrite } = await cB
      .from("license_activations")
      .insert({ license_id: licA.id, device_fingerprint: "x" });
    check("member cannot write activations", !!eActWrite, "should be blocked");

    // -- super admin sees all orders and licenses ----------------------
    const { data: allOrders } = await cSuper.from("orders").select("id");
    check("super admin sees all orders", (allOrders ?? []).length >= 1);

    const { data: allLics } = await cSuper.from("product_licenses").select("id");
    check("super admin sees all licenses", (allLics ?? []).length >= 1);

    // -- private storage: anon cannot read product-files bucket ----
    const { data: bucketList, error: listErr } = await anon.storage.from("product-files").list();
    check(
      "anon cannot read private product files",
      !!listErr || (bucketList ?? []).length === 0,
      JSON.stringify({ err: listErr?.message, n: bucketList?.length })
    );

    const { data: signedData, error: signedErr } = await anon.storage
      .from("product-files")
      .createSignedUrl("missing.pdf", 60);
    check("anon cannot create signed URLs in private bucket", !!signedErr, signedData?.signedUrl ?? "");
  } finally {
    await cleanup([superU, buyerA, buyerB]);
  }

  console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("FATAL", e.message);
  process.exit(1);
});