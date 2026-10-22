"use client";

import { useState } from "react";
import { resetPasswordAction } from "@/app/auth/actions";
import { inputClass } from "@/components/login-form";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = e.currentTarget;
    const result = await resetPasswordAction(new FormData(form));

    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
    // On success, the action redirects automatically.
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-slate-600 font-semibold">
          New Password
        </span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
          className={inputClass}
        />
      </label>
      
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#00D2FF] px-4 py-3 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Updating password..." : "Update Password"}
      </button>
    </form>
  );
}
