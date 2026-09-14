"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { error?: string };

const becomeMentorSchema = z.object({
  bio: z.string().trim().max(1000, "Bio must be 1000 characters or fewer."),
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
    .filter(Boolean);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

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
  } else {
    const { error } = await supabase.from("mentor_profiles").insert(row);
    if (error) return { error: error.message };
  }

  revalidatePath("/mentorship/become");
  revalidatePath("/mentorship/find");
  revalidatePath("/dashboard/requests");
  return {};
}

// A member requests mentorship from a mentor (status='pending' enforced by RLS).
export async function createRequestAction(mentorId: string): Promise<ActionResult> {
  if (!mentorId) return { error: "Invalid mentor." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  if (mentorId === user.id) return { error: "You cannot request mentorship from yourself." };

  // Prevent duplicate pending requests.
  const { data: existing } = await supabase
    .from("mentorship_requests")
    .select("id")
    .eq("mentee_id", user.id)
    .eq("mentor_id", mentorId)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return { error: "You already have a pending request with this mentor." };

  // Resolve mentee's institution.
  const { data: profile } = await supabase
    .from("profiles")
    .select("institution_id")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("mentorship_requests").insert({
    mentee_id: user.id,
    mentor_id: mentorId,
    institution_id: profile?.institution_id ?? null,
    status: "pending",
  });
  if (error) return { error: error.message };

  // Notify the mentor via in-app notification (requires admin client).
  const admin = createAdminClient();
  const { data: mentee } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  await admin.from("notifications").insert({
    profile_id: mentorId,
    type: "mentorship",
    reference_id: mentorId,
    message: `New mentorship request from ${mentee?.full_name ?? "a member"}.`,
  });

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

  await supabase
    .from("mentor_profiles")
    .update({ is_active: false })
    .eq("profile_id", user.id);

  revalidatePath("/mentorship/become");
  revalidatePath("/mentorship/find");
  return {};
}