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
  cover_image_url: z.string().url().nullable().optional(),
  category: z.string().trim().min(1).default("Executive Leadership"),
  level: z.string().trim().min(1).default("Intermediate"),
  estimated_duration: z.string().trim().min(1).default("4 Weeks"),
  instructor_name: z.string().trim().min(1).default("MLA Faculty & Mentors"),
  instructor_title: z.string().trim().min(1).default("Executive Leadership Fellow"),
  certificate_enabled: z.boolean().default(true),
  featured: z.boolean().default(false),
});

const lessonTypes = ["video", "reading", "workshop", "assignment"] as const;

const moduleSchema = z.object({
  title: z.string().trim().min(1, "Module title is required."),
  content: z.string().default(""),
  lesson_type: z.enum(lessonTypes, {
    message: "Invalid lesson format.",
  }),
  video_url: z
    .string()
    .trim()
    .refine((v) => v === "" || URL.canParse(v), "Video URL must be a valid URL.")
    .transform((v) => v || null)
    .nullable()
    .optional(),
  duration_minutes: z.number().min(1).max(600).default(15),
  is_free_preview: z.boolean().default(false),
  resources: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Resource titles cannot be empty."),
        url: z
          .string()
          .trim()
          .refine((u) => URL.canParse(u), "Every resource URL must be valid."),
      })
    )
    .max(20, "A module can hold at most 20 resources.")
    .default([]),
}).refine(
  (m) => m.lesson_type !== "video" || m.video_url,
  "Video lectures require a video URL."
);

const FILE_LIMIT = 10 * 1024 * 1024; // 10MB
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function uploadCourseThumbnailAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file received." };
  }
  if (!allowedTypes.includes(file.type)) {
    return { error: "Only JPEG, PNG, WebP, GIF or AVIF images are allowed." };
  }
  if (file.size > FILE_LIMIT) {
    return { error: "Image must be 10MB or smaller." };
  }

  const admin = createAdminClient();
  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
  const path = `courses/${crypto.randomUUID()}.${ext}`;

  const { error } = await admin.storage.from("covers").upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { error: error.message };

  const url = admin.storage.from("covers").getPublicUrl(path).data.publicUrl;
  return { url };
}

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
  const cover_image_url = String(formData.get("cover_image_url") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "Executive Leadership");
  const level = String(formData.get("level") ?? "Intermediate");
  const estimated_duration = String(formData.get("estimated_duration") ?? "4 Weeks");
  const instructor_name = String(formData.get("instructor_name") ?? "MLA Faculty & Mentors");
  const instructor_title = String(formData.get("instructor_title") ?? "Executive Leadership Fellow");
  const certificate_enabled = formData.get("certificate_enabled") === "on" || formData.get("certificate_enabled") === "true";
  const featured = formData.get("featured") === "on" || formData.get("featured") === "true";

  const parsed = courseSchema.safeParse({
    title,
    description,
    cover_image_url,
    category,
    level,
    estimated_duration,
    instructor_name,
    instructor_title,
    certificate_enabled,
    featured,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const admin = createAdminClient();

  if (courseId) {
    const { data, error } = await admin
      .from("courses")
      .update({
        title: parsed.data.title,
        description: parsed.data.description,
        cover_image_url: parsed.data.cover_image_url,
        category: parsed.data.category,
        level: parsed.data.level,
        estimated_duration: parsed.data.estimated_duration,
        instructor_name: parsed.data.instructor_name,
        instructor_title: parsed.data.instructor_title,
        certificate_enabled: parsed.data.certificate_enabled,
        featured: parsed.data.featured,
      })
      .eq("id", courseId)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath("/courses");
    revalidatePath(`/courses/${data!.id}`);
    revalidatePath(`/admin/courses/${data!.id}/edit`);
    redirect(`/admin/courses/${data!.id}/edit`);
  }

  const row = {
    title: parsed.data.title,
    description: parsed.data.description,
    cover_image_url: parsed.data.cover_image_url,
    category: parsed.data.category,
    level: parsed.data.level,
    estimated_duration: parsed.data.estimated_duration,
    instructor_name: parsed.data.instructor_name,
    instructor_title: parsed.data.instructor_title,
    certificate_enabled: parsed.data.certificate_enabled,
    featured: parsed.data.featured,
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
    message: `New curriculum available: ${course.title}`,
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

export async function unpublishCourseAction(courseId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("courses")
    .update({ status: "draft" })
    .eq("id", courseId);
  if (error) return { error: error.message };

  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: "course.unpublish",
    target_table: "courses",
    target_id: courseId,
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
  const lesson_type = String(formData.get("lesson_type") ?? "video");
  const video_url = String(formData.get("video_url") ?? "").trim() || null;
  const duration_minutes = Number(formData.get("duration_minutes") ?? 15) || 15;
  const is_free_preview =
    formData.get("is_free_preview") === "on" || formData.get("is_free_preview") === "true";

  let resources: { title: string; url: string }[] = [];
  const resourcesRaw = formData.get("resources");
  if (typeof resourcesRaw === "string" && resourcesRaw.trim()) {
    try {
      resources = JSON.parse(resourcesRaw);
    } catch {
      // ignore parsing error
    }
  }

  const parsed = moduleSchema.safeParse({
    title,
    content,
    lesson_type,
    video_url,
    duration_minutes,
    is_free_preview,
    resources,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const admin = createAdminClient();

  if (moduleId) {
    const { error } = await admin
      .from("course_modules")
      .update({
        title: parsed.data.title,
        content: parsed.data.content,
        lesson_type: parsed.data.lesson_type,
        video_url: parsed.data.video_url,
        duration_minutes: parsed.data.duration_minutes,
        is_free_preview: parsed.data.is_free_preview,
        resources: parsed.data.resources,
      })
      .eq("id", moduleId);
    if (error) return { error: error.message };
    revalidatePath(`/courses/${courseId}`);
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
    lesson_type: parsed.data.lesson_type,
    video_url: parsed.data.video_url,
    duration_minutes: parsed.data.duration_minutes,
    is_free_preview: parsed.data.is_free_preview,
    resources: parsed.data.resources,
    order_index: (last?.order_index ?? -1) + 1,
  });
  if (error) return { error: error.message };
  revalidatePath(`/courses/${courseId}`);
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
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}/edit`);
  return {};
}

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

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}/edit`);
  return {};
}