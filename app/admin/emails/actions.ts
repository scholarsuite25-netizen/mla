"use server";

import { z } from "zod";
import { assertSuperAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { sendBroadcastEmail } from "@/lib/email/brevo";

export type ActionResult = { error?: string };

const emailSchema = z.object({
  recipientType: z.enum(["individual", "broadcast", "broadcast_all"]),
  emailAddress: z.string().email("Invalid email address").optional().or(z.literal("")),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
});

export async function sendAdminEmailAction(formData: FormData): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const parsed = emailSchema.safeParse({
    recipientType: formData.get("recipientType"),
    emailAddress: formData.get("emailAddress"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { recipientType, emailAddress, subject, body } = parsed.data;

  try {
    if (recipientType === "individual") {
      if (!emailAddress) return { error: "Email address is required for individual messages." };
      
      await sendTransactionalEmail({
        to: emailAddress,
        subject,
        html: body,
      });

      // Audit log
      const admin = createAdminClient();
      await admin.from("audit_log").insert({
        actor_id: actor.id,
        action: "email.send_individual",
        target_table: "profiles", // abstract reference
        target_id: actor.id,      // dummy target for individual
      });

    } else {
      // Broadcast logic
      const admin = createAdminClient();
      
      // Fetch users
      let query = admin.from("profiles").select("id").not("id", "is", null);
      if (recipientType === "broadcast") {
        // Only subscribed users
        query = query.eq("email_notifications_enabled", true);
      }

      const { data: users, error: dbError } = await query;
      
      if (dbError) return { error: "Failed to fetch users: " + dbError.message };
      if (!users || users.length === 0) return { error: "No users found matching criteria." };

      // We need emails. Supabase profiles doesn't always have email if it's isolated to auth.users.
      // Wait, let's look at how emails are retrieved. We can use admin auth api to list all users, or profiles might have an email column?
      // Let's check `profiles` table schema or `auth.users`.
      // `admin.auth.admin.listUsers()` can get emails, but it's paginated.
      
      // Let's fetch all users from auth.admin
      let allAuthUsers: any[] = [];
      let page = 1;
      while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        allAuthUsers = allAuthUsers.concat(data.users);
        if (data.users.length < 1000) break;
        page++;
      }

      // Filter to just the profiles we queried (which handles the opt-in logic)
      const validProfileIds = new Set(users.map(u => u.id));
      const targetEmails = allAuthUsers
        .filter(u => validProfileIds.has(u.id) && u.email)
        .map(u => u.email as string);

      if (targetEmails.length === 0) return { error: "No valid email addresses found." };

      // Send via Brevo
      await sendBroadcastEmail({
        to: targetEmails,
        subject,
        html: body,
      });

      // Audit log
      await admin.from("audit_log").insert({
        actor_id: actor.id,
        action: "email.send_broadcast",
        target_table: "profiles",
        target_id: actor.id, // self reference as initiator
      });
    }

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "An unexpected error occurred." };
  }
}
