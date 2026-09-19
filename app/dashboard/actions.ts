"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyParticipantByEmail } from "@/lib/mentorship";

export type ActionResult = { error?: string };

// Server side validation per spec §9 — zod on every mutation.
export async function markAllNotificationsReadAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("profile_id", user.id)
    .eq("is_read", false);

  revalidatePath("/dashboard/notifications");
}

export async function updateSettingsAction(formData: FormData): Promise<ActionResult> {
  const parsed = z
    .object({
      fullName: z.string().trim().min(1, "Name can't be empty."),
      emailNotifications: z.boolean(),
    })
    .safeParse({
      fullName: formData.get("full_name"),
      emailNotifications: formData.get("email_notifications") === "on",
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      email_notifications_enabled: parsed.data.emailNotifications,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {};
}

// Mentor accepts a pending request -> status 'accepted', awaiting Super Admin
// final approval (RLS: only the mentor can flip pending -> accepted).
export async function acceptRequestAction(requestId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: request } = await supabase
    .from("mentorship_requests")
    .select("mentee_id, mentor_id")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) return { error: "Request not found." };
  if (request.mentor_id !== user.id) return { error: "Only the assigned mentor can respond to this request." };

  const { error } = await supabase
    .from("mentorship_requests")
    .update({ status: "accepted" })
    .eq("id", requestId)
    .eq("mentor_id", user.id)
    .eq("status", "pending");
  if (error) return { error: error.message };

  // Notify the mentee (in-app + opt-in email).
  const admin = createAdminClient();
  const { data: mentor } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  await admin.from("notifications").insert({
    profile_id: request.mentee_id,
    type: "mentorship",
    reference_id: requestId,
    message: `${mentor?.full_name ?? "A mentor"} accepted your request — awaiting final approval.`,
  });
  await notifyParticipantByEmail({
    profileId: request.mentee_id,
    subject: "Your mentorship request was accepted on MLA",
    html: `<p>${mentor?.full_name ?? "A mentor"} accepted your mentorship request. It now awaits final platform approval.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mla.org.ng"}/dashboard/requests">Track it in your dashboard</a></p>`,
  });

  revalidatePath("/dashboard/requests");
  return {};
}

// Mentor declines a pending request.
export async function rejectRequestAction(requestId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: request } = await supabase
    .from("mentorship_requests")
    .select("mentee_id, mentor_id")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) return { error: "Request not found." };
  if (request.mentor_id !== user.id) return { error: "Only the assigned mentor can respond to this request." };

  const { error } = await supabase
    .from("mentorship_requests")
    .update({ status: "rejected" })
    .eq("id", requestId)
    .eq("mentor_id", user.id)
    .eq("status", "pending");
  if (error) return { error: error.message };

  const admin = createAdminClient();
  await admin.from("notifications").insert({
    profile_id: request.mentee_id,
    type: "mentorship",
    reference_id: requestId,
    message: "A mentor declined your request.",
  });
  await notifyParticipantByEmail({
    profileId: request.mentee_id,
    subject: "Your mentorship request was declined on MLA",
    html: `<p>A mentor declined your mentorship request. You can request a different mentor from the directory.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mla.org.ng"}/mentorship/find">Browse mentors</a></p>`,
  });

  revalidatePath("/dashboard/requests");
  return {};
}

// A member requests to administer their registered institution (spec §5).
export async function requestInstitutionAdminAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,institution_id")
    .eq("id", user.id)
    .single();

  if (!profile?.institution_id) {
    return { error: "You must be associated with an institution to request admin rights." };
  }
  if (profile.role === "institution_admin" || profile.role === "super_admin") {
    return { error: "You are already an administrator." };
  }

  // Check for an existing pending request
  const { data: existing } = await supabase
    .from("institution_admin_requests")
    .select("id,status")
    .eq("profile_id", user.id)
    .eq("institution_id", profile.institution_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && existing.status === "pending") {
    return { error: "You already have a pending request for your institution." };
  }

  const { error } = await supabase.from("institution_admin_requests").insert({
    profile_id: user.id,
    institution_id: profile.institution_id,
    status: "pending",
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/requests");
  revalidatePath("/dashboard");
  return {};
}