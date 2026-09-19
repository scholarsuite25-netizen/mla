"use server";

import { revalidatePath } from "next/cache";
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
  scheduled_for: z.string().nullable().optional(),
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
    scheduled_for: String(formData.get("scheduled_for") ?? "").trim() || null,
  };
}

// A scheduled publish stores a future published_at with status still "draft";
// the cron route (/api/cron/publish-scheduled) flips it live when due.
function isFutureSchedule(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const time = new Date(raw).getTime();
  if (!Number.isFinite(time)) return null;
  return time > Date.now() ? new Date(time).toISOString() : null;
}

export type SaveActionResult = ActionResult & { id?: string };

// Save as draft, or save+publish in one step. Publishing a brand-new post
// works here in a single click (no separate follow-up action needed).
export async function savePostAction(
  postId: string | null,
  formData: FormData,
  mode: "draft" | "publish" = "draft"
): Promise<SaveActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const input = getPostInput(formData);
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const admin = createAdminClient();
  const wantPublished = mode === "publish";
  const scheduled = isFutureSchedule(parsed.data.scheduled_for);

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
      .select("id,title,slug,status,published_at")
      .eq("id", postId)
      .single();
    if (error || !data) {
      return { error: error?.message ?? "Post not found." };
    }

    const { error: updateError } = await admin
      .from("blog_posts")
      .update(updatePayload)
      .eq("id", postId);
    if (updateError) {
      if (updateError.code === "23505") {
        return { error: "That slug is already taken — pick another." };
      }
      return { error: updateError.message };
    }

    if (scheduled) {
      // Schedule replaces a live published_at, but only down to a future slot.
      await admin
        .from("blog_posts")
        .update({ status: "draft", published_at: scheduled })
        .eq("id", postId);
    } else if (wantPublished) {
      await publishPostAction(postId);
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${parsed.data.slug}`);
    revalidatePath("/admin/blog");
    return { id: postId };
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
    status: (wantPublished ? "published" : "draft") as "draft" | "published",
    published_at: wantPublished ? new Date().toISOString() : null,
  };
  if (scheduled) {
    row.status = "draft";
    row.published_at = scheduled;
  }

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
  const newId = data.id;

  if (wantPublished && !scheduled) {
    try {
      await notifyAndBroadcast({
        targetType: "blog",
        targetId: newId,
        message: `New blog post: ${parsed.data.title}`,
        title: parsed.data.title,
        path: `/blog/${parsed.data.slug}`,
      });
      await admin.from("audit_log").insert({
        actor_id: actor.id,
        action: "blog.publish",
        target_table: "blog_posts",
        target_id: newId,
      });
    } catch (e) {
      console.error("Publish fan-out failed:", e);
    }
  }

  revalidatePath("/admin/blog");
  if (wantPublished) revalidatePath("/blog");
  return { id: newId };
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
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();

  const { data: post } = await admin
    .from("blog_posts")
    .select("id,title,slug,body,cover_image_url")
    .eq("id", postId)
    .single();

  const { error } = await admin.from("blog_posts").delete().eq("id", postId);
  if (error) return { error: error.message };

  // Clean up the stored cover (and detect any embedded images in the body).
  if (post?.cover_image_url) {
    await deleteStoredImages(admin, post.cover_image_url, post.body ?? "");
  }

  await admin.from("audit_log").insert({
    actor_id: actor.id,
    action: "blog.delete",
    target_table: "blog_posts",
    target_id: postId,
  });

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return {};
}

// Removes objects belonging to this post from Supabase Storage (covers bucket).
async function deleteStoredImages(
  admin: ReturnType<typeof createAdminClient>,
  coverUrl: string,
  body: string
) {
  const paths = new Set<string>();
  const matchPath = (url: string) => {
    const m = url.match(/object\/public\/covers\/(.+)$/);
    if (m?.[1]) paths.add(m[1]);
  };
  matchPath(coverUrl);
  for (const m of body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    matchPath(m[1]);
  }
  if (paths.size === 0) return;
  await admin.storage.from("covers").remove([...paths]);
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