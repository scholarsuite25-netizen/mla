"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string };

export async function enrollAction(courseId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to enroll." };

  const { error } = await supabase
    .from("course_enrollments")
    .insert({ course_id: courseId, profile_id: user.id });
  if (error) {
    if (error.code === "23505") return {}; // already enrolled
    return { error: error.message };
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/dashboard/learning");
  return {};
}

// Toggles completion of a single module for the current user.
export async function toggleModuleAction(
  courseId: string,
  moduleId: string,
  completed: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  if (completed) {
    const { error } = await supabase
      .from("course_module_progress")
      .insert({ course_module_id: moduleId, profile_id: user.id });
    if (error) {
      if (error.code === "23505") return {}; // already marked
      return { error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("course_module_progress")
      .delete()
      .eq("course_module_id", moduleId)
      .eq("profile_id", user.id);
    if (error) return { error: error.message };
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/dashboard/learning");
  return {};
}