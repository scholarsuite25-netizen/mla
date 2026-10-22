"use client";

import { useState, useTransition } from "react";
import { updateSettingsAction } from "@/app/dashboard/actions";
import { inputClass } from "@/components/login-form";

export function SettingsForm({
  fullName,
  emailNotifications,
  institutionName,
}: {
  fullName: string;
  emailNotifications: boolean;
  institutionName: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateSettingsAction(new FormData(e.currentTarget));
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
        Institution: <strong className="text-slate-800 font-semibold">{institutionName}</strong> · await profile sync for changes
      </p>
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-wider text-slate-600 font-semibold">
          Full name
        </span>
        <input
          name="full_name"
          defaultValue={fullName}
          required
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          name="email_notifications"
          value="on"
          defaultChecked={emailNotifications}
          className="h-4 w-4 rounded border-slate-300 text-[#0284C7] focus:ring-cyan-400 accent-cyan-500"
        />
        Email me when new posts or courses are published
      </label>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#00D2FF] px-6 py-2.5 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}