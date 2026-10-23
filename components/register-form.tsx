"use client";

import { useState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";
import { inputClass } from "@/components/login-form";
import { Sparkles, User, Mail, Lock, ArrowRight } from "lucide-react";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signUpAction(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {/* 1. Full Name */}
      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-700 font-semibold">
          <User size={13} className="text-[#0284C7]" />
          <span>Full Name</span>
        </span>
        <input
          name="full_name"
          required
          autoComplete="name"
          placeholder="e.g. Adebayo Ogunlesi"
          className={inputClass}
        />
      </label>

      {/* 2. Email Address */}
      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-700 font-semibold">
          <Mail size={13} className="text-[#0284C7]" />
          <span>Email Address</span>
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="adebayo@example.com"
          className={inputClass}
        />
      </label>

      {/* 3. Password */}
      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-700 font-semibold">
          <Lock size={13} className="text-[#0284C7]" />
          <span>Create Password</span>
        </span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          className={inputClass}
        />
      </label>

      {/* Helper notice */}
      <div className="flex items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3 text-[11px] text-slate-600">
        <Sparkles size={14} className="text-[#00D2FF] shrink-0" />
        <span>
          Instant access. You can select your specialized career track and affiliate institution inside your member profile right after joining.
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Submit CTA */}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#00D2FF] py-3.5 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 transition-all hover:bg-[#38BDF8] active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
      >
        <span>{pending ? "Creating your account…" : "Create Member Account"}</span>
        {!pending && <ArrowRight size={15} />}
      </button>

      <p className="text-center text-xs text-slate-500 pt-2">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-[#0284C7] hover:underline">
          Sign in to your member dashboard
        </Link>
      </p>
    </form>
  );
}