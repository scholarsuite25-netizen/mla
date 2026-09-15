"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";
import { inputClass } from "@/components/login-form";
import {
  Briefcase,
  GraduationCap,
  Rocket,
  Zap,
  Building,
  User,
  Award,
} from "lucide-react";

type Pathway =
  | "working_professional"
  | "fresh_graduate"
  | "self_employed"
  | "job_seeker"
  | "retiree_executive"
  | "campus_student"
  | "independent_scholar";

interface PathwayOption {
  id: Pathway;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultAffiliation: string;
  placeholder: string;
  helperText: string;
}

const pathways: PathwayOption[] = [
  {
    id: "working_professional",
    label: "Working Professional",
    icon: Briefcase,
    defaultAffiliation: "Corporate Professional",
    placeholder: "e.g. Banking, Tech, Telecom, or your Company Name",
    helperText: "For managers, executives, engineers, and corporate staff upskilling in AI.",
  },
  {
    id: "fresh_graduate",
    label: "Fresh Graduate / NYSC",
    icon: GraduationCap,
    defaultAffiliation: "Fresh Graduate / NYSC",
    placeholder: "e.g. NYSC Corps Member, Alum of UNILAG, UI, etc.",
    helperText: "Bridge the gap to high-demand corporate & tech careers with proof-of-work.",
  },
  {
    id: "self_employed",
    label: "Self-Employed / Founder",
    icon: Zap,
    defaultAffiliation: "Self-Employed / Entrepreneur",
    placeholder: "e.g. Digital Agency, E-commerce, Freelance Consultant",
    helperText: "Automate your workflows, launch AI products, and scale your business.",
  },
  {
    id: "job_seeker",
    label: "Job Seeker / Switcher",
    icon: Rocket,
    defaultAffiliation: "Career Switcher / Job Seeker",
    placeholder: "e.g. Career Transition to AI, Tech, Product, or Remote Work",
    helperText: "Acquire high-income digital capabilities and 1-on-1 career coaching.",
  },
  {
    id: "retiree_executive",
    label: "Retirement & Second-Act",
    icon: Award,
    defaultAffiliation: "Retiree / Executive Advisory",
    placeholder: "e.g. Retired Director, Board Advisor, Senior Consultant, Second-Act Founder",
    helperText: "Post-retirement occupation, board advisory, wealth preservation, and mentorship.",
  },
  {
    id: "campus_student",
    label: "Campus Scholar (Tertiary)",
    icon: Building,
    defaultAffiliation: "University Student",
    placeholder: "e.g. UNILAG, UI, ABU, FUTO, or type your school",
    helperText: "Connect with fellows across Nigerian universities and gain practical skills.",
  },
  {
    id: "independent_scholar",
    label: "Independent Scholar",
    icon: User,
    defaultAffiliation: "Independent Scholar",
    placeholder: "e.g. Self-Taught Innovator, Lifelong Learner",
    helperText: "Open membership with full access to all courses and mentor directories.",
  },
];

export function RegisterForm() {
  const [selectedPathway, setSelectedPathway] = useState<Pathway>("working_professional");
  const [query, setQuery] = useState("Corporate Professional");
  const [matches, setMatches] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const dirty = useRef(false);

  const currentPathway = pathways.find((p) => p.id === selectedPathway) || pathways[0];

  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(async () => {
      if (query.trim().length < 2) {
        setMatches([]);
        return;
      }
      const res = await fetch(`/api/institutions?q=${encodeURIComponent(query)}`);
      const json = await res.json().catch(() => ({ institutions: [] }));
      setMatches(json.institutions ?? []);
      setOpen(true);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    // Ensure the affiliation is never blank
    if (!formData.get("institution") || (formData.get("institution") as string).trim() === "") {
      formData.set("institution", currentPathway.defaultAffiliation);
    }
    const result = await signUpAction(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  function handleSelectPathway(p: PathwayOption) {
    setSelectedPathway(p.id);
    setQuery(p.defaultAffiliation);
    setMatches([]);
    setOpen(false);
    dirty.current = false;
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      {/* 1. PATHWAY SELECTOR */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-parchment/70 font-semibold">
            Choose Your Track / Background
          </span>
          <span className="text-[11px] text-gold font-medium">
            Personalized for your goals
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {pathways.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPathway === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPathway(p)}
                className={`group flex items-center gap-2 rounded-xl p-2.5 text-left text-xs font-medium transition-all ${
                  isSelected
                    ? "border border-gold bg-gold/15 text-gold shadow-sm shadow-gold/20"
                    : "border border-white/10 bg-white/5 text-parchment/75 hover:border-gold/40 hover:text-parchment hover:bg-white/10"
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? "bg-gold text-ink" : "bg-white/10 text-parchment/60 group-hover:text-gold"
                  }`}
                >
                  <Icon size={13} />
                </div>
                <span className="truncate leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-parchment/60 leading-relaxed">
          {currentPathway.helperText}
        </p>
      </div>

      {/* 2. PERSONAL DETAILS */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-medium">
            Full Name
          </span>
          <input name="full_name" required autoComplete="name" className={inputClass} />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-medium">
            Email Address
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>
      </div>

      {/* 3. AFFILIATION / ORGANIZATION / SCHOOL */}
      <div className="block">
        <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-medium">
          Organization, Company, Institution, or Field
        </label>

        <div className="relative">
          <input
            name="institution"
            required
            value={query}
            onChange={(e) => {
              dirty.current = true;
              setQuery(e.target.value);
            }}
            onFocus={() => matches.length > 0 && setOpen(true)}
            placeholder={currentPathway.placeholder}
            autoComplete="off"
            className={inputClass}
          />

          {open && matches.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 overflow-y-auto w-full rounded-md border border-parchment/15 bg-panel shadow-2xl">
              {matches.map((m) => (
                <li key={m}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(m);
                      setMatches([]);
                      setOpen(false);
                      dirty.current = false;
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-parchment/90 hover:bg-ink hover:text-gold transition-colors"
                  >
                    {m}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-parchment/50">
          Tip: You can keep <span className="text-gold">&quot;{query}&quot;</span> or type your specific company, school, or industry.
        </p>
      </div>

      {/* 4. PASSWORD */}
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-medium">
          Create Password
        </span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>

      {/* NOTIFICATIONS CHECKBOX */}
      <label className="flex items-center gap-2 text-xs text-parchment/70 cursor-pointer pt-1">
        <input
          type="checkbox"
          name="email_notifications"
          value="on"
          defaultChecked
          className="h-4 w-4 accent-gold rounded"
        />
        Send me announcements when new courses, masterclasses, or mentor cohorts launch
      </label>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-crest-red py-3.5 text-sm font-bold text-white shadow-lg shadow-crest-red/30 transition-all hover:bg-crest-red/90 hover:shadow-crest-red/50 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Creating member account…" : "Join MLA Academy"}
      </button>

      <p className="text-center text-xs text-parchment/60 pt-2">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-gold hover:underline">
          Sign in to your member dashboard
        </Link>
      </p>
    </form>
  );
}