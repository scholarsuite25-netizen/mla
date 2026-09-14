"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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