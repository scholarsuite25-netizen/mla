"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { assertSuperAdmin } from "@/lib/auth-guard";

export type ActionResult = { error?: string };

// Super Admin final approval of a mentorship match (spec §8 Phase 3).
export async function approveRequestAction(requestId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { data: request } = await admin
    .from("mentorship_requests")
    .select("id,status,mentee_id,mentor_id")
    .eq("id", requestId)
    .single();
  if (!request) return { error: "Request not found." };
  if (request.status !== "accepted") return { error: "Only accepted requests can be approved." };

  const { error } = await admin
    .from("mentorship_requests")
    .update({ status: "approved" })
    .eq("id", requestId);
  if (error) return { error: error.message };

  // Audit trail.
  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: "mentorship.approve",
    target_table: "mentorship_requests",
    target_id: request.id,
  });

  // In-app notifications for both parties.
  await admin.from("notifications").insert([
    {
      profile_id: request.mentee_id,
      type: "mentorship",
      reference_id: request.id,
      message: "Your mentorship match has been approved. You can now begin!",
    },
    {
      profile_id: request.mentor_id,
      type: "mentorship",
      reference_id: request.id,
      message: "Your mentorship match has been approved. You can now begin!",
    },
  ]);

  // Emails (Resend, transactional). Direct lookups avoid the listUsers first-page
  // truncation bug (default page would miss recipients once >50 users exist).
  const [menteeIdentity, mentorIdentity] = await Promise.all([
    admin.auth.admin.getUserById(request.mentee_id).catch(() => ({ data: { user: null } })),
    admin.auth.admin.getUserById(request.mentor_id).catch(() => ({ data: { user: null } })),
  ]);
  const menteeEmail = (menteeIdentity.data as { user?: { email?: string } | null } | null)?.user?.email;
  const mentorEmail = (mentorIdentity.data as { user?: { email?: string } | null } | null)?.user?.email;

  const subject = "Your MLA mentorship match is approved";
  const html = `<p>Congratulations — your mentorship match on MLA has been approved.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mla.org.ng"}/dashboard/requests">View it in your dashboard</a></p>`;

  if (menteeEmail && process.env.RESEND_API_KEY) {
    await sendTransactionalEmail({ to: menteeEmail, subject, html }).catch((e) =>
      console.error("Resend to mentee failed:", e)
    );
  }
  if (mentorEmail && process.env.RESEND_API_KEY) {
    await sendTransactionalEmail({ to: mentorEmail, subject, html }).catch((e) =>
      console.error("Resend to mentor failed:", e)
    );
  }

  revalidatePath("/admin/requests");
  revalidatePath("/dashboard/requests");
  return {};
}

// Super Admin approves a member's self-request to administer their institution.
export async function approveInstitutionAdminRequestAction(requestId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { data: req } = await admin
    .from("institution_admin_requests")
    .select("id,profile_id,institution_id,status,institutions(name)")
    .eq("id", requestId)
    .single();
  if (!req) return { error: "Request not found." };
  if (req.status !== "pending") return { error: "This request is no longer pending." };

  const { error: upReqError } = await admin
    .from("institution_admin_requests")
    .update({ status: "approved" })
    .eq("id", requestId);
  if (upReqError) return { error: upReqError.message };

  // Promote the member to institution_admin.
  const { error: profError } = await admin
    .from("profiles")
    .update({ role: "institution_admin", institution_id: req.institution_id })
    .eq("id", req.profile_id);
  if (profError) return { error: profError.message };

  const instRaw = req.institutions;
  const instName = Array.isArray(instRaw)
    ? instRaw[0]?.name
    : (instRaw as { name: string } | null)?.name ?? "your institution";

  // Audit trail.
  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: "institution_admin.approve",
    target_table: "institution_admin_requests",
    target_id: req.id,
  });

  // Notify member.
  await admin.from("notifications").insert({
    profile_id: req.profile_id,
    type: "admin_role",
    reference_id: req.id,
    message: `Congratulations! Your request to administer ${instName} has been approved.`,
  });

  revalidatePath("/admin/requests");
  revalidatePath("/dashboard/requests");
  revalidatePath("/dashboard");
  return {};
}

// Super Admin rejects a member's request to administer an institution.
export async function rejectInstitutionAdminRequestAction(requestId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { data: req } = await admin
    .from("institution_admin_requests")
    .select("id,profile_id,institutions(name)")
    .eq("id", requestId)
    .single();
  if (!req) return { error: "Request not found." };

  const { error: upReqError } = await admin
    .from("institution_admin_requests")
    .update({ status: "rejected" })
    .eq("id", requestId);
  if (upReqError) return { error: upReqError.message };

  const instRaw = req.institutions;
  const instName = Array.isArray(instRaw)
    ? instRaw[0]?.name
    : (instRaw as { name: string } | null)?.name ?? "your institution";

  // Audit trail.
  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: "institution_admin.reject",
    target_table: "institution_admin_requests",
    target_id: req.id,
  });

  // Notify member.
  await admin.from("notifications").insert({
    profile_id: req.profile_id,
    type: "admin_role",
    reference_id: req.id,
    message: `Your request to administer ${instName} was not approved.`,
  });

  revalidatePath("/admin/requests");
  revalidatePath("/dashboard/requests");
  return {};
}