"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function completeOnboardingAction(formData: FormData): Promise<ActionResult> {
  const isSkipped = formData.get("skipped") === "true";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  if (isSkipped) {
    // If skipped, set default pathway to independent_scholar so onboarding is completed
    const { error } = await supabase
      .from("profiles")
      .update({ pathway: "independent_scholar" })
      .eq("id", user.id);
    if (error) return { error: error.message };

    revalidatePath("/dashboard");
    redirect("/dashboard");
  }

  const pathway = formData.get("pathway") as string;
  const institutionName = (formData.get("institution") as string)?.trim();

  const validPathways = [
    "working_professional",
    "fresh_graduate",
    "self_employed",
    "job_seeker",
    "retiree_executive",
    "campus_student",
    "independent_scholar",
  ];

  if (!validPathways.includes(pathway)) {
    return { error: "Please choose a valid learning track." };
  }

  let institutionId: string | null = null;
  if (institutionName && institutionName.length >= 2) {
    const { data: existing } = await supabase
      .from("institutions")
      .select("id")
      .ilike("name", institutionName)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      institutionId = existing.id;
    } else {
      const { data: created } = await supabase
        .from("institutions")
        .insert({ name: institutionName })
        .select("id")
        .single();
      if (created?.id) {
        institutionId = created.id;
      }
    }
  }

  const updateData: { pathway: string; institution_id?: string | null } = {
    pathway,
  };
  if (institutionId) {
    updateData.institution_id = institutionId;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  redirect("/dashboard");
}

export async function updateSettingsAction(formData: FormData): Promise<ActionResult> {
  const parsed = z
    .object({
      fullName: z.string().trim().min(1, "Name can't be empty."),
      emailNotifications: z.boolean(),
      pathway: z.string().optional(),
      institution: z.string().optional(),
    })
    .safeParse({
      fullName: formData.get("full_name"),
      emailNotifications: formData.get("email_notifications") === "on",
      pathway: formData.get("pathway") || undefined,
      institution: formData.get("institution") || undefined,
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  let institutionId: string | undefined = undefined;
  if (parsed.data.institution && parsed.data.institution.trim().length >= 2) {
    const institutionName = parsed.data.institution.trim();
    const { data: existing } = await supabase
      .from("institutions")
      .select("id")
      .ilike("name", institutionName)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      institutionId = existing.id;
    } else {
      const { data: created } = await supabase
        .from("institutions")
        .insert({ name: institutionName })
        .select("id")
        .single();
      if (created?.id) institutionId = created.id;
    }
  }

  const updatePayload: Record<string, string | boolean | null | undefined> = {
    full_name: parsed.data.fullName,
    email_notifications_enabled: parsed.data.emailNotifications,
  };
  if (parsed.data.pathway) {
    updatePayload.pathway = parsed.data.pathway;
  }
  if (institutionId !== undefined) {
    updatePayload.institution_id = institutionId;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updatePayload)
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