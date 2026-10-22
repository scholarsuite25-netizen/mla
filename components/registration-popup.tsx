"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { X, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

interface RecentSignup {
  name: string;
  affiliation: string;
  action: string;
  href: string;
  timeAgo: string;
  avatarBg: string;
}

const recentSignups: RecentSignup[] = [
  {
    name: "Chinedu Okafor",
    affiliation: "Corporate Track • Access Bank",
    action: "enrolled in Executive Career Planning & AI Strategy",
    href: "/courses",
    timeAgo: "2 mins ago",
    avatarBg: "from-blue-600 to-indigo-700",
  },
  {
    name: "Fatima Balogun",
    affiliation: "Fresh Graduate / NYSC (Abuja)",
    action: "started Graduate Career Planning & Job Accelerator",
    href: "/courses",
    timeAgo: "4 mins ago",
    avatarBg: "from-emerald-600 to-teal-700",
  },
  {
    name: "Engr. Babatunde Adeleke",
    affiliation: "Retiree • Executive Advisory Track",
    action: "joined Retirement Planning & Second-Act Consulting",
    href: "/courses",
    timeAgo: "6 mins ago",
    avatarBg: "from-purple-600 to-indigo-800",
  },
  {
    name: "Dr. Adebayo Mustapha",
    affiliation: "Univ. of Ibadan (UI)",
    action: "registered as Verified Senior Fellow",
    href: "/fellowship",
    timeAgo: "9 mins ago",
    avatarBg: "from-cyan-600 to-blue-700",
  },
  {
    name: "Olamide Shodipo",
    affiliation: "Founder • Lagos SME Network",
    action: "enrolled in Entrepreneurship & Business Setup",
    href: "/courses",
    timeAgo: "11 mins ago",
    avatarBg: "from-sky-600 to-indigo-700",
  },
  {
    name: "Zainab Abubakar",
    affiliation: "Career Switcher • Tech Transition",
    action: "booked 1-on-1 Mentorship Coaching Session",
    href: "/mentorship",
    timeAgo: "14 mins ago",
    avatarBg: "from-violet-600 to-purple-800",
  },
  {
    name: "David Taiwo",
    affiliation: "Campus Scholar • Covenant University",
    action: "enrolled in Applied Vibe Coding & AI Literacy",
    href: "/courses",
    timeAgo: "18 mins ago",
    avatarBg: "from-blue-500 to-cyan-600",
  },
];

const DISMISS_STORAGE_KEY = "mla_activity_popup_dismissed_until";
const SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function RegistrationPopup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true); // default true until verified on client
  const isHoveredRef = useRef(false);

  useEffect(() => {
    // Check if dismissed within the snooze window
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        setDismissed(true);
        return;
      }
    } catch {
      // localStorage may fail in restricted/private browsing modes
    }

    setDismissed(false);

    // Initial polite display delay (5 seconds after page load)
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 5000);

    // Rotate notification every 11 seconds (displaying for ~8s, fading for 3s)
    const interval = setInterval(() => {
      if (isHoveredRef.current) return;

      setVisible(false);
      setTimeout(() => {
        if (!isHoveredRef.current) {
          setCurrentIndex((prev) => (prev + 1) % recentSignups.length);
          setVisible(true);
        }
      }, 700);
    }, 11000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem(
        DISMISS_STORAGE_KEY,
        String(Date.now() + SNOOZE_DURATION_MS)
      );
    } catch {
      // ignore storage error
    }
  };

  if (dismissed || !visible) return null;

  const item = recentSignups[currentIndex];

  return (
    <aside
      aria-label="Recent academy activity notification"
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-40 max-w-[calc(100vw-5rem)] sm:max-w-[360px] animate-in fade-in slide-in-from-bottom-5 duration-300 print:hidden"
    >
      <div className="relative group rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 sm:p-4 backdrop-blur-xl shadow-[0_16px_40px_rgba(18,13,66,0.12)] ring-1 ring-slate-900/5 transition-all hover:shadow-[0_20px_50px_rgba(18,13,66,0.18)] hover:border-cyan-300/80">
        <Link
          href={item.href}
          className="flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-xl"
        >
          {/* Avatar Initial with Biru gradient */}
          <div
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.avatarBg} text-xs font-bold text-white shadow-sm`}
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
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-1.5 w-fit rounded-full bg-cyan-50 border border-cyan-200/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0284C7]">
              <Sparkles size={10} className="text-[#00D2FF]" />
              <span>Verified Activity</span>
            </div>

            <p className="mt-1 text-xs font-bold text-slate-900 truncate">
              {item.name}{" "}
              <span className="font-normal text-slate-500 text-[11px]">
                ({item.affiliation})
              </span>
            </p>

            <p className="text-[11px] leading-snug text-slate-700 mt-0.5">
              {item.action}
            </p>

            <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>{item.timeAgo}</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">
                  MLA Scholar
                </span>
              </div>
              <span className="flex items-center gap-0.5 text-[#0284C7] font-semibold group-hover:translate-x-0.5 transition-transform">
                Explore <ArrowRight size={10} />
              </span>
            </div>
          </div>
        </Link>

        {/* Large Touch-Friendly Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200 transition-colors cursor-pointer"
          aria-label="Dismiss activity notification"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
}
