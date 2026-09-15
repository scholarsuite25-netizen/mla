import { Resend } from "resend";

const FROM = process.env.TRANSACTIONAL_EMAIL_FROM ?? "MLA <enquiries@mla.org.ng>";

let cached: Resend | null = null;

export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  if (!cached) cached = new Resend(apiKey);
  return cached;
}

// 1-to-1 triggered emails only: confirmations, password resets,
// license keys, mentorship approvals. NEVER used for broadcasts —
// that is Brevo's job.
export async function sendTransactionalEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}