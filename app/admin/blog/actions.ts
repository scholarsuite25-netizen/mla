"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBroadcastEmail } from "@/lib/email/brevo";

const MAX_BROADCAST_PER_DAY = 300;

export type ActionResult = { error?: string };

const postSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and dashes only."),
  body: z.string(),
  cover_image_url: z.string().url().nullable().optional(),
});

const FILE_LIMIT = 5 * 1024 * 1024; // 5MB
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

function getPostInput(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  return {
    title,
    slug: String(formData.get("slug") ?? "").trim() || slugify(title) || "untitled",
    body: String(formData.get("body") ?? ""),
    cover_image_url: String(formData.get("cover_image_url") ?? "") || null,
  };
}

// Save as draft (create or update).
export async function savePostAction(
  postId: string | null,
  formData: FormData
): Promise<ActionResult> {
  const input = getPostInput(formData);
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const admin = createAdminClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const row = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    body: parsed.data.body,
    cover_image_url: parsed.data.cover_image_url ?? null,
    status: "draft",
    published_at: null,
  };

  if (postId) {
    const { data, error } = await admin
      .from("blog_posts")
      .update(row)
      .eq("id", postId)
      .select("id")
      .single();
    if (error) return { error: error.message };
    revalidatePath(`/admin/blog/${postId}/edit`);
    redirect(`/admin/blog/${data!.id}/edit`);
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
  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${data!.id}/edit`);
}

// Publish: flip to published, then fan out notifications + email.
export async function publishPostAction(postId: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

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

  // 1. In-app notification for every member.
  const { data: profiles } = await admin
    .from("profiles")
    .select("id")
    .eq("is_active", true);
  if (profiles && profiles.length > 0) {
    await admin.from("notifications").insert(
      profiles.map((p) => ({
        profile_id: p.id,
        type: "blog",
        reference_id: post.id,
        message: `New blog post: ${post.title}`,
      }))
    );
  }

  // 2. Brevo broadcast to opted-in members + newsletter subscribers (capped).
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    // All auth users (paginated) — profiles has no email column.
    const allUsers: { id: string; email?: string }[] = [];
    let page = 0;
    for (;;) {
      const {
        data: { users: pageUsers },
      } = await admin.auth.admin.listUsers({ page: page + 1, perPage: 1000 });
      allUsers.push(...pageUsers);
      if (pageUsers.length < 1000) break;
      page++;
    }

    const { data: optedIn } = await admin
      .from("profiles")
      .select("id")
      .eq("email_notifications_enabled", true)
      .eq("is_active", true);

    const { data: subscribers } = await admin.from("subscribers").select("email");

    const optedIds = new Set(optedIn?.map((p) => p.id) ?? []);
    const emailSet = new Set<string>();
    for (const u of allUsers) {
      if (u.email && optedIds.has(u.id)) emailSet.add(u.email.toLowerCase());
    }
    for (const s of subscribers ?? []) {
      emailSet.add(s.email.toLowerCase());
    }

    const emails = [...emailSet];
    const batch = emails.slice(0, MAX_BROADCAST_PER_DAY);
    if (batch.length > 0) {
      try {
        await sendBroadcastEmail({
          to: batch,
          subject: `New on MLA: ${post.title}`,
          html: `<p>New blog post on MLA: <strong>${post.title}</strong></p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}">Read it here</a></p>`,
        });
      } catch (err) {
        console.error("Brevo broadcast failed:", err);
      }
    }
    if (emails.length > MAX_BROADCAST_PER_DAY) {
      console.warn(
        `Broadcast truncated: ${emails.length} recipients exceeds the ${MAX_BROADCAST_PER_DAY}/day cap.`
      );
    }
  } else {
    console.warn("BREVO_API_KEY missing — broadcast skipped.");
  }

  // 3. Audit trail.
  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "blog.publish",
    target_table: "blog_posts",
    target_id: post.id,
  });

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/");
  return {};
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const { error } = await admin.from("blog_posts").delete().eq("id", postId);
  if (error) return { error: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return {};
}

// Cover image upload — validated server-side (type + size) per spec §9.
export async function uploadCoverAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file received." };
  }
  if (!allowedTypes.includes(file.type)) {
    return { error: "Only JPEG, PNG, WebP, GIF or AVIF images are allowed." };
  }
  if (file.size > FILE_LIMIT) {
    return { error: "Image must be 5MB or smaller." };
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