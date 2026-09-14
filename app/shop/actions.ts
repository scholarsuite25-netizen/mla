"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction, paystackConfigured } from "@/lib/paystack";

export type ActionResult = { error?: string; url?: string };

export async function startCheckoutAction(productId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to purchase." };

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

  const reference = `mla_${order.id}`;
  await admin.from("orders").update({ paystack_reference: reference }).eq("id", order.id);

  if (!paystackConfigured()) {
    await admin.from("orders").delete().eq("id", order.id);
    return { error: "Checkout is not set up yet — the operator needs to add Paystack keys." };
  }

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
    await admin.from("orders").delete().eq("id", order.id);
    return { error: err instanceof Error ? err.message : "Checkout failed." };
  }
}