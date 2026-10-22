"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Users,
  ChevronUp,
} from "lucide-react";

interface RecentSignup {
  name: string;
  affiliation: string;
  action: string;
  href: string;
  timeAgo: string;
  avatarBg: string;
  category: string;
}

const recentSignups: RecentSignup[] = [
  {
    name: "Chinedu Okafor",
    affiliation: "Corporate Track • Access Bank",
    action: "enrolled in Executive Career Planning & AI Strategy",
    href: "/courses",
    timeAgo: "2 mins ago",
    avatarBg: "from-blue-600 to-indigo-700",
    category: "Corporate Executive",
  },
  {
    name: "Fatima Balogun",
    affiliation: "Fresh Graduate / NYSC (Abuja)",
    action: "started Graduate Career Planning & Job Accelerator",
    href: "/courses",
    timeAgo: "4 mins ago",
    avatarBg: "from-emerald-600 to-teal-700",
    category: "Fresh Graduate",
  },
  {
    name: "Engr. Babatunde Adeleke",
    affiliation: "Retiree • Executive Advisory Track",
    action: "joined Retirement Planning & Second-Act Consulting",
    href: "/courses",
    timeAgo: "6 mins ago",
    avatarBg: "from-purple-600 to-indigo-800",
    category: "Executive Fellow",
  },
  {
    name: "Dr. Adebayo Mustapha",
    affiliation: "University of Ibadan (UI)",
    action: "registered as Verified Senior Fellow",
    href: "/fellowship",
    timeAgo: "9 mins ago",
    avatarBg: "from-cyan-600 to-blue-700",
    category: "Faculty Scholar",
  },
  {
    name: "Olamide Shodipo",
    affiliation: "Founder • Lagos SME Network",
    action: "enrolled in Entrepreneurship & Business Setup",
    href: "/courses",
    timeAgo: "11 mins ago",
    avatarBg: "from-sky-600 to-indigo-700",
    category: "Entrepreneur",
  },
  {
    name: "Zainab Abubakar",
    affiliation: "Career Switcher • Tech Transition",
    action: "booked 1-on-1 Mentorship Coaching Session",
    href: "/mentorship",
    timeAgo: "14 mins ago",
    avatarBg: "from-violet-600 to-purple-800",
    category: "Tech Mentee",
  },
  {
    name: "David Taiwo",
    affiliation: "Campus Scholar • Covenant University",
    action: "enrolled in Applied Vibe Coding & AI Literacy",
    href: "/courses",
    timeAgo: "18 mins ago",
    avatarBg: "from-blue-500 to-cyan-600",
    category: "Campus Scholar",
  },
  {
    name: "Dr. (Mrs.) Folashade Alabi",
    affiliation: "University of Lagos (UNILAG)",
    action: "enrolled in Generative AI Research & Prompt Design",
    href: "/courses",
    timeAgo: "22 mins ago",
    avatarBg: "from-indigo-600 to-blue-800",
    category: "Senior Fellow",
  },
  {
    name: "Kelechi Nnamdi",
    affiliation: "Software Architect • Paystack Alum",
    action: "approved as Verified Industry Tech Mentor",
    href: "/mentorship/become",
    timeAgo: "27 mins ago",
    avatarBg: "from-emerald-600 to-cyan-700",
    category: "Industry Mentor",
  },
  {
    name: "Amina Bello",
    affiliation: "Ahmadu Bello University (ABU)",
    action: "registered for Campus AI Hackathon & Summit",
    href: "/events",
    timeAgo: "35 mins ago",
    avatarBg: "from-amber-600 to-orange-700",
    category: "Campus Scholar",
  },
  {
    name: "Tunde Bakare",
    affiliation: "Senior Manager • MTN Nigeria",
    action: "joined Executive Leadership & Digital Transformation Track",
    href: "/membership",
    timeAgo: "42 mins ago",
    avatarBg: "from-blue-700 to-indigo-900",
    category: "Corporate Track",
  },
  {
    name: "Blessing Eze",
    affiliation: "Obafemi Awolowo University (OAU)",
    action: "completed Verification for Student Fellowship",
    href: "/fellowship",
    timeAgo: "50 mins ago",
    avatarBg: "from-teal-600 to-emerald-700",
    category: "Fellowship Scholar",
  },
];

export function RegistrationPopup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const isHoveredRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Advance to next member
  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev + 1) % recentSignups.length);
  }, []);

  // Go to previous member
  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) =>
      prev === 0 ? recentSignups.length - 1 : prev - 1
    );
  }, []);

  // Initial automatic open & rotation loop
  useEffect(() => {
    // Check if user manually minimized in this session
    let userPrefersMinimized = false;
    try {
      userPrefersMinimized =
        sessionStorage.getItem("mla_activity_user_minimized") === "true";
    } catch {
      // sessionStorage unavailable
    }

    // Auto-open after 3 seconds on first load if not manually minimized
    let initialTimer: NodeJS.Timeout | undefined;
    if (!userPrefersMinimized) {
      initialTimer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
    }

    // Rotation timer every 9 seconds
    const interval = setInterval(() => {
      if (isHoveredRef.current || !isOpen) return;
      setCurrentIndex((prev) => (prev + 1) % recentSignups.length);
    }, 9000);

    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isOpen]);

  // Handle escape key and click outside to minimize
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        // Close card if clicked outside
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Minimize handler
  const handleMinimize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    try {
      sessionStorage.setItem("mla_activity_user_minimized", "true");
    } catch {
      // ignore
    }
  };

  // Toggle button handler
  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!next) {
        try {
          sessionStorage.setItem("mla_activity_user_minimized", "true");
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const item = recentSignups[currentIndex];

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-4 sm:left-6 z-40 flex flex-col items-start print:hidden"
      aria-label="Recent academy activity widget"
    >
      {/* EXPANDED ACTIVITY POPUP CARD */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="Registered Members Activity"
          onMouseEnter={() => {
            isHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveredRef.current = false;
          }}
          className="mb-3 w-[320px] sm:w-[360px] max-w-[calc(100vw-5rem)] animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="relative group rounded-2xl border border-slate-200/90 bg-white/95 p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(18,13,66,0.18)] ring-1 ring-slate-900/5 transition-all hover:border-cyan-300">
            {/* Header: Badge & Controls */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0284C7]">
                <Sparkles size={10} className="text-[#00D2FF]" />
                <span>Verified Registration</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-mono pr-1">
                  {currentIndex + 1}/{recentSignups.length}
                </span>

                {/* Previous Button */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Previous registered member"
                  title="Previous registration"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Next registered member"
                  title="Next registration"
                >
                  <ChevronRight size={14} />
                </button>

                {/* Minimize / Close Button */}
                <button
                  type="button"
                  onClick={handleMinimize}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer ml-1"
                  aria-label="Minimize activity popup"
                  title="Minimize popup"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Member Details Card */}
            <Link
              href={item.href}
              className="flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-xl"
            >
              {/* Avatar Initial with Biru gradient */}
              <div
                className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.avatarBg} text-sm font-bold text-white shadow-sm`}
              >
                {item.name.charAt(0)}
                <span
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white ring-2 ring-white"
                  title="Verified Scholar"
                >
                  <ShieldCheck size={10} />
                </span>
              </div>

              {/* Content Body */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {item.name}
                  </p>
                  <span className="inline-block shrink-0 rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-medium text-slate-600">
                    {item.category}
                  </span>
                </div>

                <p className="font-normal text-slate-500 text-[11px] truncate">
                  {item.affiliation}
                </p>

                <p className="text-[11px] font-medium leading-snug text-slate-800 mt-1">
                  {item.action}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-slate-400 pt-1 border-t border-slate-50">
                  <div className="flex items-center gap-1.5">
                    <span>{item.timeAgo}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                      Verified Scholar
                    </span>
                  </div>
                  <span className="flex items-center gap-0.5 text-[#0284C7] font-semibold group-hover:translate-x-0.5 transition-transform">
                    Explore Track <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </aside>
      )}

      {/* PERSISTENT POPUP BUTTON AT BOTTOM LEFT ON FOOTER */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          isOpen
            ? "Hide registered members popup"
            : "Show registered members popup"
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="group flex items-center gap-2.5 rounded-full border border-cyan-400/50 bg-gradient-to-r from-[#120D42] via-[#161152] to-[#1E1668] px-3.5 py-2.5 sm:px-4 sm:py-2.5 text-white shadow-[0_8px_25px_rgba(18,13,66,0.4)] backdrop-blur-md transition-all hover:scale-105 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(0,210,255,0.45)] active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        {/* Pulsing Live Dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>

        {/* Text & Icon */}
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-cyan-300 group-hover:text-white transition-colors" />
          <span className="text-xs font-bold text-white tracking-tight">
            Live Activity
          </span>
          <span className="rounded-full bg-cyan-400/20 border border-cyan-300/30 px-1.5 py-0.2 text-[10px] font-bold text-cyan-300">
            {recentSignups.length}
          </span>
        </div>

        {/* Up / Down Chevron Indicator */}
        <ChevronUp
          size={14}
          className={`text-cyan-300 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>
    </div>
  );
}
