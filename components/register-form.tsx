"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";
import { inputClass } from "@/components/login-form";
import { Check, School, User } from "lucide-react";

export function RegisterForm() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const dirty = useRef(false);

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
    const result = await signUpAction(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  function selectAffiliation(name: string) {
    setQuery(name);
    setMatches([]);
    setOpen(false);
    dirty.current = false;
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-medium">
          Full name
        </span>
        <input name="full_name" required autoComplete="name" className={inputClass} />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-medium">
          Email address
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </label>

      {/* Institution / Affiliation Field with Quick Chips */}
      <div className="block">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-parchment/60 font-medium">
            Institution or Affiliation
          </span>
          <span className="text-[11px] text-gold font-medium">
            Non-tertiary learners welcome
          </span>
        </div>

        {/* Quick select chips for easy 1-click selection */}
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => selectAffiliation("Independent Scholar (Non-Tertiary)")}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
              query.includes("Independent Scholar")
                ? "border border-gold bg-gold/20 text-gold"
                : "border border-white/10 bg-white/5 text-parchment/70 hover:border-gold/40 hover:text-gold"
            }`}
          >
            <User size={11} />
            <span>Independent Scholar (Non-Tertiary)</span>
            {query.includes("Independent Scholar") && <Check size={11} />}
          </button>

          <button
            type="button"
            onClick={() => selectAffiliation("University of Lagos (UNILAG)")}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-parchment/70 hover:border-gold/40 hover:text-gold transition-all"
          >
            <School size={11} />
            <span>UNILAG</span>
          </button>

          <button
            type="button"
            onClick={() => selectAffiliation("University of Ibadan (UI)")}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-parchment/70 hover:border-gold/40 hover:text-gold transition-all"
          >
            <School size={11} />
            <span>UI</span>
          </button>

          <button
            type="button"
            onClick={() => selectAffiliation("Ahmadu Bello University (ABU)")}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-parchment/70 hover:border-gold/40 hover:text-gold transition-all"
          >
            <School size={11} />
            <span>ABU</span>
          </button>
        </div>

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
            placeholder="e.g. Independent Scholar, UNILAG, FUTO, or type your school"
            autoComplete="off"
            className={inputClass}
          />
          {open && matches.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 overflow-y-auto w-full rounded-md border border-parchment/15 bg-panel shadow-2xl">
              {matches.map((m) => (
                <li key={m}>
                  <button
                    type="button"
                    onClick={() => selectAffiliation(m)}
                    className="block w-full px-3 py-2 text-left text-sm text-parchment/90 hover:bg-ink hover:text-gold transition-colors"
                  >
                    {m}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-1.5 text-xs text-parchment/50">
          Not in university? Choose <strong className="text-gold font-normal">&quot;Independent Scholar (Non-Tertiary)&quot;</strong> or type any custom affiliation.
        </p>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-medium">
          Password
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

      <label className="flex items-center gap-2 text-xs text-parchment/70 cursor-pointer pt-1">
        <input
          type="checkbox"
          name="email_notifications"
          value="on"
          defaultChecked
          className="h-4 w-4 accent-gold rounded"
        />
        Receive notifications when new courses, events, or workshops are published
      </label>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-crest-red py-3.5 text-sm font-bold text-white shadow-lg shadow-crest-red/30 transition-all hover:bg-crest-red/90 hover:shadow-crest-red/50 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Creating member account…" : "Create MLA Account"}
      </button>

      <p className="text-center text-xs text-parchment/60 pt-2">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-gold hover:underline">
          Sign in to your dashboard
        </Link>
      </p>
    </form>
  );
}