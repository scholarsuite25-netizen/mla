import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const BASE = "https://api.paystack.co";

export function paystackConfigured(): boolean {
  return SECRET.length > 0;
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!paystackConfigured() || !signatureHeader) return false;
  const expected = createHmac("sha512", SECRET)
    .update(rawBody, "utf8")
    .digest("hex");
  const provided = Buffer.from(signatureHeader, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");
  return (
    provided.length === expectedBuf.length &&
    timingSafeEqual(provided, expectedBuf)
  );
}

export async function initializeTransaction(opts: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<{ authorization_url: string }> {
  if (!paystackConfigured()) {
    throw new Error("Paystack is not configured yet.");
  }

  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: opts.email,
      amount: Math.round(opts.amountKobo),
      reference: opts.reference,
      callback_url: opts.callbackUrl,
      currency: "NGN",
      metadata: opts.metadata,
    }),
  });

  const json = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: { authorization_url?: string };
  };
  if (!res.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(json.message ?? "Paystack initialisation failed.");
  }
  return { authorization_url: json.data.authorization_url };
}

export async function fetchTransaction(reference: string) {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${SECRET}` },
  });
  const json = (await res.json()) as { status: boolean; message?: string; data?: { status?: string } };
  if (!res.ok || !json.status) throw new Error(json.message ?? "Verification failed.");
  return json.data;
}