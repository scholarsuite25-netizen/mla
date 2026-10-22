"use client";

import { useState } from "react";
import { Phone, MessageCircle, X, Headphones } from "lucide-react";

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const phoneNumber = "2348034710699";
  const formattedPhone = "+234 803 471 0699";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    "Hello MLA Academy, I would like to inquire about courses, mentorship, and membership."
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 print:hidden">
      {/* Expanded Quick Options Menu */}
      {open && (
        <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* WhatsApp Direct Option */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-full border border-emerald-500/30 bg-[#0B1A14]/95 px-4 py-2.5 backdrop-blur-xl shadow-2xl transition-all hover:scale-105 hover:border-emerald-400 hover:bg-emerald-950/80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]">
              <MessageCircle size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                Chat on WhatsApp
              </p>
              <p className="text-[10px] text-white/70">Instant response</p>
            </div>
          </a>

          {/* Direct Phone Call Option */}
          <a
            href={`tel:+${phoneNumber}`}
            className="group flex items-center gap-3 rounded-full border border-cyan-400/30 bg-[#140F47]/95 px-4 py-2.5 backdrop-blur-xl shadow-2xl transition-all hover:scale-105 hover:border-cyan-300 hover:bg-[#1E1668]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,210,255,0.5)]">
              <Phone size={15} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-cyan-300 group-hover:text-white">
                Call Helpline
              </p>
              <p className="text-[10px] text-white/80 font-mono">{formattedPhone}</p>
            </div>
          </a>
        </div>
      )}

      {/* Primary Floating Trigger Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Contact MLA Helpline"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/40 bg-gradient-to-br from-[#1E1668] to-[#120D42] text-cyan-300 shadow-[0_8px_30px_rgba(10,8,40,0.8)] backdrop-blur-md transition-all hover:scale-110 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(0,210,255,0.4)] active:scale-95"
      >
        {/* Pulsing Outer Ring */}
        {!open && (
          <span className="absolute -inset-1 rounded-full border border-cyan-400/30 opacity-75 animate-ping" />
        )}

        {open ? (
          <X size={22} className="text-white transition-transform group-hover:rotate-90" />
        ) : (
          <div className="relative">
            <Headphones size={22} className="text-cyan-300" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-[#120D42]" />
          </div>
        )}
      </button>
    </div>
  );
}
