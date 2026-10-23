import { createAdminClient } from "@/lib/supabase/admin";
import { generateLicenseKey } from "@/lib/licenses";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { logAuditEvent } from "@/lib/audit";
import { checkIsMember } from "@/lib/membership";

export type StoreSettings = {
  company_bank_name: string;
  company_account_number: string;
  company_account_name: string;
  whatsapp_number: string;
  whatsapp_instructions: string;
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("store_settings")
    .select("company_bank_name, company_account_number, company_account_name, whatsapp_number, whatsapp_instructions")
    .eq("id", "default")
    .maybeSingle();

  return {
    company_bank_name: data?.company_bank_name ?? "Zenith Bank",
    company_account_number: data?.company_account_number ?? "1012345678",
    company_account_name: data?.company_account_name ?? "Public Speaker Media Ltd",
    whatsapp_number: data?.whatsapp_number ?? "2348000000000",
    whatsapp_instructions: data?.whatsapp_instructions ?? "Transfer the exact amount to the bank account above and click the button to send your payment receipt on WhatsApp for instant activation.",
  };
}

export type CouponValidationResult = {
  valid: boolean;
  couponId?: string;
  code?: string;
  discountType?: "percent" | "fixed";
  discountValue?: number;
  discountAmount?: number;
  finalAmount?: number;
  error?: string;
};

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return { valid: false, error: "Please enter a coupon code." };

  const admin = createAdminClient();
  const { data: coupon } = await admin
    .from("coupons")
    .select("id, code, discount_type, discount_value, min_spend, max_uses, used_count, valid_until, is_active")
    .eq("code", cleanCode)
    .maybeSingle();

  if (!coupon || !coupon.is_active) {
    return { valid: false, error: "Coupon code is invalid or has expired." };
  }

  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { valid: false, error: "This coupon code has expired." };
  }

  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { valid: false, error: "This coupon code has reached its maximum redemptions." };
  }

  if (subtotal < Number(coupon.min_spend)) {
    return {
      valid: false,
      error: `This coupon requires a minimum purchase of ₦${Number(coupon.min_spend).toLocaleString()}.`,
    };
  }

  let discountAmount = 0;
  if (coupon.discount_type === "percent") {
    discountAmount = (subtotal * Number(coupon.discount_value)) / 100;
  } else {
    discountAmount = Number(coupon.discount_value);
  }

  discountAmount = Math.min(discountAmount, subtotal);
  const finalAmount = Math.max(0, subtotal - discountAmount);

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discount_type as "percent" | "fixed",
    discountValue: Number(coupon.discount_value),
    discountAmount,
    finalAmount,
  };
}

export type BankTransferOrderResult = {
  success: boolean;
  orderId?: string;
  reference?: string;
  amount?: number;
  discountAmount?: number;
  bankDetails?: StoreSettings;
  whatsappUrl?: string;
  error?: string;
};

export async function createBankTransferOrder({
  productId,
  bundleId,
  cartItems,
  buyerName,
  buyerEmail,
  buyerId,
  couponCode,
  note,
}: {
  productId?: string;
  bundleId?: string;
  cartItems?: { id: string; type: "product" | "bundle"; price: number; title: string }[];
  buyerName: string;
  buyerEmail: string;
  buyerId?: string;
  couponCode?: string;
  note?: string;
}): Promise<BankTransferOrderResult> {
  const admin = createAdminClient();

  if (!buyerEmail || !buyerEmail.includes("@")) {
    return { success: false, error: "A valid email address is required for delivery." };
  }
  if (!buyerName.trim()) {
    return { success: false, error: "Please enter your full name." };
  }

  let itemTitle = "";
  let basePrice = 0;
  let isMembershipDeal = false;

  const hasCart = Array.isArray(cartItems) && cartItems.length > 0;

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

    if (!bundle) return { success: false, error: "Selected bundle is not available." };
    itemTitle = bundle.title;
    basePrice = Number(bundle.price);
  } else if (productId) {
    const { data: prod } = await admin
      .from("digital_products")
      .select("id, title, price, status, is_membership_deal")
      .eq("id", productId)
      .eq("status", "published")
      .maybeSingle();

    if (!prod) return { success: false, error: "Selected material is not available." };
    itemTitle = prod.title;
    basePrice = Number(prod.price);
    isMembershipDeal = Boolean(prod.is_membership_deal);
  } else {
    return { success: false, error: "No product or bundle selected." };
  }

  const isMember = await checkIsMember(buyerId, buyerEmail);

  let discountAmount = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const cRes = await validateCoupon(couponCode, basePrice);
    if (cRes.valid && cRes.couponId && cRes.discountAmount !== undefined) {
      couponId = cRes.couponId;
      discountAmount = cRes.discountAmount;
    }
  }

  // Lifetime Member Discounts
  if (isMember) {
    if (isMembershipDeal) {
      discountAmount = basePrice;
    } else if (basePrice > 0) {
      const memberDiscount = Math.round(basePrice * 0.5);
      discountAmount = Math.max(discountAmount, memberDiscount);
    }
  }

  const finalAmount = Math.max(0, basePrice - discountAmount);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const transferRef = `MLA-BT-${Date.now().toString().slice(-4)}${randomSuffix}`;

  const { data: order, error: oErr } = await admin
    .from("orders")
    .insert({
      buyer_id: buyerId || null,
      buyer_name: buyerName.trim(),
      buyer_email: buyerEmail.trim().toLowerCase(),
      product_id: hasCart ? (cartItems[0].type === "product" ? cartItems[0].id : null) : productId || null,
      bundle_id: hasCart ? (cartItems[0].type === "bundle" ? cartItems[0].id : null) : bundleId || null,
      amount: finalAmount,
      payment_method: "bank_transfer",
      transfer_reference: transferRef,
      coupon_id: couponId,
      discount_amount: discountAmount,
      transfer_proof_note: note?.trim() || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (oErr) {
    return { success: false, error: `Could not create order: ${oErr.message}` };
  }

  // Insert individual items into order_items if cart checkout
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

  // Increment coupon redemption count if used
  if (couponId) {
    const { data: cData } = await admin.from("coupons").select("used_count").eq("id", couponId).single();
    if (cData) {
      await admin.from("coupons").update({ used_count: (cData.used_count || 0) + 1 }).eq("id", couponId);
    }
  }

  const settings = await getStoreSettings();

  // WhatsApp Deep Link URL
  const cleanPhone = settings.whatsapp_number.replace(/[^0-9]/g, "");
  const waMessage = encodeURIComponent(
    `Hello! I just placed an order via Direct Bank Transfer.\n\n` +
    `*Order Ref:* ${transferRef}\n` +
    `*Item:* ${itemTitle}\n` +
    `*Amount:* ₦${finalAmount.toLocaleString()}\n` +
    `*My Name:* ${buyerName.trim()}\n` +
    `*My Email:* ${buyerEmail.trim().toLowerCase()}\n\n` +
    `I am attaching my transfer receipt/screenshot below for confirmation:`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  await logAuditEvent({
    action: "order.created",
    targetTable: "orders",
    targetId: order.id,
    actorEmail: buyerEmail.trim(),
    category: "shop",
    severity: "info",
    details: {
      type: "bank_transfer",
      reference: transferRef,
      title: itemTitle,
      amount: finalAmount,
      discount: discountAmount,
    },
  });

  return {
    success: true,
    orderId: order.id,
    reference: transferRef,
    amount: finalAmount,
    discountAmount,
    bankDetails: settings,
    whatsappUrl,
  };
}

/**
 * Universal Order Fulfillment:
 * Marks order paid, inspects order_items / bundle / product, issues HMAC licenses,
 * and sends confirmation email with direct download links.
 */
export async function fulfillOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, buyer_id, buyer_name, buyer_email, product_id, bundle_id, amount, status, transfer_reference, paystack_reference")
    .eq("id", orderId)
    .single();

  if (!order) return { success: false, error: "Order not found." };

  const buyerEmail = order.buyer_email || "";
  const buyerName = order.buyer_name || buyerEmail || "Valued Reader";
  const buyerIdentifier = order.buyer_id || order.buyer_email || order.id;

  const productIdsToIssue: { pid: string; bundleId?: string | null }[] = [];

  // 1. Check order_items first
  const { data: orderItems } = await admin
    .from("order_items")
    .select("product_id, bundle_id")
    .eq("order_id", order.id);

  if (orderItems && orderItems.length > 0) {
    for (const item of orderItems) {
      if (item.product_id) {
        productIdsToIssue.push({ pid: item.product_id, bundleId: item.bundle_id });
      }
      if (item.bundle_id) {
        const { data: bundleItems } = await admin
          .from("product_bundle_items")
          .select("product_id")
          .eq("bundle_id", item.bundle_id);
        for (const bi of bundleItems ?? []) {
          productIdsToIssue.push({ pid: bi.product_id, bundleId: item.bundle_id });
        }
      }
    }
  }

  // 2. Fallback to order.bundle_id or order.product_id
  if (productIdsToIssue.length === 0) {
    if (order.bundle_id) {
      const { data: bundleItems } = await admin
        .from("product_bundle_items")
        .select("product_id")
        .eq("bundle_id", order.bundle_id);
      for (const item of bundleItems ?? []) {
        productIdsToIssue.push({ pid: item.product_id, bundleId: order.bundle_id });
      }
    } else if (order.product_id) {
      productIdsToIssue.push({ pid: order.product_id });
    }
  }

  if (productIdsToIssue.length === 0) {
    return { success: false, error: "No products associated with this order." };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mla.org.ng";
  const issuedLicenses: { title: string; key: string }[] = [];

  for (const item of productIdsToIssue) {
    // Check if license was already issued
    const { data: existingLic } = await admin
      .from("product_licenses")
      .select("id, license_key")
      .eq("order_id", order.id)
      .eq("product_id", item.pid)
      .maybeSingle();

    if (existingLic) {
      const { data: prod } = await admin.from("digital_products").select("title").eq("id", item.pid).single();
      issuedLicenses.push({
        title: prod?.title ?? "Lecture Notes",
        key: existingLic.license_key,
      });
      continue;
    }

    // Generate cryptographic license
    const licenseKey = generateLicenseKey(item.pid, buyerIdentifier);

    const { error: licErr } = await admin.from("product_licenses").insert({
      order_id: order.id,
      product_id: item.pid,
      bundle_id: item.bundleId || null,
      buyer_id: order.buyer_id || null,
      buyer_email: buyerEmail,
      license_key: licenseKey,
      max_activations: 5,
    });

    if (!licErr) {
      const { data: prod } = await admin.from("digital_products").select("title").eq("id", item.pid).single();
      issuedLicenses.push({
        title: prod?.title ?? "Lecture Notes",
        key: licenseKey,
      });
    }
  }

  // Mark order as paid
  await admin.from("orders").update({ status: "paid" }).eq("id", order.id);

  // Send delivery email with licenses & instructions
  if (buyerEmail && order.status !== "paid") {
    const licensesHtml = issuedLicenses
      .map(
        (l) => `
        <div style="margin-bottom:12px;padding:12px;background:#f8fafc;border-radius:8px;border-left:4px solid #00D2FF;">
          <strong style="color:#0f172a;font-size:14px;">${l.title}</strong><br/>
          <span style="font-family:monospace;font-size:13px;color:#0284c7;font-weight:bold;">License Key: ${l.key}</span>
        </div>`
      )
      .join("");

    const deliveryUrl = `${site}/shop/delivery/${order.id}?email=${encodeURIComponent(buyerEmail)}`;

    await sendTransactionalEmail({
      to: buyerEmail,
      subject: `Your Downloads Are Ready: Order ${order.transfer_reference || order.paystack_reference || order.id.slice(0, 8)}`,
      html: `
        <div style="font-family:sans-serif;line-height:1.6;color:#1e293b;max-width:600px;margin:auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#0f172a;margin-top:0;">Your Digital Downloads Are Ready!</h2>
          <p>Hi ${buyerName},</p>
          <p>Thank you for your order. Your digital publication licenses have been generated and authenticated.</p>
          ${licensesHtml}
          <div style="margin:24px 0;">
            <a href="${deliveryUrl}" style="display:inline-block;padding:14px 28px;background:#00D2FF;color:#0a0e2a;text-decoration:none;font-weight:bold;border-radius:10px;font-size:14px;">
              Download Your Files Now →
            </a>
          </div>
          <p style="font-size:12px;color:#64748b;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;">
            You can also access your licensed toolkits anytime from your MLA Member Library. Each PDF document contains a forensic cryptographic watermark embedding your buyer credentials.
          </p>
        </div>
      `,
    }).catch((err) => console.error("Email send failed:", err));
  }

  await logAuditEvent({
    action: "order.paid",
    targetTable: "orders",
    targetId: order.id,
    actorEmail: buyerEmail,
    category: "shop",
    severity: "notice",
    details: {
      type: order.transfer_reference ? "bank_transfer" : (order.paystack_reference ? "paystack" : "free_or_direct"),
      reference: order.transfer_reference || order.paystack_reference || "N/A",
      licensesIssued: issuedLicenses.length,
    },
  });

  return { success: true };
}

export async function approveBankTransferOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  return await fulfillOrder(orderId);
}
