"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ForumActionResult = { error?: string; success?: boolean; threadId?: string };

const threadSchema = z.object({
  categoryId: z.string().uuid("Please select a valid discussion category."),
  title: z.string().trim().min(5, "Title must be at least 5 characters."),
  content: z.string().trim().min(15, "Post content must be at least 15 characters."),
});

const replySchema = z.object({
  threadId: z.string().uuid("Invalid discussion thread."),
  content: z.string().trim().min(3, "Reply must be at least 3 characters."),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export async function createThreadAction(formData: FormData): Promise<ForumActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please log in to start a discussion." };
  }

  const parsed = threadSchema.safeParse({
    categoryId: String(formData.get("categoryId") ?? ""),
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const authorName = profile?.full_name || user.email?.split("@")[0] || "Scholar";
  const slug = `${slugify(parsed.data.title)}-${Date.now().toString().slice(-4)}`;

  const { data: newThread, error } = await admin
    .from("forum_threads")
    .insert({
      category_id: parsed.data.categoryId,
      author_id: user.id,
      author_name: authorName,
      author_email: user.email,
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/forum");
  return { success: true, threadId: newThread.id };
}

export async function postReplyAction(formData: FormData): Promise<ForumActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please log in to join the conversation." };
  }

  const parsed = replySchema.safeParse({
    threadId: String(formData.get("threadId") ?? ""),
    content: String(formData.get("content") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const authorName = profile?.full_name || user.email?.split("@")[0] || "Scholar";

  // 1. Insert reply
  const { error: replyErr } = await admin.from("forum_replies").insert({
    thread_id: parsed.data.threadId,
    author_id: user.id,
    author_name: authorName,
    author_email: user.email,
    content: parsed.data.content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (replyErr) {
    return { error: replyErr.message };
  }

  // 2. Increment thread replies_count and update last_activity_at
  const { data: thread } = await admin
    .from("forum_threads")
    .select("replies_count")
    .eq("id", parsed.data.threadId)
    .single();

  await admin
    .from("forum_threads")
    .update({
      replies_count: (thread?.replies_count || 0) + 1,
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.threadId);

  revalidatePath(`/forum/thread/${parsed.data.threadId}`);
  revalidatePath("/forum");
  return { success: true };
}
