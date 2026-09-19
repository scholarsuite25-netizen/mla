"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSuperAdmin } from "@/lib/auth-guard";
import { sendTransactionalEmail } from "@/lib/email/resend";

export type ActionResult = { error?: string; success?: boolean; resetLink?: string };

export type MemberActivitySummary = {
  coursesCount: number;
  ordersCount: number;
  licensesCount: number;
  courses: { id: string; title: string }[];
  orders: { id: string; amount: number; created_at: string; title: string }[];
};

export async function updateMemberRole(formData: FormData): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const profileId = formData.get("profileId") as string;
  const newRole = formData.get("role") as string;
  if (!profileId || !newRole) return { error: "Missing member ID or role." };

  const validRoles = ["super_admin", "institution_admin", "faculty", "mentor", "scholar"];
  if (!validRoles.includes(newRole)) {
    return { error: "Invalid role specified." };
  }

  const admin = createAdminClient();

  // Prevent self-demotion from super_admin to avoid accidental lockout
  if (profileId === actor.id && newRole !== "super_admin") {
    return { error: "You cannot demote your own Super Administrator account." };
  }

  const { error } = await admin
    .from("profiles")
    .update({ role: newRole })
    .eq("id", profileId);

  if (error) return { error: error.message };

  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: `member.role_changed_to_${newRole}`,
    target_table: "profiles",
    target_id: profileId,
  });

  revalidatePath("/admin/members");
  return { success: true };
}

export async function toggleMemberStatus(formData: FormData): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const profileId = formData.get("profileId") as string;
  const currentActive = formData.get("isActive") === "true";
  if (!profileId) return { error: "Missing member ID." };

  // Prevent freezing one's own account
  if (profileId === actor.id && currentActive) {
    return { error: "You cannot suspend your own Super Administrator account." };
  }

  const admin = createAdminClient();
  const nextStatus = !currentActive;

  const { error } = await admin
    .from("profiles")
    .update({ is_active: nextStatus })
    .eq("id", profileId);

  if (error) return { error: error.message };

  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: nextStatus ? "member.reinstated" : "member.suspended",
    target_table: "profiles",
    target_id: profileId,
  });

  revalidatePath("/admin/members");
  return { success: true };
}

export async function sendPasswordResetAction(
  profileId: string,
  email: string
): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  if (!email) return { error: "No email address found for this user." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (error) return { error: error.message };

  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: "member.password_reset_generated",
    target_table: "profiles",
    target_id: profileId,
  });

  const resetLink = (data?.properties?.action_link as string | undefined) ?? undefined;

  // Actually dispatch the recovery email to the member.
  if (resetLink) {
    try {
      await sendTransactionalEmail({
        to: email,
        subject: "Reset your MLA Academy password",
        html: `<!DOCTYPE html>
<html>
<body style="margin:0;background:#0a0806;font-family:Georgia,serif;color:#faf6ee;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0806;padding:40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#18130f;border:1px solid #d4af37;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:28px 32px 8px;text-align:center;">
            <h1 style="margin:0;color:#d4af37;font-size:22px;">MLA Academy</h1>
            <p style="color:#b8ada0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Mentorship &amp; Leadership Academy</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 8px;">
            <p style="margin:0 0 12px;color:#faf6ee;font-size:16px;line-height:1.5;">Hello,</p>
            <p style="margin:0 0 12px;color:#faf6ee;font-size:14px;line-height:1.6;">We received a request to reset your password. Use the secure link below to create a new one. This link expires in 60 minutes and can only be used once.</p>
            <p style="text-align:center;margin:20px 0;">
              <a href="${resetLink}" style="background:#dc2626;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:bold;">Reset Password</a>
            </p>
            <p style="margin:0 0 12px;color:#b8ada0;font-size:12px;line-height:1.5;">If the button above does not work, copy and paste this link into your browser:</p>
            <p style="margin:0 0 12px;color:#d4af37;font-size:11px;word-break:break-all;">${resetLink}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 24px;text-align:center;">
            <p style="margin:0;color:#b8ada0;font-size:11px;line-height:1.5;">If you did not request this, you can safely ignore this email — your password will remain unchanged.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`,
      });
    } catch (emailErr) {
      console.error("Failed to send password reset email:", emailErr);
      return {
        error:
          "Recovery link generated but the email could not be sent. Share the backup link with the member instead.",
        resetLink,
      };
    }
  }

  revalidatePath("/admin/members");
  return {
    success: true,
    resetLink,
  };
}

export async function getMemberActivityAction(
  profileId: string
): Promise<{ activity?: MemberActivitySummary; error?: string }> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();

  const [
    { data: enrollments },
    { data: orders },
    { count: licensesCount },
  ] = await Promise.all([
    admin
      .from("course_enrollments")
      .select("course_id, courses(id, title)")
      .eq("profile_id", profileId),
    admin
      .from("orders")
      .select("id, amount, created_at, status, digital_products(title)")
      .eq("buyer_id", profileId)
      .eq("status", "paid")
      .order("created_at", { ascending: false }),
    admin
      .from("product_licenses")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", profileId)
      .eq("is_revoked", false),
  ]);

  const courses = (enrollments ?? [])
    .map((e) => {
      const c = Array.isArray(e.courses) ? e.courses[0] : e.courses;
      return c as { id: string; title: string } | null;
    })
    .filter(Boolean) as { id: string; title: string }[];

  const formattedOrders = (orders ?? []).map((o) => {
    const p = Array.isArray(o.digital_products)
      ? o.digital_products[0]
      : o.digital_products;
    return {
      id: o.id,
      amount: Number(o.amount || 0),
      created_at: o.created_at,
      title: (p as { title: string } | null)?.title ?? "Digital Item",
    };
  });

  return {
    activity: {
      coursesCount: courses.length,
      ordersCount: formattedOrders.length,
      licensesCount: licensesCount ?? 0,
      courses,
      orders: formattedOrders,
    },
  };
}
