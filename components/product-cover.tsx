import React from "react";
import Image from "next/image";
import { BookOpen, Presentation, FileText, Headphones, Award, ShieldCheck, Sparkles } from "lucide-react";

interface ProductCoverProps {
  title: string;
  type: string;
  coverUrl?: string | null;
  className?: string;
  aspectRatio?: string;
  showSpine?: boolean;
}

export function ProductCover({
  title,
  type,
  coverUrl,
  className = "",
  aspectRatio = "aspect-[4/5]",
  showSpine = true,
}: ProductCoverProps) {
  // If a valid custom cover image is provided, display it
  if (coverUrl && !coverUrl.includes("placeholder") && coverUrl.trim() !== "") {
    return (
      <div className={`relative ${aspectRatio} w-full overflow-hidden rounded-xl bg-slate-100 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {showSpine && (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
        )}
      </div>
    );
  }

  // Type-specific icon and color theme
  const normalizedType = type?.toLowerCase() || "";
  let typeLabel = "EXECUTIVE PUBLICATION";
  let TypeIcon = FileText;
  let gradientTheme = "from-[#120D42] via-[#1A145E] to-[#0D0833]";
  let accentColor = "#00D2FF";

  if (normalizedType.includes("slide")) {
    typeLabel = "LECTURE SLIDES & KEYNOTE";
    TypeIcon = Presentation;
    gradientTheme = "from-[#140F47] via-[#1E1766] to-[#0A0726]";
    accentColor = "#38BDF8";
  } else if (normalizedType.includes("manual") || normalizedType.includes("training")) {
    typeLabel = "TRAINING MANUAL & GUIDE";
    TypeIcon = BookOpen;
    gradientTheme = "from-[#100C3D] via-[#181359] to-[#090624]";
    accentColor = "#00D2FF";
  } else if (normalizedType.includes("audio") || normalizedType.includes("spoken")) {
    typeLabel = "AUDIO MASTERCLASS";
    TypeIcon = Headphones;
    gradientTheme = "from-[#161152] via-[#241468] to-[#0F0A3A]";
    accentColor = "#A78BFA";
  } else if (normalizedType.includes("ebook")) {
    typeLabel = "OFFICIAL EBOOK";
    TypeIcon = BookOpen;
    gradientTheme = "from-[#0F172A] via-[#1E293B] to-[#0A0E1A]";
    accentColor = "#00D2FF";
  } else if (normalizedType.includes("monograph")) {
    typeLabel = "ACADEMIC MONOGRAPH";
    TypeIcon = Award;
    gradientTheme = "from-[#120D42] via-[#1C1563] to-[#0B072B]";
    accentColor = "#38BDF8";
  }

  return (
    <div
      className={`relative ${aspectRatio} w-full select-none overflow-hidden rounded-xl bg-gradient-to-br ${gradientTheme} text-white shadow-md flex flex-col justify-between p-4 sm:p-5 transition-transform duration-300 group-hover:shadow-xl group-hover:scale-[1.02] ${className}`}
    >
      {/* Book Spine 3D simulation */}
      {showSpine && (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/50 via-black/20 to-transparent border-r border-white/10" />
      )}

      {/* Subtle Background Lighting & Geometric Circles */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-400/15 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-32 w-48 rounded-full bg-blue-600/10 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Top Header: Organization & Series Seal */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-[#00A3FF] to-[#00E5FF] shadow-sm">
            <span className="font-display text-[10px] font-black text-[#0A0E2A] lowercase">m</span>
          </div>
          <span className="text-[9px] font-bold tracking-widest uppercase text-cyan-300 font-mono">
            MLA PRESS
          </span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-semibold tracking-wider uppercase text-white/70">
          <TypeIcon size={10} style={{ color: accentColor }} />
          <span>{typeLabel.split(" ")[0]}</span>
        </div>
      </div>

      {/* Middle Centerpiece: Formatted Monograph Title */}
      <div className="relative z-10 my-auto py-2">
        <div className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-cyan-300 mb-2">
          <Sparkles size={9} />
          <span>{typeLabel}</span>
        </div>

        <h4 className="font-display text-xs sm:text-sm font-bold text-white leading-snug line-clamp-4 tracking-tight drop-shadow-sm">
          {title}
        </h4>

        {/* Decorative Divider */}
        <div className="mt-2.5 flex items-center gap-1.5 opacity-80">
          <div className="h-[2px] w-6 bg-cyan-400 rounded-full" />
          <div className="h-1 w-1 rotate-45 bg-cyan-300" />
          <div className="h-[1px] flex-1 bg-white/20" />
        </div>
      </div>

      {/* Bottom Footer: Authority, Author & Security Seal */}
      <div className="relative z-10 border-t border-white/15 pt-2 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-semibold text-white/90 uppercase tracking-wider">
            Mentorship &amp; Leadership Academy
          </p>
          <p className="text-[7px] text-white/50 tracking-wider">
            Verified Digital Toolkit
          </p>
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
          <ShieldCheck size={12} />
        </div>
      </div>
    </div>
  );
}
