"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";
import { inputClass } from "@/components/login-form";

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

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Full name
        </span>
        <input name="full_name" required autoComplete="name" className={inputClass} />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Institution
        </span>
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
            placeholder="Search or type a new institution"
            autoComplete="off"
            className={inputClass}
          />
          {open && matches.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-sm border border-parchment/10 bg-panel shadow-xl">
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
                    className="block w-full px-3 py-2 text-left text-sm text-parchment/90 hover:bg-ink hover:text-gold"
                  >
                    {m}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <span className="mt-1 block text-xs text-parchment/40">
          Type a school that isn&apos;t listed — it will be created for you.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
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

      <label className="flex items-center gap-2 text-sm text-parchment/70">
        <input
          type="checkbox"
          name="email_notifications"
          value="on"
          defaultChecked
          className="h-4 w-4 accent-gold"
        />
        Email me when new posts or courses are published
      </label>

      {error && <p className="text-sm text-crest-red">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-crest-red px-4 py-3 text-sm font-medium text-white hover:bg-crest-red/90 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-sm text-parchment/60">
        Already registered?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}