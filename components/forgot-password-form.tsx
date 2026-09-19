"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/auth/actions";
import { inputClass } from "@/components/login-form";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const result = await forgotPasswordAction(new FormData(form));

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setPending(false);
  }

  if (success) {
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-sm border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-300">
          If an account exists with that email, we have sent a password reset link. Please check your inbox.
        </div>
        <p className="text-sm text-parchment/60">
          <Link href="/login" className="text-gold hover:underline">
            Return to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Email Address
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder="you@example.com"
        />
      </label>
      
      {error && <p className="text-sm text-crest-red">{error}</p>}
      
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-crest-red px-4 py-3 text-sm font-medium text-white hover:bg-crest-red/90 disabled:opacity-60"
      >
        {pending ? "Sending link..." : "Send Reset Link"}
      </button>

      <p className="text-sm text-parchment/60">
        Remembered your password?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
