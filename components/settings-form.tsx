"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { updateSettingsAction } from "@/app/dashboard/actions";
import { ACADEMY_PATHWAYS, type Pathway } from "@/lib/pathways";
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

export function SettingsForm({
  fullName,
  emailNotifications,
  institutionName,
  currentPathway,
}: {
  fullName: string;
  emailNotifications: boolean;
  institutionName: string;
  currentPathway?: string | null;
}) {
  const [selectedPathway, setSelectedPathway] = useState<Pathway>(
    (currentPathway as Pathway) || "independent_scholar"
  );
  const [institutionQuery, setInstitutionQuery] = useState(
    institutionName === "None" ? "" : institutionName
  );
  const [matches, setMatches] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(async () => {
      if (institutionQuery.trim().length < 2) {
        setMatches([]);
        return;
      }
      const res = await fetch(`/api/institutions?q=${encodeURIComponent(institutionQuery)}`);
      const json = await res.json().catch(() => ({ institutions: [] }));
      setMatches(json.institutions ?? []);
      setOpen(true);
    }, 250);
    return () => clearTimeout(t);
  }, [institutionQuery]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    formData.set("pathway", selectedPathway);

    startTransition(async () => {
      const result = await updateSettingsAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Your profile and preferences have been updated successfully.</span>
        </div>
      )}

      {/* 1. ACADEMY LEARNING TRACK */}
      <div>
        <label className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-700 font-bold">
            Academy Career Track
          </span>
          <span className="text-[11px] font-semibold text-[#0284C7] flex items-center gap-1">
            <Sparkles size={11} className="text-[#00D2FF]" />
            Determines personalized recommendations
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ACADEMY_PATHWAYS.map((p) => {
            const Icon = iconMap[p.id] || User;
            const isSelected = selectedPathway === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPathway(p.id);
                  if (!institutionQuery || institutionQuery === "") {
                    setInstitutionQuery(p.defaultAffiliation);
                  }
                }}
                className={`flex items-start gap-3 rounded-xl p-3 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-2 border-cyan-400 bg-cyan-50/70 text-slate-900 shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-slate-50/50"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isSelected
                      ? "bg-[#00D2FF] text-[#0A0E2A]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">{p.label}</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                    {p.helperText}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. AFFILIATION / ORGANIZATION */}
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-slate-700 font-bold">
          Organization, Company, Institution, or Field
        </label>
        <div className="relative">
          <input
            name="institution"
            value={institutionQuery}
            onChange={(e) => {
              dirty.current = true;
              setInstitutionQuery(e.target.value);
            }}
            onFocus={() => matches.length > 0 && setOpen(true)}
            placeholder="e.g. Access Bank, University of Lagos, Freelance, or Company Name"
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
                      setInstitutionQuery(m);
                      setMatches([]);
                      setOpen(false);
                      dirty.current = false;
                    }}
                    className="block w-full px-3.5 py-2 text-left text-xs sm:text-sm text-slate-700 hover:bg-cyan-50 hover:text-[#0284C7] transition-colors"
                  >
                    {m}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Displayed on your verified academy badges and certificate accreditations.
        </p>
      </div>

      {/* 3. PERSONAL DETAILS */}
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-slate-700 font-bold">
          Full Name
        </span>
        <input
          name="full_name"
          defaultValue={fullName}
          required
          className={inputClass}
        />
      </label>

      {/* 4. EMAIL NOTIFICATIONS */}
      <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer pt-1">
        <input
          type="checkbox"
          name="email_notifications"
          value="on"
          defaultChecked={emailNotifications}
          className="h-4 w-4 rounded border-slate-300 text-[#0284C7] focus:ring-cyan-400 accent-cyan-500"
        />
        <span>Email me when new masterclasses, AI workshops, or mentor cohorts launch</span>
      </label>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-[#00D2FF] px-6 py-3 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Saving profile changes…" : "Save Profile & Preferences"}
      </button>
    </form>
  );
}