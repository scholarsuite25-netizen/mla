const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// 1-to-many announcements ONLY (e.g. "new blog post published").
// Respects the free-tier 300 emails/day cap — callers queue/batch.
export async function sendBroadcastEmail({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "MLA";

  if (!apiKey || !senderEmail) {
    throw new Error(
      "BREVO_API_KEY and BREVO_SENDER_EMAIL must be set before broadcasting."
    );
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: to.map((email) => ({ email })),
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Brevo error ${res.status}: ${detail}`);
  }
}