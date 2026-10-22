"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, MessageCircle, X, Headphones } from "lucide-react";

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneNumber = "2348034710699";
  const formattedPhone = "+234 803 471 0699";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    "Hello MLA Academy, I would like to inquire about courses, mentorship, and membership."
  )}`;

  // Close menu on click outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 print:hidden"
    >
      {/* Expanded Quick Options Menu */}
      {open && (
        <div
          role="menu"
          aria-label="Contact options"
          className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* WhatsApp Direct Option */}
          <a
            role="menuitem"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-[#120D42]/95 px-4 py-3 backdrop-blur-xl shadow-2xl transition-all hover:scale-[1.02] hover:border-emerald-400 hover:bg-[#1A1359] focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.5)]">
              <MessageCircle size={18} />
            </div>
            <div className="text-left pr-2">
              <p className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                Chat on WhatsApp
              </p>
              <p className="text-[10px] text-slate-300">Instant direct response</p>
            </div>
          </a>

          {/* Direct Phone Call Option */}
          <a
            role="menuitem"
            href={`tel:+${phoneNumber}`}
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 rounded-2xl border border-cyan-400/40 bg-[#120D42]/95 px-4 py-3 backdrop-blur-xl shadow-2xl transition-all hover:scale-[1.02] hover:border-cyan-300 hover:bg-[#1A1359] focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 shadow-[0_0_14px_rgba(0,210,255,0.5)]">
              <Phone size={17} />
            </div>
            <div className="text-left pr-2">
              <p className="text-xs font-bold text-cyan-300 group-hover:text-white">
                Call MLA Helpline
              </p>
              <p className="text-[10px] text-slate-300 font-mono">
                {formattedPhone}
              </p>
            </div>
          </a>
        </div>
      )}

      {/* Primary Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close contact menu" : "Contact MLA Helpline"}
        aria-expanded={open}
        aria-haspopup="true"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/50 bg-gradient-to-br from-[#1E1668] to-[#120D42] text-cyan-300 shadow-[0_10px_30px_rgba(18,13,66,0.5)] backdrop-blur-md transition-all hover:scale-105 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(0,210,255,0.45)] active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        {/* Pulsing Outer Ring */}
        {!open && (
          <span className="absolute -inset-1 rounded-full border border-cyan-400/30 opacity-75 animate-ping pointer-events-none" />
        )}

        {open ? (
          <X size={22} className="text-white transition-transform group-hover:rotate-90" />
        ) : (
          <div className="relative">
            <Headphones size={22} className="text-cyan-300 group-hover:text-white transition-colors" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-[#120D42]" />
          </div>
        )}
      </button>
    </div>
  );
}
