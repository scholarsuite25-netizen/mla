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
          className={inputClass}
        />
      </Field>
      <Field 
        label="Password"
        action={
          <Link href="/forgot-password" className="text-gold hover:underline">
            Forgot?
          </Link>
        }
      >
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>
      {error && <p className="text-sm text-crest-red">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-crest-red px-4 py-3 text-sm font-medium text-white hover:bg-crest-red/90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-parchment/60">
        New here?{" "}
        <Link href="/register" className="text-gold hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export const inputClass =
  "w-full rounded-sm border border-parchment/20 bg-ink px-3 py-2 text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none";

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
      <div className="mb-1 flex items-center justify-between">
        <span className="block text-xs uppercase tracking-widest text-parchment/60">
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