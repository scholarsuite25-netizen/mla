"use client";

import { useState } from "react";
import Link from "next/link";
import { signInAction } from "@/app/auth/actions";

export function LoginForm({ next }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = e.currentTarget;
    const result = await signInAction(new FormData(form));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {next && (
        <input type="hidden" name="next" value={next} />
      )}
      <Field label="Email">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="your.email@example.com"
          className={inputClass}
        />
      </Field>
      <Field 
        label="Password"
        action={
          <Link href="/forgot-password" className="text-[#0284C7] hover:underline font-semibold">
            Forgot?
          </Link>
        }
      >
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
        />
      </Field>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#00D2FF] px-4 py-3 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Signing in…" : "Sign in to Dashboard"}
      </button>
      <p className="text-center text-xs text-slate-500 pt-1">
        New here?{" "}
        <Link href="/register" className="text-[#0284C7] hover:underline font-semibold">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all";

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="block text-xs uppercase tracking-wider text-slate-600 font-semibold">
          {label}
        </span>
        {action && (
          <span className="text-xs">
            {action}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}