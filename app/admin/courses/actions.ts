"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAndBroadcast } from "@/lib/publish";
import { assertSuperAdmin } from "@/lib/auth-guard";

export type ActionResult = { error?: string };

const courseSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
});

const moduleSchema = z.object({
  title: z.string().trim().min(1, "Module title is required."),
  content: z.string(),
});

export async function saveCourseAction(
  courseId: string | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const parsed = courseSchema.safeParse({ title, description });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const admin = createAdminClient();

  if (courseId) {
    const { data, error } = await admin
      .from("courses")
      .update({
        title: parsed.data.title,
        description: parsed.data.description,
      })
      .eq("id", courseId)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath(`/courses/${data!.id}`);
    revalidatePath(`/admin/courses/${data!.id}/edit`);
    redirect(`/admin/courses/${data!.id}/edit`);
  }

  const row = {
    title: parsed.data.title,
    description: parsed.data.description,
    status: "draft",
    published_at: null,
  };

  const { data, error } = await admin
    .from("courses")
    .insert(row)
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${data!.id}/edit`);
}

export async function publishCourseAction(courseId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();

  const { data: course } = await admin
    .from("courses")
    .select("id,title,status")
    .eq("id", courseId)
    .single();
  if (!course) return { error: "Course not found." };
  if (course.status === "published") return {};

  const { error: pubError } = await admin
    .from("courses")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", courseId);
  if (pubError) return { error: pubError.message };

  await notifyAndBroadcast({
    targetType: "course",
    targetId: course.id,
    message: `New course: ${course.title}`,
    title: course.title,
    path: `/courses/${course.id}`,
  });

  // Audit trail.
  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: "course.publish",
    target_table: "courses",
    target_id: course.id,
  });

  revalidatePath("/courses");
  revalidatePath("/admin/courses");
  revalidatePath("/");
  revalidatePath("/dashboard/learning");
  return {};
}

export async function deleteCourseAction(courseId: string): Promise<ActionResult> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("courses").delete().eq("id", courseId);
  if (error) return { error: error.message };
  revalidatePath("/courses");
  revalidatePath("/admin/courses");
  return {};
}

export async function saveModuleAction(
  courseId: string,
  moduleId: string | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const parsed = moduleSchema.safeParse({ title, content });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const admin = createAdminClient();

  if (moduleId) {
    const { error } = await admin
      .from("course_modules")
      .update({ title: parsed.data.title, content: parsed.data.content })
      .eq("id", moduleId);
    if (error) return { error: error.message };
    revalidatePath(`/admin/courses/${courseId}/edit`);
    return {};
  }

  const { data: last } = await admin
    .from("course_modules")
    .select("order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await admin.from("course_modules").insert({
    course_id: courseId,
    title: parsed.data.title,
    content: parsed.data.content,
    order_index: (last?.order_index ?? -1) + 1,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/edit`);
  return {};
}

export async function deleteModuleAction(
  courseId: string,
  moduleId: string
): Promise<ActionResult> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("course_modules")
    .delete()
    .eq("id", moduleId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/courses/${courseId}/edit`);
  return {};
}

// Move a module up/down by swapping order_index with its neighbour.
// Avoids the (course_id, order_index) unique constraint by using a
// temporary value (-1000) for the first row before the second update.
export async function moveModuleAction(
  courseId: string,
  moduleId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { data: all } = await admin
    .from("course_modules")
    .select("id,order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });
  if (!all) return { error: "No modules found." };

  const index = all.findIndex((m) => m.id === moduleId);
  const swap = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swap < 0 || swap >= all.length) return {};

  const a = all[index];
  const b = all[swap];

  const { error: e1 } = await admin
    .from("course_modules")
    .update({ order_index: -1000 })
    .eq("id", a.id);
  if (e1) return { error: e1.message };
  const { error: e2 } = await admin
    .from("course_modules")
    .update({ order_index: a.order_index })
    .eq("id", b.id);
  if (e2) return { error: e2.message };
  const { error: e3 } = await admin
    .from("course_modules")
    .update({ order_index: b.order_index })
    .eq("id", a.id);
  if (e3) return { error: e3.message };

  revalidatePath(`/admin/courses/${courseId}/edit`);
  return {};
}