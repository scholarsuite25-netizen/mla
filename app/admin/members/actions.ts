"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateMemberRole(formData: FormData) {
  const profileId = formData.get("profileId") as string;
  const newRole = formData.get("role") as string;
  if (!profileId || !newRole) return;

  const admin = createAdminClient();
  await admin.from("profiles").update({ role: newRole }).eq("id", profileId);
  revalidatePath("/admin/members");
}

export async function toggleMemberStatus(formData: FormData) {
  const profileId = formData.get("profileId") as string;
  const currentActive = formData.get("isActive") === "true";
  if (!profileId) return;

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ is_active: !currentActive })
    .eq("id", profileId);
  revalidatePath("/admin/members");
}
