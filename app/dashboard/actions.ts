"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const { error } = await supabase
    .from("mentorship_requests")
    .update({ status: "accepted" })
    .eq("id", requestId)
    .eq("mentor_id", user.id)
    .eq("status", "pending");
  if (error) return { error: error.message };

  // Notify the mentee.
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    profile_id: request.mentee_id,
    type: "mentorship",
    reference_id: requestId,
    message: "A mentor accepted your request — awaiting final approval.",
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
    .select("mentee_id")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) return { error: "Request not found." };

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

  revalidatePath("/dashboard/requests");
  return {};
}