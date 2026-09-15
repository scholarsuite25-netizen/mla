"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const commentSchema = z.object({
  postId: z.string().uuid("Invalid post ID"),
  postSlug: z.string().min(1),
  authorName: z.string().trim().min(2, "Name must be at least 2 characters."),
  authorEmail: z.string().trim().email("Please provide a valid email address."),
  content: z
    .string()
    .trim()
    .min(3, "Comment must be at least 3 characters.")
    .max(2000, "Comment cannot exceed 2000 characters."),
  honeypot: z.string().max(0, "Bot detected"),
});

export async function submitCommentAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    postSlug: formData.get("postSlug"),
    authorName: formData.get("authorName"),
    authorEmail: formData.get("authorEmail"),
    content: formData.get("content"),
    honeypot: formData.get("website") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verify post exists and accepts comments
  const { data: post, error: postErr } = await supabase
    .from("blog_posts")
    .select("id, allow_comments, slug")
    .eq("id", parsed.data.postId)
    .single();

  if (postErr || !post) {
    return { error: "Post not found." };
  }

  if (post.allow_comments === false) {
    return { error: "Comments are disabled on this article." };
  }

  const { error: insertErr } = await supabase.from("blog_comments").insert({
    post_id: parsed.data.postId,
    author_name: parsed.data.authorName,
    author_email: parsed.data.authorEmail,
    author_id: user?.id ?? null,
    content: parsed.data.content,
    status: "approved", // Automatically approved by default
  });

  if (insertErr) {
    return { error: "Failed to save comment. Please try again." };
  }

  revalidatePath(`/blog/${parsed.data.postSlug}`);
  return { success: true };
}
