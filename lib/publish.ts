import { createAdminClient } from "@/lib/supabase/admin";
import { sendBroadcastEmail } from "@/lib/email/brevo";

export const MAX_BROADCAST_PER_DAY = 300;

// Shared publish fan-out used by blog and course publishing (spec §6):
// 1. In-app notification row for every active member.
// 2. Brevo broadcast to opted-in members + newsletter subscribers,
//    capped at MAX_BROADCAST_PER_DAY and skipping gracefully when
//    BREVO_API_KEY is not configured (spec §2 Brevo/Resend split).
// Callers write their own audit_log row.
export async function notifyAndBroadcast(params: {
  targetType: "blog" | "course";
  targetId: string;
  message: string;
  title: string;
  path: string;
}) {
  const { targetType, targetId, message, title, path } = params;
  const admin = createAdminClient();

  // 1. In-app notifications.
  const { data: profiles } = await admin
    .from("profiles")
    .select("id")
    .eq("is_active", true);
  if (profiles && profiles.length > 0) {
    await admin.from("notifications").insert(
      profiles.map((p) => ({
        profile_id: p.id,
        type: targetType,
        reference_id: targetId,
        message,
      }))
    );
  }

  // 2. Brevo broadcast.
  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    console.warn("BREVO_API_KEY missing — broadcast skipped.");
    return;
  }

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
        subject: `New on MLA: ${title}`,
        html: `<p>New ${targetType === "blog" ? "blog post" : "course"} on MLA: <strong>${title}</strong></p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL}${path}">View it here</a></p>`,
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
}