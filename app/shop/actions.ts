"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction, paystackConfigured, fetchTransaction } from "@/lib/paystack";
import { logAuditEvent } from "@/lib/audit";
import { checkIsMember } from "@/lib/membership";
import {
  validateCoupon,
  createBankTransferOrder,
  fulfillOrder,
  getStoreSettings,
  type CouponValidationResult,
  type BankTransferOrderResult,
  type StoreSettings,
} from "@/lib/store";

export type ActionResult = {
  error?: string;
  url?: string;
  orderId?: string;
  reference?: string;
  bankDetails?: StoreSettings;
  whatsappUrl?: string;
};

export type CartItemInput = {
  id: string;
  type: "product" | "bundle";
  price: number;
  title: string;
};

export type CheckoutInput =
  | string
  | {
      productId?: string;
      bundleId?: string;
      cartItems?: CartItemInput[];
      buyerName?: string;
      buyerEmail?: string;
      couponCode?: string;
    };

export async function getStoreSettingsAction(): Promise<StoreSettings> {
  return await getStoreSettings();
}

export async function validateCouponAction(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  return await validateCoupon(code, subtotal);
}

export async function verifyOrderPaymentAction(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, status, paystack_reference")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { success: false, error: "Order not found." };
  if (order.status === "paid") return { success: true };

  if (order.paystack_reference) {
    try {
      const data = await fetchTransaction(order.paystack_reference);
      if (data?.status === "success") {
        await fulfillOrder(order.id);
        revalidatePath(`/shop/delivery/${order.id}`);
        return { success: true };
      }
    } catch (e) {
      console.error("Paystack verify error:", e);
    }
  }

  return { success: false, error: "Payment not verified yet." };
}

export async function startBankTransferAction(input: {
  productId?: string;
  bundleId?: string;
  cartItems?: CartItemInput[];
  buyerName: string;
  buyerEmail: string;
  couponCode?: string;
  note?: string;
}): Promise<BankTransferOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return await createBankTransferOrder({
    ...input,
    buyerId: user?.id,
  });
}

export async function startCheckoutAction(
  input: CheckoutInput
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isObj = typeof input === "object" && input !== null;
  const productId = isObj ? input.productId : input;
  const bundleId = isObj ? input.bundleId : undefined;
  const cartItems = isObj ? input.cartItems : undefined;
  const couponCode = isObj ? input.couponCode : undefined;

  const hasCart = Array.isArray(cartItems) && cartItems.length > 0;

  const admin = createAdminClient();

  let email = isObj ? input.buyerEmail?.trim().toLowerCase() : "";
  let buyerName = isObj ? input.buyerName?.trim() : "";

  if (user) {
    let identity: { user: { email?: string } | null } | null = null;
    try {
      const res = await admin.auth.admin.getUserById(user.id);
      identity = res.data as { user: { email?: string } | null };
    } catch {
      identity = null;
    }
    email = identity?.user?.email ?? user.email ?? email;
    const { data: prof } = await admin.from("profiles").select("full_name").eq("id", user.id).single();
    buyerName = prof?.full_name ?? buyerName;
  }

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address for delivery." };
  }

  let itemTitle = "";
  let basePrice = 0;
  let isMembershipDeal = false;

  if (hasCart) {
    basePrice = cartItems.reduce((acc, i) => acc + Number(i.price), 0);
    itemTitle =
      cartItems.length === 1
        ? cartItems[0].title
        : `${cartItems[0].title} (+${cartItems.length - 1} more items)`;
  } else if (bundleId) {
    const { data: bundle } = await admin
      .from("product_bundles")
      .select("id, title, price, status")
      .eq("id", bundleId)
      .eq("status", "published")
      .maybeSingle();
    if (!bundle) return { error: "Bundle not found or not for sale yet." };
    itemTitle = bundle.title;
    basePrice = Number(bundle.price);
  } else if (productId) {
    const { data: product } = await admin
      .from("digital_products")
      .select("id, title, price, status, is_membership_deal")
      .eq("id", productId)
      .eq("status", "published")
      .maybeSingle();
    if (!product) return { error: "Material not found or not for sale yet." };
    itemTitle = product.title;
    basePrice = Number(product.price);
    isMembershipDeal = Boolean(product.is_membership_deal);
  } else {
    return { error: "No product or bundle selected." };
  }

  const isMember = await checkIsMember(user?.id, email);

  // Handle coupon discount
  let discountAmount = 0;
  let couponId: string | null = null;
  if (couponCode) {
    const cRes = await validateCoupon(couponCode, basePrice);
    if (cRes.valid && cRes.couponId && cRes.discountAmount !== undefined) {
      couponId = cRes.couponId;
      discountAmount = cRes.discountAmount;
    }
  }

  // Handle Lifetime Membership Benefits:
  // 1. If product is a Membership Deal and buyer is member -> 100% Free
  // 2. All active members enjoy 50% discount on all published items on the platform
  if (isMember) {
    if (isMembershipDeal) {
      discountAmount = basePrice;
    } else if (basePrice > 0) {
      const memberDiscount = Math.round(basePrice * 0.5);
      discountAmount = Math.max(discountAmount, memberDiscount);
    }
  }

  const finalAmount = Math.max(0, basePrice - discountAmount);

  // If final price is 0 (free or 100% coupon)
  if (finalAmount <= 0) {
    const { data: order, error: oErr } = await admin
      .from("orders")
      .insert({
        buyer_id: user?.id || null,
        buyer_name: buyerName || "Guest",
        buyer_email: email,
        product_id: hasCart ? (cartItems[0].type === "product" ? cartItems[0].id : null) : productId || null,
        bundle_id: hasCart ? (cartItems[0].type === "bundle" ? cartItems[0].id : null) : bundleId || null,
        amount: 0,
        status: "paid",
        coupon_id: couponId,
        discount_amount: discountAmount,
        paystack_reference: `free_${crypto.randomUUID()}`,
      })
      .select("id")
      .single();
    if (oErr) return { error: oErr.message };

    // Record order_items for cart
    if (hasCart) {
      for (const it of cartItems) {
        await admin.from("order_items").insert({
          order_id: order.id,
          product_id: it.type === "product" ? it.id : null,
          bundle_id: it.type === "bundle" ? it.id : null,
          title: it.title,
          unit_price: it.price,
          quantity: 1,
        });
      }
    }

    // Fulfill order & issue licenses
    await fulfillOrder(order.id);

    revalidatePath("/shop");
    return { url: `/shop/delivery/${order.id}?email=${encodeURIComponent(email)}` };
  }

  if (!paystackConfigured()) {
    return {
      error: "Online card checkout is currently being configured. You can use Direct Bank Transfer & WhatsApp below!",
    };
  }

  // Enforce Paystack NGN 100 minimum
  if (finalAmount < 100) {
    return {
      error: "Order total is below Paystack's ₦100 threshold. Please select Bank Transfer or add additional items.",
    };
  }

  const { data: order, error: oErr } = await admin
    .from("orders")
    .insert({
      buyer_id: user?.id || null,
      buyer_name: buyerName || "Guest",
      buyer_email: email,
      product_id: hasCart ? (cartItems[0].type === "product" ? cartItems[0].id : null) : productId || null,
      bundle_id: hasCart ? (cartItems[0].type === "bundle" ? cartItems[0].id : null) : bundleId || null,
      amount: finalAmount,
      coupon_id: couponId,
      discount_amount: discountAmount,
      status: "pending",
      payment_method: "paystack",
    })
    .select("id")
    .single();

  if (oErr) return { error: oErr.message };

  if (hasCart) {
    for (const it of cartItems) {
      await admin.from("order_items").insert({
        order_id: order.id,
        product_id: it.type === "product" ? it.id : null,
        bundle_id: it.type === "bundle" ? it.id : null,
        title: it.title,
        unit_price: it.price,
        quantity: 1,
      });
    }
  }

  await logAuditEvent({
    action: "order.created",
    targetTable: "orders",
    targetId: order.id,
    actorId: user?.id || null,
    actorEmail: email,
    category: "shop",
    severity: "info",
    details: {
      product_id: productId,
      bundle_id: bundleId,
      title: itemTitle,
      amount: finalAmount,
      discount: discountAmount,
    },
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
      amountKobo: Math.round(finalAmount * 100),
      reference,
      callbackUrl: `${origin}/shop/delivery/${order.id}?email=${encodeURIComponent(email)}`,
      metadata: { order_id: order.id, product_id: productId, bundle_id: bundleId },
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
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