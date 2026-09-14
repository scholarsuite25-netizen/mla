"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/resend";

export type ActionResult = { error?: string };

// Super Admin final approval of a mentorship match (spec §8 Phase 3).
// Sets status 'approved', records audit, notifies both parties and sends
// transactional email via Resend.
export async function approveRequestAction(requestId: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

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
    actor_id: user.id,
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

  // Emails (Resend, transactional).
  const { data: usersResp } = await admin.auth.admin.listUsers();
  const users = (usersResp?.users ?? []) as {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string };
  }[];
  const byId = new Map(
    users.map((u) => [u.id, { email: u.email ?? "", full_name: u.user_metadata?.full_name ?? "" }])
  );
  const mentee = byId.get(request.mentee_id);
  const mentor = byId.get(request.mentor_id);

  const subject = "Your MLA mentorship match is approved";
  const html = `<p>Congratulations — your mentorship match on MLA has been approved.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/requests">View it in your dashboard</a></p>`;

  if (mentee?.email && process.env.RESEND_API_KEY) {
    await sendTransactionalEmail({ to: mentee.email, subject, html }).catch((e) =>
      console.error("Resend to mentee failed:", e)
    );
  }
  if (mentor?.email && process.env.RESEND_API_KEY) {
    await sendTransactionalEmail({ to: mentor.email, subject, html }).catch((e) =>
      console.error("Resend to mentor failed:", e)
    );
  }

  revalidatePath("/admin/requests");
  revalidatePath("/dashboard/requests");
  return {};
}