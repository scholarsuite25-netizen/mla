"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAndBroadcast } from "@/lib/publish";
import { assertSuperAdmin } from "@/lib/auth-guard";

export type ActionResult = { error?: string };

const postSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and dashes only."),
  body: z.string(),
  cover_image_url: z.string().url().nullable().optional(),
  category: z.string().trim().min(1, "Category is required."),
  tags: z.array(z.string()).default([]),
  excerpt: z.string().nullable().optional(),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  allow_comments: z.boolean().default(true),
  featured: z.boolean().default(false),
});

const FILE_LIMIT = 10 * 1024 * 1024; // 10MB
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).map((s) => s.trim()).filter(Boolean);
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function getPostInput(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  const tagsRaw = formData.get("tags");
  return {
    title,
    slug: String(formData.get("slug") ?? "").trim() || slugify(title) || "untitled",
    body: String(formData.get("body") ?? ""),
    cover_image_url: String(formData.get("cover_image_url") ?? "") || null,
    category: String(formData.get("category") ?? "Leadership").trim() || "Leadership",
    tags: parseTags(tagsRaw),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    seo_title: String(formData.get("seo_title") ?? "").trim() || null,
    seo_description: String(formData.get("seo_description") ?? "").trim() || null,
    allow_comments: formData.get("allow_comments") === "on" || formData.get("allow_comments") === "true",
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
  };
}

// Save as draft or update existing post without losing publish status.
export async function savePostAction(
  postId: string | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const input = getPostInput(formData);
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const admin = createAdminClient();

  if (postId) {
    const updatePayload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      body: parsed.data.body,
      cover_image_url: parsed.data.cover_image_url ?? null,
      category: parsed.data.category,
      tags: parsed.data.tags,
      excerpt: parsed.data.excerpt ?? null,
      seo_title: parsed.data.seo_title ?? null,
      seo_description: parsed.data.seo_description ?? null,
      allow_comments: parsed.data.allow_comments,
      featured: parsed.data.featured,
    };

    const { data, error } = await admin
      .from("blog_posts")
      .update(updatePayload)
      .eq("id", postId)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        return { error: "That slug is already taken — pick another." };
      }
      return { error: error.message };
    }
    revalidatePath("/blog");
    revalidatePath(`/blog/${parsed.data.slug}`);
    revalidatePath(`/admin/blog/${postId}/edit`);
    redirect(`/admin/blog/${data!.id}/edit`);
  }

  const row = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    body: parsed.data.body,
    cover_image_url: parsed.data.cover_image_url ?? null,
    category: parsed.data.category,
    tags: parsed.data.tags,
    excerpt: parsed.data.excerpt ?? null,
    seo_title: parsed.data.seo_title ?? null,
    seo_description: parsed.data.seo_description ?? null,
    allow_comments: parsed.data.allow_comments,
    featured: parsed.data.featured,
    status: "draft",
    published_at: null,
  };

  const { data, error } = await admin
    .from("blog_posts")
    .insert(row)
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken — pick another." };
    }
    return { error: error.message };
  }
  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${data!.id}/edit`);
}

// Publish: flip to published, then fan out notifications + email.
export async function publishPostAction(postId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { data: post } = await admin
    .from("blog_posts")
    .select("id,title,slug,status")
    .eq("id", postId)
    .single();
  if (!post) return { error: "Post not found." };
  if (post.status === "published") return {}; // no double fan-out

  const { error: pubError } = await admin
    .from("blog_posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", postId);
  if (pubError) return { error: pubError.message };

  await notifyAndBroadcast({
    targetType: "blog",
    targetId: post.id,
    message: `New blog post: ${post.title}`,
    title: post.title,
    path: `/blog/${post.slug}`,
  });

  // Audit trail.
  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: "blog.publish",
    target_table: "blog_posts",
    target_id: post.id,
  });

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/");
  return {};
}

export async function unpublishPostAction(postId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("blog_posts")
    .update({ status: "draft" })
    .eq("id", postId);
  if (error) return { error: error.message };

  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: "blog.unpublish",
    target_table: "blog_posts",
    target_id: postId,
  });

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return {};
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("blog_posts").delete().eq("id", postId);
  if (error) return { error: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return {};
}

// Cover or embedded image upload — validated server-side (type + size)
export async function uploadCoverAction(formData: FormData): Promise<{ url?: string; error?: string }> {
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
  const path = `blog/${crypto.randomUUID()}.${ext}`;

  const { error } = await admin.storage.from("covers").upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { error: error.message };

  const url = admin.storage.from("covers").getPublicUrl(path).data.publicUrl;
  return { url };
}

// Moderation of blog comments
export async function moderateCommentAction(
  commentId: string,
  status: "approved" | "pending" | "spam"
): Promise<ActionResult> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("blog_comments")
    .update({ status })
    .eq("id", commentId);

  if (error) return { error: error.message };
  revalidatePath("/blog");
  return {};
}

export async function deleteCommentAction(commentId: string): Promise<ActionResult> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("blog_comments").delete().eq("id", commentId);
  if (error) return { error: error.message };
  revalidatePath("/blog");
  return {};
}