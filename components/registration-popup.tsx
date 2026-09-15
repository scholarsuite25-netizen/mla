"use client";

import { useEffect, useState } from "react";
import { X, Sparkles, UserCheck } from "lucide-react";

interface RecentSignup {
  name: string;
  affiliation: string;
  action: string;
  timeAgo: string;
  avatarBg: string;
}

const recentSignups: RecentSignup[] = [
  {
    name: "Chinedu O.",
    affiliation: "University of Lagos (UNILAG)",
    action: "enrolled in AI Literacy & Vibe Coding",
    timeAgo: "2 mins ago",
    avatarBg: "from-amber-600 to-amber-800",
  },
  {
    name: "Fatima B.",
    affiliation: "Independent Scholar (Kano)",
    action: "joined MLA as an Independent Member",
    timeAgo: "4 mins ago",
    avatarBg: "from-emerald-600 to-emerald-800",
  },
  {
    name: "Dr. Adebayo M.",
    affiliation: "University of Ibadan (UI)",
    action: "registered as a Verified Senior Mentor",
    timeAgo: "7 mins ago",
    avatarBg: "from-blue-600 to-blue-800",
  },
  {
    name: "Olamide S.",
    affiliation: "Independent Scholar (Lagos)",
    action: "started Module 1: Prompt Workflows",
    timeAgo: "9 mins ago",
    avatarBg: "from-red-600 to-red-800",
  },
  {
    name: "Zainab A.",
    affiliation: "Ahmadu Bello University (ABU)",
    action: "connected with a Peer Mentor",
    timeAgo: "12 mins ago",
    avatarBg: "from-purple-600 to-purple-800",
  },
  {
    name: "David T.",
    affiliation: "Covenant University",
    action: "accessed Protected Learning Resources",
    timeAgo: "15 mins ago",
    avatarBg: "from-gold-dark to-amber-700",
  },
];

export function RegistrationPopup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Show initial popup after 3.5 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 3500);

    // Rotate every 12 seconds
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % recentSignups.length);
        setVisible(true);
      }, 800);
    }, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  if (dismissed || !visible) return null;

  const item = recentSignups[currentIndex];

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 max-w-[calc(100vw-5rem)] sm:max-w-[340px] animate-in fade-in slide-in-from-bottom-5 duration-300 print:hidden">
      <div className="relative flex items-start gap-3 rounded-2xl border border-gold/30 bg-[#120D09]/95 p-3.5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
        {/* Avatar Initial with gradient */}
        <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.avatarBg} text-xs font-bold text-white shadow-md`}>
          {item.name.charAt(0)}
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white ring-2 ring-[#120D09]">
            <UserCheck size={9} />
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-gold">
            <Sparkles size={11} className="text-gold" />
            <span>Recent Member Activity</span>
          </div>

          <p className="mt-0.5 text-xs font-semibold text-parchment truncate">
            {item.name}{" "}
            <span className="font-normal text-parchment/60">
              ({item.affiliation.replace("University of", "Univ.")})
            </span>
          </p>

          <p className="text-[11px] leading-tight text-parchment/75">
            {item.action}
          </p>

          <p className="mt-1 text-[10px] font-medium text-parchment/40">
            {item.timeAgo} · Verified MLA Member
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 rounded-lg p-1 text-parchment/40 hover:bg-white/5 hover:text-parchment transition-colors"
          aria-label="Dismiss notification"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
