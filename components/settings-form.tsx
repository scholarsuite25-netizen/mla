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
      <p className="rounded-sm border border-parchment/10 bg-panel px-3 py-2 text-xs text-parchment/60">
        Institution: {institutionName} · await profile sync for changes
      </p>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Full name
        </span>
        <input
          name="full_name"
          defaultValue={fullName}
          required
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-parchment/70">
        <input
          type="checkbox"
          name="email_notifications"
          value="on"
          defaultChecked={emailNotifications}
          className="h-4 w-4 accent-gold"
        />
        Email me when new posts or courses are published
      </label>
      {error && <p className="text-sm text-crest-red">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-crest-red px-6 py-2.5 text-sm font-medium text-white hover:bg-crest-red/90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}