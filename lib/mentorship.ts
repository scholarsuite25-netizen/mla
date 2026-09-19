import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/resend";

// Anti-abuse limits (global mentorship best practice).
export const MAX_PENDING_REQUESTS_OUT = 3; // concurrent requests a mentee may hold
export const MAX_ACTIVE_MATCHES_PER_MENTOR = 15; // approved match cap per mentor

// Consistent opt-in email helper for mentorship participants.
export async function notifyParticipantByEmail(params: {
  profileId: string;
  subject: string;
  html: string;
}): Promise<void> {
  const admin = createAdminClient();
  if (!process.env.RESEND_API_KEY) return;
  const [{ data: profile }, identity] = await Promise.all([
    admin.from("profiles").select("email_notifications_enabled").eq("id", params.profileId).maybeSingle(),
    admin.auth.admin.getUserById(params.profileId).catch(() => ({ data: { user: null } })),
  ]);
  const email = (identity.data as { user?: { email?: string } | null } | null)?.user?.email;
  if (!email || profile?.email_notifications_enabled === false) return;
  await sendTransactionalEmail({ to: email, subject: params.subject, html: params.html }).catch((err) =>
    console.error("Mentorship email failed:", err)
  );
}