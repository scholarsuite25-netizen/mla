"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSuperAdmin } from "@/lib/auth-guard";
import { logAuditEvent } from "@/lib/audit";

export type NoticeActionResult = { error?: string; success?: boolean };

const noticeSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  content: z.string().trim().min(10, "Content must be at least 10 characters."),
  category: z.enum(["general", "academic", "membership", "urgent", "event"]),
  is_pinned: z.coerce.boolean().optional().default(false),
  is_published: z.coerce.boolean().optional().default(true),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export async function saveNoticeAction(
  noticeId: string | null,
  formData: FormData
): Promise<NoticeActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const parsed = noticeSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    category: String(formData.get("category") ?? "general"),
    is_pinned: formData.get("is_pinned") === "true" || formData.get("is_pinned") === "on",
    is_published: formData.get("is_published") === "true" || formData.get("is_published") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const admin = createAdminClient();
  const slug = `${slugify(parsed.data.title)}-${Date.now().toString().slice(-4)}`;

  if (noticeId) {
    const { error } = await admin
      .from("notices")
      .update({
        title: parsed.data.title,
        content: parsed.data.content,
        category: parsed.data.category,
        is_pinned: parsed.data.is_pinned,
        is_published: parsed.data.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noticeId);

    if (error) return { error: error.message };

    await logAuditEvent({
      actorId: actor.id,
      action: "notice.updated",
      targetTable: "notices",
      targetId: noticeId,
      category: "general",
      severity: "notice",
      details: { title: parsed.data.title },
    });
  } else {
    const { data: newNotice, error } = await admin
      .from("notices")
      .insert({
        title: parsed.data.title,
        slug,
        content: parsed.data.content,
        category: parsed.data.category,
        is_pinned: parsed.data.is_pinned,
        is_published: parsed.data.is_published,
        created_by: actor.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    await logAuditEvent({
      actorId: actor.id,
      action: "notice.created",
      targetTable: "notices",
      targetId: newNotice.id,
      category: "general",
      severity: "notice",
      details: { title: parsed.data.title },
    });
  }

  revalidatePath("/notices");
  revalidatePath("/admin/notices");
  return { success: true };
}

export async function deleteNoticeAction(noticeId: string): Promise<NoticeActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("notices").delete().eq("id", noticeId);
  if (error) return { error: error.message };

  await logAuditEvent({
    actorId: actor.id,
    action: "notice.deleted",
    targetTable: "notices",
    targetId: noticeId,
    category: "general",
    severity: "warning",
    details: { noticeId },
  });

  revalidatePath("/notices");
  revalidatePath("/admin/notices");
  return { success: true };
}
