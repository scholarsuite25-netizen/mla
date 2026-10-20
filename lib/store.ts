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
  buyerName,
  buyerEmail,
  buyerId,
  couponCode,
  note,
}: {
  productId?: string;
  bundleId?: string;
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

  if (bundleId) {
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
      product_id: productId || null,
      bundle_id: bundleId || null,
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

export async function approveBankTransferOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, buyer_id, buyer_name, buyer_email, product_id, bundle_id, amount, status, transfer_reference")
    .eq("id", orderId)
    .single();

  if (!order) return { success: false, error: "Order not found." };
  if (order.status === "paid") return { success: true }; // Already approved

  const buyerEmail = order.buyer_email || "";
  const buyerName = order.buyer_name || buyerEmail || "Valued Reader";
  const buyerIdentifier = order.buyer_id || order.buyer_email || order.id;

  const productIdsToIssue: string[] = [];

  if (order.bundle_id) {
    const { data: bundleItems } = await admin
      .from("product_bundle_items")
      .select("product_id")
      .eq("bundle_id", order.bundle_id);

    for (const item of bundleItems ?? []) {
      productIdsToIssue.push(item.product_id);
    }
  } else if (order.product_id) {
    productIdsToIssue.push(order.product_id);
  }

  if (productIdsToIssue.length === 0) {
    return { success: false, error: "No products associated with this order." };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mla.org.ng";
  const issuedLicenses: { title: string; key: string }[] = [];

  for (const pid of productIdsToIssue) {
    // Generate HMAC-SHA256 license
    const licenseKey = generateLicenseKey(pid, buyerIdentifier);

    const { error: licErr } = await admin.from("product_licenses").insert({
      order_id: order.id,
      product_id: pid,
      bundle_id: order.bundle_id || null,
      buyer_id: order.buyer_id || null,
      buyer_email: buyerEmail,
      license_key: licenseKey,
      max_activations: 5,
    });

    if (!licErr) {
      const { data: prod } = await admin.from("digital_products").select("title").eq("id", pid).single();
      issuedLicenses.push({
        title: prod?.title ?? "Lecture Notes",
        key: licenseKey,
      });
    }
  }

  // Mark order as paid
  await admin.from("orders").update({ status: "paid" }).eq("id", order.id);

  // Send delivery email with licenses & instructions
  if (buyerEmail) {
    const licensesHtml = issuedLicenses
      .map(
        (l) => `
        <div style="margin-bottom:12px;padding:12px;background:#f7f7f7;border-radius:6px;border-left:4px solid #D4AF37;">
          <strong style="color:#111;">${l.title}</strong><br/>
          <span style="font-family:monospace;font-size:15px;color:#333;">License Key: ${l.key}</span>
        </div>`
      )
      .join("");

    await sendTransactionalEmail({
      to: buyerEmail,
      subject: `Payment Confirmed: Access to Your Lecture Notes (${order.transfer_reference || "Order"})`,
      html: `
        <div style="font-family:sans-serif;line-height:1.6;color:#222;max-width:600px;margin:auto;">
          <h2 style="color:#111;">Payment Confirmed!</h2>
          <p>Hi ${buyerName},</p>
          <p>Your direct bank transfer for Order <strong>${order.transfer_reference}</strong> has been verified and confirmed.</p>
          <p>Here are your digital materials and license credentials:</p>
          ${licensesHtml}
          <p style="margin-top:20px;">
            <a href="${site}/dashboard/library" style="display:inline-block;padding:12px 24px;background:#D4AF37;color:#111;text-decoration:none;font-weight:bold;border-radius:30px;">
              Go to Your Library to Download
            </a>
          </p>
          <p style="font-size:12px;color:#777;margin-top:30px;">
            Each PDF will be forensically watermarked with your name and email upon download. Thank you for your support!
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
      type: "bank_transfer_approved",
      reference: order.transfer_reference,
      licensesIssued: issuedLicenses.length,
    },
  });

  return { success: true };
}
