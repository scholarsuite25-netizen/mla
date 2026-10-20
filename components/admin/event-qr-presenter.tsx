"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Building2,
  MessageCircle,
} from "lucide-react";
import type { StoreSettings } from "@/lib/store";

export function EventQrPresenter({
  siteUrl,
  storeSettings,
}: {
  siteUrl: string;
  storeSettings: StoreSettings;
}) {
  const [eventName, setEventName] = useState("Keynote Masterclass 2026");
  const [couponCode, setCouponCode] = useState("KEYNOTE20");
  const [discountNote, setDiscountNote] = useState("20% Off Tonight Only");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanSite = siteUrl.replace(/\/$/, "");
  const attendeeUrl = `${cleanSite}/shop?coupon=${encodeURIComponent(couponCode)}&event=${encodeURIComponent(eventName)}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(attendeeUrl)}&bgcolor=FFFFFF&color=000000&margin=10`;

  function handleCopy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(attendeeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const cleanWa = storeSettings.whatsapp_number.replace(/[^0-9]/g, "");

  return (
    <div className="space-y-8">
      {/* Configuration Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-[#140F0B] p-6 shadow-xl">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/60 mb-1.5">
            Event / Summit Name
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g. Lagos Leadership Summit 2026"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-parchment focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/60 mb-1.5">
            Event Promo Code
          </label>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="e.g. KEYNOTE20"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-mono uppercase text-gold focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-parchment/60 mb-1.5">
            Offer / Discount Callout
          </label>
          <input
            type="text"
            value={discountNote}
            onChange={(e) => setDiscountNote(e.target.value)}
            placeholder="e.g. 25% Off Tonight Only"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-parchment focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Presentation Slide View (Can be full-screened onto auditorium projector!) */}
      <div
        className={`relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#120D09] via-[#0D0A07] to-black p-8 md:p-14 shadow-2xl transition-all ${
          isFullScreen
            ? "fixed inset-0 z-50 rounded-none border-none p-12 md:p-20 flex flex-col justify-between"
            : ""
        }`}
      >
        {/* Fullscreen Toggle */}
        <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-parchment hover:bg-gold hover:text-ink transition-all backdrop-blur-md cursor-pointer"
          >
            {isFullScreen ? (
              <>
                <Minimize2 size={16} /> Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 size={16} /> Projector Slide Mode
              </>
            )}
          </button>
        </div>

        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left: Speaker Pitch & Direct Transfer Details */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold">
              <Sparkles size={14} /> Official Presentation Materials
            </div>

            <h2 className="font-display text-3xl md:text-5xl text-parchment leading-tight">
              Scan to Download <br />
              <span className="text-gold">Keynote Notes & Slides</span>
            </h2>

            <p className="text-sm md:text-base text-parchment/70 font-light leading-relaxed">
              Access the complete companion framework, presentation slide deck (.pptx), and actionable checklists presented today at <strong>{eventName}</strong>.
            </p>

            {/* Special Promo Badge */}
            <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 inline-flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-parchment/70 font-semibold">
                Event Promo Code:
              </span>
              <span className="font-mono text-xl font-bold text-gold px-3 py-1 rounded-lg bg-black/50 border border-gold/40">
                {couponCode}
              </span>
              <span className="text-xs text-green-400 font-bold">({discountNote})</span>
            </div>

            {/* Direct GTBank Transfer Option */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-parchment/60 font-semibold uppercase">
                <span className="flex items-center gap-1.5 text-gold">
                  <Building2 size={15} /> Direct Bank Transfer
                </span>
                <span>Instant WhatsApp Activation</span>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-white/5 pt-2">
                <div>
                  <p className="text-xs text-parchment/50">Bank & Account Name</p>
                  <p className="font-semibold text-parchment text-sm">
                    {storeSettings.company_bank_name} · {storeSettings.company_account_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-parchment/50">Account Number</p>
                  <p className="font-mono text-xl font-bold text-gold tracking-wider">
                    {storeSettings.company_account_number}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-parchment/60">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-gold" /> Personalized Forensic Watermark
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle size={16} className="text-[#25D366]" /> WhatsApp: +{cleanWa}
              </span>
            </div>
          </div>

          {/* Right: High-Resolution Scannable QR Code */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-3xl bg-white p-6 shadow-[0_0_50px_rgba(212,175,55,0.25)] border-4 border-gold/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrApiUrl}
                alt={`QR code for ${eventName}`}
                className="h-64 w-64 md:h-72 md:w-72 object-contain"
              />
            </div>
            <p className="text-center text-xs uppercase tracking-widest text-parchment/60 font-semibold">
              Point your phone camera to scan & download
            </p>
          </div>
        </div>

        {/* Bottom Copy Link Bar */}
        {!isFullScreen && (
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-parchment/60 truncate max-w-md">
              Shareable Direct Link: <code className="text-gold font-mono">{attendeeUrl}</code>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 font-medium text-parchment hover:bg-gold hover:text-ink transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Attendee Link"}</span>
              </button>

              <a
                href={attendeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-gold/30 px-4 py-2 font-medium text-gold hover:bg-gold hover:text-ink transition-colors"
              >
                <span>Test Live Link</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
