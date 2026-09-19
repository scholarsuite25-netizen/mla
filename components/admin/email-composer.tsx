"use client";

import { useState } from "react";
import { sendAdminEmailAction } from "@/app/admin/emails/actions";

export function EmailComposer() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [recipientType, setRecipientType] = useState<"individual" | "broadcast" | "broadcast_all">("individual");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await sendAdminEmailAction(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess("Email sent successfully.");
      (e.target as HTMLFormElement).reset();
    }
    
    setPending(false);
  }

  const inputClass = "w-full rounded-md border border-white/10 bg-[#120D09] px-4 py-2.5 text-sm text-parchment focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
  const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wider text-parchment/60";

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <div className="rounded-xl border border-white/10 bg-[#18130F] p-6 shadow-xl">
        
        {/* Recipient Type */}
        <div className="mb-6">
          <label className={labelClass}>Send To</label>
          <select
            name="recipientType"
            value={recipientType}
            onChange={(e) => setRecipientType(e.target.value as any)}
            className={inputClass}
          >
            <option value="individual">Specific User (Individual Email)</option>
            <option value="broadcast">Subscribed Users Only (Broadcast)</option>
            <option value="broadcast_all">All Registered Users (Ignore Opt-in)</option>
          </select>
        </div>

        {/* Email Address (if individual) */}
        {recipientType === "individual" && (
          <div className="mb-6">
            <label className={labelClass}>Recipient Email</label>
            <input
              type="email"
              name="emailAddress"
              required={recipientType === "individual"}
              placeholder="user@example.com"
              className={inputClass}
            />
          </div>
        )}

        {/* Subject */}
        <div className="mb-6">
          <label className={labelClass}>Subject Line</label>
          <input
            type="text"
            name="subject"
            required
            placeholder="Important update from MLA Academy"
            className={inputClass}
          />
        </div>

        {/* Body */}
        <div className="mb-6">
          <label className={labelClass}>Message Body (HTML Supported)</label>
          <textarea
            name="body"
            required
            rows={10}
            placeholder="Write your email content here. You can use HTML tags like <strong> or <br>."
            className={inputClass}
          />
          <p className="mt-2 text-xs text-parchment/50">
            For broadcasts, this will be sent via Brevo. For individual emails, it will be sent via Resend.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 rounded-md border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-md border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-[#0A0806] hover:bg-gold/90 disabled:opacity-50"
        >
          {pending ? "Sending..." : "Send Email"}
        </button>

      </div>
    </form>
  );
}
