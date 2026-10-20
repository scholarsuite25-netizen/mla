"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction, paystackConfigured } from "@/lib/paystack";
import { getStoreSettings, type StoreSettings } from "@/lib/store";
import { MEMBERSHIP_PRICE_NGN, checkIsMember } from "@/lib/membership";

export type MembershipActionResult = {
  error?: string;
  url?: string;
  reference?: string;
  bankDetails?: StoreSettings;
  whatsappUrl?: string;
  success?: boolean;
};

export async function getMembershipStatusAction(): Promise<{
  isMember: boolean;
  userEmail?: string;
  userName?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isMember: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_member")
    .eq("id", user.id)
    .maybeSingle();

  return {
    isMember: Boolean(profile?.is_member),
    userEmail: user.email,
    userName: profile?.full_name ?? undefined,
  };
}

export async function joinMembershipAction(input: {
  fullName: string;
  email: string;
  paymentMethod: "paystack" | "bank_transfer";
  transferNote?: string;
}): Promise<MembershipActionResult> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }
  if (!fullName) {
    return { error: "Please enter your full name." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if already a member
  const alreadyMember = await checkIsMember(user?.id, email);
  if (alreadyMember) {
    return { error: "You are already an active MLA Lifetime Member!" };
  }

  const admin = createAdminClient();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const reference = `mla_membership_${Date.now().toString().slice(-4)}${randomSuffix}`;

  // 1. Bank Transfer Option
  if (input.paymentMethod === "bank_transfer") {
    const { error: insertErr } = await admin.from("membership_payments").insert({
      user_id: user?.id || null,
      email,
      full_name: fullName,
      amount: MEMBERSHIP_PRICE_NGN,
      payment_method: "bank_transfer",
      reference,
      status: "pending",
      transfer_proof_note: input.transferNote?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertErr) {
      return { error: `Could not initiate membership transfer: ${insertErr.message}` };
    }

    const bankDetails = await getStoreSettings();
    const whatsappClean = (bankDetails.whatsapp_number || "2348034710699").replace(/[^0-9]/g, "");
    const waText = encodeURIComponent(
      `Hello Tintol Business Services! I just made a transfer of ₦20,000 for MLA Lifetime Membership.\n\nName: ${fullName}\nEmail: ${email}\nReference: ${reference}\n\nPlease confirm my membership activation.`
    );
    const whatsappUrl = `https://wa.me/${whatsappClean}?text=${waText}`;

    return {
      success: true,
      reference,
      bankDetails,
      whatsappUrl,
    };
  }

  // 2. Paystack Instant Online Card Option
  if (!paystackConfigured()) {
    return {
      error:
        "Online card payment is currently in maintenance. Please use Direct Bank Transfer below for instant WhatsApp activation!",
    };
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://mla.org.ng"}/membership?payment=success&ref=${reference}`;

  // Record pending payment
  await admin.from("membership_payments").insert({
    user_id: user?.id || null,
    email,
    full_name: fullName,
    amount: MEMBERSHIP_PRICE_NGN,
    payment_method: "paystack",
    reference,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  try {
    const paystackRes = await initializeTransaction({
      email,
      amountKobo: MEMBERSHIP_PRICE_NGN * 100, // 20,000 NGN in Kobo = 2,000,000
      reference,
      callbackUrl,
      metadata: {
        type: "membership",
        fullName,
        email,
        userId: user?.id || null,
      },
    });

    return {
      url: paystackRes.authorization_url,
      reference,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not connect to payment gateway. Please try Bank Transfer.",
    };
  }
}
