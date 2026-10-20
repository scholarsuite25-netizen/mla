import { createAdminClient } from "@/lib/supabase/admin";

export const MEMBERSHIP_PRICE_NGN = 20000;

export type MembershipStatus = {
  isMember: boolean;
  membershipPaidAt: string | null;
  membershipTier: string | null;
};

/**
 * Checks whether a given user ID or email has active lifetime membership
 */
export async function checkIsMember(
  userId?: string | null,
  email?: string | null
): Promise<boolean> {
  const admin = createAdminClient();

  if (userId) {
    const { data: profile } = await admin
      .from("profiles")
      .select("is_member")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.is_member) return true;
  }

  if (email) {
    // Check if any profile or paid membership payment matches this email
    const { data: payments } = await admin
      .from("membership_payments")
      .select("id")
      .ilike("email", email.trim().toLowerCase())
      .eq("status", "paid")
      .limit(1);

    if (payments && payments.length > 0) return true;
  }

  return false;
}

/**
 * Activates membership for a user/email after confirmed payment
 */
export async function activateMembership({
  email,
  fullName,
  reference,
  amount = MEMBERSHIP_PRICE_NGN,
  paymentMethod = "paystack",
  userId,
}: {
  email: string;
  fullName: string;
  reference: string;
  amount?: number;
  paymentMethod?: string;
  userId?: string | null;
}) {
  const admin = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Record or update membership payment
  const { data: existingPayment } = await admin
    .from("membership_payments")
    .select("id")
    .eq("reference", reference)
    .maybeSingle();

  if (existingPayment) {
    await admin
      .from("membership_payments")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingPayment.id);
  } else {
    await admin.from("membership_payments").insert({
      user_id: userId || null,
      email: normalizedEmail,
      full_name: fullName,
      amount,
      payment_method: paymentMethod,
      reference,
      status: "paid",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // 2. If user profile exists, update profile
  if (userId) {
    await admin
      .from("profiles")
      .update({
        is_member: true,
        membership_tier: "lifetime",
        membership_paid_at: new Date().toISOString(),
        membership_reference: reference,
        membership_amount: amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  } else {
    // Try finding profile by email through auth admin
    try {
      const { data: usersData } = await admin.auth.admin.listUsers();
      const matchedUser = usersData.users.find(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );
      if (matchedUser) {
        await admin
          .from("profiles")
          .update({
            is_member: true,
            membership_tier: "lifetime",
            membership_paid_at: new Date().toISOString(),
            membership_reference: reference,
            membership_amount: amount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", matchedUser.id);
      }
    } catch (e) {
      console.warn("Could not match auth user by email during membership activation:", e);
    }
  }

  return { success: true };
}
