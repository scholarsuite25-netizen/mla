"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAuditEvent } from "@/lib/audit";
import {
  MAX_ACTIVE_MATCHES_PER_MENTOR,
  MAX_PENDING_REQUESTS_OUT,
  notifyParticipantByEmail,
} from "@/lib/mentorship";

export type ActionResult = { error?: string };

const becomeMentorSchema = z.object({
  bio: z.string().trim().min(20, "Bio must be at least 20 characters so mentees know who you are.").max(1000, "Bio must be 1000 characters or fewer."),
  expertise_tags: z
    .string()
    .trim()
    .min(1, "List at least one area of expertise."),
  availability: z.string().trim().max(255, "Availability is too long."),
});

// Upsert the caller's mentor profile (one row per user, enforced by unique).
export async function becomeMentorAction(formData: FormData): Promise<ActionResult> {
  const bio = String(formData.get("bio") ?? "");
  const expertise_tags = String(formData.get("expertise_tags") ?? "");
  const availability = String(formData.get("availability") ?? "");

  const parsed = becomeMentorSchema.safeParse({ bio, expertise_tags, availability });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const tags = parsed.data.expertise_tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .single();
  if (!profile?.is_active) {
    return { error: "Your account is not active. Contact support to restore access." };
  }

  const row = {
    profile_id: user.id,
    bio: parsed.data.bio,
    expertise_tags: tags,
    availability: parsed.data.availability,
    is_active: true,
  };

  const { data: existing } = await supabase
    .from("mentor_profiles")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("mentor_profiles")
      .update({ bio: row.bio, expertise_tags: row.expertise_tags, availability: row.availability, is_active: true })
      .eq("id", existing.id);
    if (error) return { error: error.message };

    await logAuditEvent({
      action: "mentor.updated",
      targetTable: "mentor_profiles",
      targetId: existing.id,
      actorId: user.id,
      category: "mentorship",
      severity: "info",
      details: { re_listed: true },
    });
  } else {
    const { error } = await supabase.from("mentor_profiles").insert(row);
    if (error) return { error: error.message };

    await logAuditEvent({
      action: "mentor.listed",
      targetTable: "mentor_profiles",
      actorId: user.id,
      category: "mentorship",
      severity: "info",
      details: { expertise_tags: tags },
    });
  }

  revalidatePath("/mentorship/become");
  revalidatePath("/mentorship/find");
  revalidatePath("/dashboard/requests");
  return {};
}

// Deactivate (soft) a mentor profile (owner toggles own is_active off).
export async function deactivateMentorAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: existing } = await supabase
    .from("mentor_profiles")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!existing) return { error: "You are not listed as a mentor." };

  await supabase
    .from("mentor_profiles")
    .update({ is_active: false })
    .eq("id", existing.id);

  await logAuditEvent({
    action: "mentor.unlisted",
    targetTable: "mentor_profiles",
    targetId: existing.id,
    actorId: user.id,
    category: "mentorship",
    severity: "info",
  });

  revalidatePath("/mentorship/become");
  revalidatePath("/mentorship/find");
  return {};
}

// A member requests mentorship from an active mentor (status='pending' enforced by RLS).
export async function createRequestAction(mentorId: string): Promise<ActionResult> {
  if (!mentorId) return { error: "Invalid mentor." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  if (mentorId === user.id) return { error: "You cannot request mentorship from yourself." };

  const admin = createAdminClient();

  // Target must be an active mentor.
  const { data: mentorProfile } = await admin
    .from("mentor_profiles")
    .select("id")
    .eq("profile_id", mentorId)
    .eq("is_active", true)
    .maybeSingle();
  if (!mentorProfile) return { error: "This mentor is not available to receive requests." };

  // Already an active request (pending/accepted/approved) to this mentor?
  const { data: activePair } = await supabase
    .from("mentorship_requests")
    .select("status")
    .eq("mentee_id", user.id)
    .eq("mentor_id", mentorId)
    .in("status", ["pending", "accepted", "approved"])
    .maybeSingle();
  if (activePair) return { error: "You already have an open request with this mentor." };

  // Mentee output cap.
  const { count: pendingOut } = await supabase
    .from("mentorship_requests")
    .select("id", { count: "exact", head: true })
    .eq("mentee_id", user.id)
    .eq("status", "pending");
  if (pendingOut && pendingOut >= MAX_PENDING_REQUESTS_OUT) {
    return {
      error: `You already have ${MAX_PENDING_REQUESTS_OUT} pending requests. Withdraw one before sending more.`,
    };
  }

  // Mentor load cap (approved matches only).
  const { count: activeMatches } = await admin
    .from("mentorship_requests")
    .select("id", { count: "exact", head: true })
    .eq("mentor_id", mentorId)
    .eq("status", "approved");
  if (activeMatches && activeMatches >= MAX_ACTIVE_MATCHES_PER_MENTOR) {
    return { error: "This mentor is at capacity for active matches right now." };
  }

  // Resolve mentee's institution.
  const { data: profile } = await supabase
    .from("profiles")
    .select("institution_id")
    .eq("id", user.id)
    .single();

  const { data: inserted, error } = await supabase
    .from("mentorship_requests")
    .insert({
      mentee_id: user.id,
      mentor_id: mentorId,
      institution_id: profile?.institution_id ?? null,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  const requestId = inserted.id;

  // Notify the mentor in-app and by email (opt-in).
  const { data: mentee } = await admin
    .from("profiles")
    .select("full_name,institution_id,institutions(name)")
    .eq("id", user.id)
    .single();
  const menteeName = mentee?.full_name ?? "A member";
  const instVal = mentee?.institutions;
  const menteeInst = Array.isArray(instVal)
    ? (instVal[0]?.name ?? null)
    : ((instVal as unknown as { name?: string } | null | undefined)?.name ?? null);

  await admin.from("notifications").insert({
    profile_id: mentorId,
    type: "mentorship",
    reference_id: requestId,
    message: `New mentorship request from ${menteeName}${menteeInst ? ` (${menteeInst})` : ""}.`,
  });
  await notifyParticipantByEmail({
    profileId: mentorId,
    subject: `New mentorship request on MLA from ${menteeName}`,
    html: `<p>${menteeName}${menteeInst ? ` from ${menteeInst}` : ""} has requested you as a mentor.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mla.org.ng"}/dashboard/requests">Review the request</a></p>`,
  });

  revalidatePath("/mentorship/find");
  revalidatePath("/dashboard/requests");
  return {};
}

// Mentee withdraws their own pending request.
export async function cancelRequestAction(requestId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { data: request } = await supabase
    .from("mentorship_requests")
    .select("id,mentee_id,mentor_id,status")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) return { error: "Request not found." };
  if (request.mentee_id !== user.id) return { error: "Only the mentee can withdraw this request." };
  if (request.status !== "pending") return { error: "Only pending requests can be withdrawn." };

  const { error } = await supabase
    .from("mentorship_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("mentee_id", user.id)
    .eq("status", "pending");
  if (error) return { error: error.message };

  const admin = createAdminClient();
  await admin.from("notifications").insert({
    profile_id: request.mentor_id,
    type: "mentorship",
    reference_id: requestId,
    message: "A mentee withdrew their mentorship request.",
  });

  revalidatePath("/dashboard/requests");
  revalidatePath("/mentorship/find");
  return {};
}

// Either participant (or moderation) ends an approved match.
export async function endRequestAction(requestId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { data: request } = await supabase
    .from("mentorship_requests")
    .select("id,mentee_id,mentor_id,status")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) return { error: "Match not found." };
  const isParticipant = request.mentee_id === user.id || request.mentor_id === user.id;
  if (!isParticipant) return { error: "You are not part of this match." };
  if (request.status !== "approved") return { error: "Only approved matches can be ended." };

  const { error } = await supabase
    .from("mentorship_requests")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "approved");
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const otherId = request.mentee_id === user.id ? request.mentor_id : request.mentee_id;
  await admin.from("notifications").insert({
    profile_id: otherId,
    type: "mentorship",
    reference_id: requestId,
    message: "A mentorship match was ended.",
  });
  await notifyParticipantByEmail({
    profileId: otherId,
    subject: "Your MLA mentorship match has ended",
    html: `<p>The other party ended your mentorship match on MLA.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mla.org.ng"}/dashboard/requests">View your dashboard</a></p>`,
  });

  revalidatePath("/dashboard/requests");
  return {};
}