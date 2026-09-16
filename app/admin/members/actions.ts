"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSuperAdmin } from "@/lib/auth-guard";

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

  return {
    success: true,
    resetLink: data?.properties?.action_link ?? undefined,
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
