"use client";

import { useState, useTransition } from "react";
import { submitSpeakingInquiryAction } from "@/app/speaking/actions";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

export function SpeakingBookingForm() {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [whatsappHref, setWhatsappHref] = useState<string | null>(null);

  const directWhatsappUrl =
    "https://wa.me/2348034710699?text=" +
    encodeURIComponent(
      "Hello S. B. Omotoso! We would like to invite you for a Speaking / Keynote Engagement. Please let us know your availability."
    );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const organizerName = String(fd.get("organizer_name") ?? "").trim();
    const organization = String(fd.get("organization") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const eventType = String(fd.get("event_type") ?? "Keynote").trim();
    const eventDate = String(fd.get("event_date") ?? "").trim();
    const location = String(fd.get("location") ?? "").trim();
    const estimatedAttendees = String(fd.get("estimated_attendees") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    // Construct clean, formatted WhatsApp message
    const waText = [
      `🎤 *NEW SPEAKING INVITATION FOR S. B. OMOTOSO*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Name:* ${organizerName}`,
      `🏢 *Organization:* ${organization}`,
      `✉️ *Email:* ${email}`,
      phone ? `📞 *Phone/WhatsApp:* ${phone}` : null,
      `📋 *Format:* ${eventType}`,
      eventDate ? `📅 *Date/Period:* ${eventDate}` : null,
      location ? `📍 *Location:* ${location}` : null,
      estimatedAttendees ? `👥 *Audience:* ${estimatedAttendees}` : null,
      message ? `\n📝 *Event Theme & Objectives:*\n${message}` : null,
      `━━━━━━━━━━━━━━━━━━━━`,
      `_Sent from MLA Official Speaking Portal (mla.org.ng/speaking)_`,
    ]
      .filter(Boolean)
      .join("\n");

    const fullWaUrl = `https://wa.me/2348034710699?text=${encodeURIComponent(waText)}`;
    setWhatsappHref(fullWaUrl);

    startTransition(async () => {
      const res = await submitSpeakingInquiryAction(fd);
      if (res.success) {
        setSubmitted(true);
        // Automatically attempt opening WhatsApp in a new tab
        try {
          window.open(fullWaUrl, "_blank", "noopener,noreferrer");
        } catch {
          // If popup blocked, customer uses the manual button on confirmation
        }
      } else {
        setError(res.error ?? "Failed to submit speaking request. Please try again.");
      }
    });
  }

  function handleCopyDetails() {
    if (whatsappHref) {
      const match = whatsappHref.match(/text=([^&]+)/);
      if (match && match[1]) {
        navigator.clipboard.writeText(decodeURIComponent(match[1]));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-10 text-center space-y-5">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h3 className="font-sans font-bold text-2xl text-slate-900">
            Speaking Inquiry Recorded &amp; Ready for WhatsApp!
          </h3>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Your event details have been logged in the MLA executive system. For the fastest response, send your details directly to <strong>S. B. Omotoso&apos;s office on WhatsApp</strong> below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] px-7 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <MessageCircle size={18} />
              <span>Send via WhatsApp (+234 803 471 0699)</span>
              <ExternalLink size={14} />
            </a>
          )}

          <button
            type="button"
            onClick={handleCopyDetails}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            <span>{copied ? "Details Copied!" : "Copy Details"}</span>
          </button>
        </div>

        <div className="pt-4 border-t border-emerald-200/80">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            ← Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* WhatsApp Preference Fast-Track Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm">
            <MessageCircle size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Prefer to Book Directly via WhatsApp?
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Chat instantly with S. B. Omotoso&apos;s executive desk for rapid calendar checks.
            </p>
          </div>
        </div>

        <a
          href={directWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <MessageCircle size={15} />
          <span>Chat on WhatsApp (+234 803 471 0699)</span>
        </a>
      </div>

      <div className="relative flex items-center my-4">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Or Complete the Official Event Brief
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Your Full Name *
            </label>
            <input
              name="organizer_name"
              required
              type="text"
              placeholder="e.g. Chief Funke Adeleke"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Organization / Company / Institution *
            </label>
            <input
              name="organization"
              required
              type="text"
              placeholder="e.g. Nigerian Institute of Management"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition shadow-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Corporate Email Address *
            </label>
            <input
              name="email"
              required
              type="email"
              placeholder="e.g. adeleke@organization.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Phone / WhatsApp Number (Preferred) *
            </label>
            <input
              name="phone"
              type="tel"
              required
              placeholder="e.g. +234 803 000 0000"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition shadow-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Engagement Format
            </label>
            <select
              name="event_type"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition shadow-xs"
            >
              <option value="Keynote Address">Keynote Address</option>
              <option value="Corporate Masterclass / Training">Corporate Masterclass / Training</option>
              <option value="Executive Leadership Retreat">Executive Leadership Retreat</option>
              <option value="Panel / Conference">Panel / Industry Conference</option>
              <option value="VIP Strategic Advisory">VIP Strategic Advisory</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Target Date / Period
            </label>
            <input
              name="event_date"
              type="text"
              placeholder="e.g. Nov 14, 2026 or Q4 2026"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition shadow-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Location / City (or Virtual)
            </label>
            <input
              name="location"
              type="text"
              placeholder="e.g. Lagos, Abuja, London, or Zoom"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Estimated In-Person / Virtual Audience
            </label>
            <input
              name="estimated_attendees"
              type="text"
              placeholder="e.g. 500 – 1,000 attendees"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition shadow-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Event Theme, Context &amp; Keynote Objectives
          </label>
          <textarea
            name="message"
            rows={4}
            placeholder="Please describe the theme of your event, keynote expectations, and any specific lecture frameworks or companion handout materials you would like distributed..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition shadow-xs"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#120D42] hover:bg-[#1b145a] px-8 py-4 font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <span>Submitting &amp; Preparing WhatsApp Link…</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm sm:text-base">
                <Send size={18} className="text-[#00D2FF]" />
                <span>Submit Speaking Request &amp; Open WhatsApp</span>
                <span className="ml-1 inline-flex items-center rounded-md bg-[#25D366] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  WhatsApp Connected
                </span>
              </span>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-500 mt-2.5">
            Submitting records your brief in the MLA database and generates an instant, pre-formatted WhatsApp chat to <strong>+234 803 471 0699</strong>.
          </p>
        </div>
      </form>
    </div>
  );
}
