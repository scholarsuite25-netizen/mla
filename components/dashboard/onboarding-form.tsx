"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ACADEMY_PATHWAYS, type Pathway, type PathwayOption } from "@/lib/pathways";
import { completeOnboardingAction } from "@/app/dashboard/actions";
import { inputClass } from "@/components/login-form";
import {
  Briefcase,
  GraduationCap,
  Zap,
  Rocket,
  Award,
  Building,
  User,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const iconMap: Record<Pathway, React.ComponentType<{ size?: number; className?: string }>> = {
  working_professional: Briefcase,
  fresh_graduate: GraduationCap,
  self_employed: Zap,
  job_seeker: Rocket,
  retiree_executive: Award,
  campus_student: Building,
  independent_scholar: User,
};

export function OnboardingForm() {
  const [selectedPathway, setSelectedPathway] = useState<Pathway>("working_professional");
  const [query, setQuery] = useState("Corporate Professional");
  const [matches, setMatches] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = useRef(false);

  const currentPathway =
    ACADEMY_PATHWAYS.find((p) => p.id === selectedPathway) || ACADEMY_PATHWAYS[0];

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

  function handleSelectPathway(p: PathwayOption) {
    setSelectedPathway(p.id);
    setQuery(p.defaultAffiliation);
    setMatches([]);
    setOpen(false);
    dirty.current = false;
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("pathway", selectedPathway);
    if (!formData.get("institution") || (formData.get("institution") as string).trim() === "") {
      formData.set("institution", currentPathway.defaultAffiliation);
    }

    startTransition(async () => {
      const result = await completeOnboardingAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  function handleSkip() {
    setError(null);
    const formData = new FormData();
    formData.set("skipped", "true");
    startTransition(async () => {
      const result = await completeOnboardingAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Track Selection */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-xs uppercase tracking-wider text-slate-700 font-bold">
            Select Your Learning Track
          </label>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0284C7]">
            <Sparkles size={11} className="text-[#00D2FF]" />
            Personalizes your curriculum &amp; mentors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACADEMY_PATHWAYS.map((p) => {
            const Icon = iconMap[p.id] || User;
            const isSelected = selectedPathway === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPathway(p)}
                className={`group relative flex items-start gap-3.5 rounded-2xl p-4 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-2 border-cyan-400 bg-cyan-50/60 shadow-md ring-1 ring-cyan-400/20"
                    : "border border-slate-200/90 bg-white hover:border-cyan-300 hover:bg-slate-50/50 shadow-sm"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isSelected
                      ? "bg-[#00D2FF] text-[#0A0E2A] shadow-sm"
                      : "bg-slate-100 text-slate-500 group-hover:bg-cyan-50 group-hover:text-[#0284C7]"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <p
                    className={`text-xs sm:text-sm font-bold tracking-tight truncate ${
                      isSelected ? "text-[#0A0E2A]" : "text-slate-900"
                    }`}
                  >
                    {p.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600 line-clamp-2">
                    {p.helperText}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 text-cyan-500">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Affiliation / Organization input */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-slate-700 font-bold">
            Organization, Company, Institution, or Field
          </span>
          <p className="text-xs text-slate-500 mb-2">
            Where you work, study, or consult. This will be verified on your academy badge.
          </p>

          <div className="relative">
            <input
              name="institution"
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
              <ul className="absolute z-10 mt-1 max-h-48 overflow-y-auto w-full rounded-xl border border-slate-200 bg-white shadow-xl">
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
                      className="block w-full px-4 py-2.5 text-left text-xs sm:text-sm text-slate-700 hover:bg-cyan-50 hover:text-[#0284C7] transition-colors"
                    >
                      {m}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </label>
        <p className="text-[11px] text-slate-400">
          Example: Access Bank, UNILAG, Freelance Consultant, Retired Director, or your startup name.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* 3. Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleSkip}
          disabled={pending}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
        >
          Skip for now (I will do this later)
        </button>

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[#00D2FF] px-7 py-3 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{pending ? "Saving profile…" : "Save & Continue to Dashboard"}</span>
          {!pending && <ArrowRight size={15} />}
        </button>
      </div>
    </form>
  );
}
