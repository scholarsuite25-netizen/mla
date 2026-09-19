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
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          New Password
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
      
      {error && <p className="text-sm text-crest-red">{error}</p>}
      
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-crest-red px-4 py-3 text-sm font-medium text-white hover:bg-crest-red/90 disabled:opacity-60"
      >
        {pending ? "Updating password..." : "Update Password"}
      </button>
    </form>
  );
}
