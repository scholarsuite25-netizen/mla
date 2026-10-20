"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { logAuditEvent } from "@/lib/audit";

export type InquiryResult = {
  success: boolean;
  error?: string;
};

export async function submitSpeakingInquiryAction(
  formData: FormData
): Promise<InquiryResult> {
  const organizerName = String(formData.get("organizer_name") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const eventType = String(formData.get("event_type") ?? "Keynote").trim();
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const estimatedAttendees = String(formData.get("estimated_attendees") ?? "").trim();
  const budgetRange = String(formData.get("budget_range") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!organizerName || !organization || !email || !email.includes("@")) {
    return { success: false, error: "Please provide your name, organization, and a valid email address." };
  }

  const admin = createAdminClient();
  const { data: inquiry, error: inqErr } = await admin
    .from("speaking_inquiries")
    .insert({
      organizer_name: organizerName,
      organization,
      email,
      phone: phone || null,
      event_type: eventType,
      event_date: eventDate || null,
      location: location || null,
      estimated_attendees: estimatedAttendees || null,
      budget_range: budgetRange || null,
      message,
      status: "pending",
    })
    .select("id")
    .single();

  if (inqErr) {
    return { success: false, error: inqErr.message };
  }

  await logAuditEvent({
    action: "speaking_inquiry.received",
    targetTable: "speaking_inquiries",
    targetId: inquiry.id,
    actorEmail: email,
    category: "general",
    severity: "notice",
    details: {
      organizer: organizerName,
      organization,
      eventType,
      eventDate,
    },
  });

  // Notify speaker team via email
  const notificationEmail = process.env.SUPER_ADMIN_SEED_EMAIL;
  if (notificationEmail) {
    await sendTransactionalEmail({
      to: notificationEmail,
      subject: `New Speaking / Keynote Inquiry: ${organization} (${eventType})`,
      html: `
        <div style="font-family:sans-serif;line-height:1.6;color:#222;max-width:600px;margin:auto;">
          <h2 style="color:#111;">New Speaking Invitation Received</h2>
          <p>You have received a new speaking request from <strong>${organizerName}</strong> representing <strong>${organization}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold;">Event Type:</td><td style="padding:6px;border-bottom:1px solid #eee;">${eventType}</td></tr>
            <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold;">Proposed Date:</td><td style="padding:6px;border-bottom:1px solid #eee;">${eventDate || "TBD"}</td></tr>
            <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold;">Location:</td><td style="padding:6px;border-bottom:1px solid #eee;">${location || "TBD"}</td></tr>
            <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold;">Estimated Attendees:</td><td style="padding:6px;border-bottom:1px solid #eee;">${estimatedAttendees || "TBD"}</td></tr>
            <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold;">Budget / Honorarium:</td><td style="padding:6px;border-bottom:1px solid #eee;">${budgetRange || "Negotiable"}</td></tr>
            <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold;">Email:</td><td style="padding:6px;border-bottom:1px solid #eee;">${email}</td></tr>
            <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold;">Phone / WhatsApp:</td><td style="padding:6px;border-bottom:1px solid #eee;">${phone || "N/A"}</td></tr>
          </table>
          <p><strong>Message / Theme:</strong></p>
          <blockquote style="border-left:4px solid #D4AF37;padding-left:12px;margin:12px 0;color:#555;">${message || "No special notes provided."}</blockquote>
        </div>
      `,
    }).catch((err) => console.error("Speaking email dispatch failed:", err));
  }

  revalidatePath("/admin/inquiries");
  return { success: true };
}
