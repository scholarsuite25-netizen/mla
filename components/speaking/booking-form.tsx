"use client";

import { useState, useTransition } from "react";
import { submitSpeakingInquiryAction } from "@/app/speaking/actions";
import {
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function SpeakingBookingForm() {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await submitSpeakingInquiryAction(fd);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error ?? "Failed to submit speaking request. Please try again.");
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-green-500/30 bg-green-500/5 p-8 md:p-12 text-center space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-500/20 text-green-400">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="font-display text-2xl text-parchment">
          Speaking Request Received
        </h3>
        <p className="text-sm text-parchment/70 max-w-md mx-auto leading-relaxed">
          Thank you for reaching out. Our executive speaking team will review your event details and respond within 24 business hours with availability and the official speaker kit.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="rounded-full bg-white/10 px-6 py-2.5 text-xs font-semibold text-parchment hover:bg-white/20 transition-all mt-4"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-crest-red/30 bg-crest-red/10 p-4 text-xs text-crest-red">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/70 mb-1.5">
            Your Full Name *
          </label>
          <input
            name="organizer_name"
            required
            type="text"
            placeholder="e.g. Chief Funke Adeleke"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/70 mb-1.5">
            Organization / Company / Institution *
          </label>
          <input
            name="organization"
            required
            type="text"
            placeholder="e.g. Nigerian Institute of Management"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/70 mb-1.5">
            Corporate Email Address *
          </label>
          <input
            name="email"
            required
            type="email"
            placeholder="e.g. adeleke@organization.com"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/70 mb-1.5">
            Phone / WhatsApp Number
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="e.g. +234 803 000 0000"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/70 mb-1.5">
            Engagement Format
          </label>
          <select
            name="event_type"
            className="w-full rounded-xl border border-white/10 bg-[#16100B] px-4 py-3 text-sm text-parchment focus:border-gold focus:outline-none"
          >
            <option value="Keynote">Keynote Address</option>
            <option value="Corporate Training">Corporate Masterclass / Training</option>
            <option value="Executive Retreat">Executive Leadership Retreat</option>
            <option value="Panel / Conference">Panel / Industry Summit</option>
            <option value="VIP Advisory">1-on-1 VIP Strategic Advisory</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/70 mb-1.5">
            Event Date (or Target Month)
          </label>
          <input
            name="event_date"
            type="text"
            placeholder="e.g. Nov 14, 2026 or Q4 2026"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/70 mb-1.5">
            Location / City (or Virtual)
          </label>
          <input
            name="location"
            type="text"
            placeholder="e.g. Lagos, Abuja, London, or Zoom"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/70 mb-1.5">
            Estimated In-Person / Virtual Audience
          </label>
          <input
            name="estimated_attendees"
            type="text"
            placeholder="e.g. 500 – 1,000 attendees"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/70 mb-1.5">
            Estimated Speaker Budget / Honorarium
          </label>
          <input
            name="budget_range"
            type="text"
            placeholder="e.g. ₦1.5M – ₦3M or $3,000 – $5,000"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/70 mb-1.5">
          Event Theme, Context & Audience Objectives
        </label>
        <textarea
          name="message"
          rows={4}
          placeholder="Please describe the purpose of your event, keynote expectations, and any specific themes or lecture material companion packs you would like to distribute to attendees..."
          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-dark to-gold px-8 py-4 font-bold text-ink shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 cursor-pointer"
      >
        <Send size={18} />
        <span>{pending ? "Transmitting Speaking Request…" : "Submit Keynote & Speaking Inquiry"}</span>
      </button>
    </form>
  );
}
