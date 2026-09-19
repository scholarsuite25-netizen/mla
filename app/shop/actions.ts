"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction, paystackConfigured } from "@/lib/paystack";
import { generateLicenseKey } from "@/lib/licenses";
import { logAuditEvent } from "@/lib/audit";

export type ActionResult = { error?: string; url?: string };

export async function startCheckoutAction(productId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to purchase." };

  if (!paystackConfigured()) {
    return { error: "Checkout is not set up yet — the operator needs to add Paystack keys." };
  }

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("digital_products")
    .select("id,title,price,status")
    .eq("id", productId)
    .eq("status", "published")
    .maybeSingle();
  if (!product) return { error: "Product not found or not for sale yet." };

  let identity: { user: { email?: string } | null } | null = null;
  try {
    const res = await admin.auth.admin.getUserById(user.id);
    identity = res.data as { user: { email?: string } | null };
  } catch {
    identity = null;
  }
  const email = identity?.user?.email ?? user.email;
  if (!email) return { error: "Could not determine your email." };

  // Sweep abandoned pending checkouts so rows don't accumulate per click.
  await admin
    .from("orders")
    .delete()
    .eq("buyer_id", user.id)
    .eq("product_id", product.id)
    .eq("status", "pending");

  // If the product is free, bypass Paystack entirely.
  if (Number(product.price) <= 0) {
    const { data: order, error: oErr } = await admin
      .from("orders")
      .insert({
        buyer_id: user.id,
        product_id: product.id,
        amount: 0,
        status: "paid",
        paystack_reference: `free_${crypto.randomUUID()}`
      })
      .select("id")
      .single();
    if (oErr) return { error: oErr.message };

    let licenseKey: string;
    try {
      licenseKey = generateLicenseKey(product.id, user.id);
    } catch {
      return { error: "Could not generate license key." };
    }

    const { error: licError } = await admin.from("product_licenses").insert({
      order_id: order.id,
      product_id: product.id,
      buyer_id: user.id,
      license_key: licenseKey,
      max_activations: 3,
    });
    if (licError) return { error: licError.message };

    revalidatePath("/shop");
    return { url: "/dashboard/library" };
  }



  const { data: order, error: oErr } = await admin
    .from("orders")
    .insert({
      buyer_id: user.id,
      product_id: product.id,
      amount: Number(product.price),
      status: "pending",
    })
    .select("id")
    .single();
  if (oErr) return { error: oErr.message };

  await logAuditEvent({
    action: "order.created",
    targetTable: "orders",
    targetId: order.id,
    actorId: user.id,
    actorEmail: email,
    category: "shop",
    severity: "info",
    details: { product_id: product.id, title: product.title, amount: Number(product.price) },
  });

  const reference = `mla_${order.id}`;
  await admin.from("orders").update({ paystack_reference: reference }).eq("id", order.id);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const origin = /^https?:\/\//.test(host)
    ? host
    : `https://${host || (process.env.NEXT_PUBLIC_SITE_URL ?? "localhost:3000")}`;

  try {
    const { authorization_url } = await initializeTransaction({
      email,
      amountKobo: Number(product.price) * 100,
      reference,
      callbackUrl: `${origin}/dashboard/library`,
      metadata: { order_id: order.id, product_id: product.id },
    });
    revalidatePath("/shop");
    return { url: authorization_url };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Checkout could not be initialized.";
    await admin.from("orders").delete().eq("id", order.id);
    return { error: errMsg };
  }
}

export async function submitReviewAction(formData: FormData): Promise<ActionResult> {
  const productId = String(formData.get("product_id") ?? "");
  const rating = Number(formData.get("rating"));
  const reviewText = String(formData.get("review_text") ?? "");

  if (!productId || isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Invalid review data." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to review." };

  const { error } = await supabase.from("product_reviews").upsert(
    {
      product_id: productId,
      buyer_id: user.id,
      rating,
      review_text: reviewText,
    },
    { onConflict: "product_id,buyer_id" }
  );

  if (error) return { error: error.message };
  
  revalidatePath("/shop");
  revalidatePath(`/shop/${productId}`);
  return {};
}