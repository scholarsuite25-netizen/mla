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
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-800">
          If an account exists with that email, we have sent a password reset link. Please check your inbox.
        </div>
        <p className="text-center text-xs text-slate-500 pt-1">
          <Link href="/login" className="text-[#0284C7] hover:underline font-semibold">
            Return to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-slate-600 font-semibold">
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
      
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#00D2FF] px-4 py-3 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Sending link..." : "Send Reset Link"}
      </button>

      <p className="text-center text-xs text-slate-500 pt-1">
        Remembered your password?{" "}
        <Link href="/login" className="text-[#0284C7] hover:underline font-semibold">
          Sign in
        </Link>
      </p>
    </form>
  );
}
