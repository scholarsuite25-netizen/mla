"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { becomeMentorAction, deactivateMentorAction } from "@/app/mentorship/actions";
import { inputClass } from "@/components/login-form";

export function BecomeMentorForm({
  current,
}: {
  current: {
    bio: string;
    availability: string;
    tags: string[];
    isActive: boolean;
  } | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await becomeMentorAction(new FormData(form));
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  function onDeactivate() {
    if (!window.confirm("Remove yourself from the public mentor directory?")) return;
    startTransition(async () => {
      await deactivateMentorAction();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      {current && !current.isActive && (
        <p className="rounded-sm border border-crest-red/30 bg-panel px-3 py-2 text-sm text-crest-red">
          You are currently hidden from the directory. Saving this form
          re-lists you.
        </p>
      )}

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Bio
        </span>
        <textarea
          name="bio"
          defaultValue={current?.bio ?? ""}
          rows={5}
          maxLength={1000}
          required
          className={inputClass}
          placeholder="Who you are, what you teach, who you'd like to mentor."
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Areas of expertise
        </span>
        <input
          name="expertise_tags"
          defaultValue={current?.tags.join(", ") ?? ""}
          required
          className={inputClass}
          placeholder="AI literacy, Vibe coding, Leadership, Software engineering"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Availability
        </span>
        <input
          name="availability"
          defaultValue={current?.availability ?? ""}
          className={inputClass}
          placeholder="e.g. Weekday evenings, weekends"
        />
      </label>

      {error && <p className="text-sm text-crest-red">{error}</p>}
      {saved && <p className="text-sm text-gold">Saved. You are listed as a mentor.</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-crest-red px-6 py-2.5 text-sm font-medium text-white hover:bg-crest-red/90 disabled:opacity-60"
        >
          {pending ? "Saving…" : current ? "Update listing" : "List me as a mentor"}
        </button>
        {current?.isActive && (
          <button
            type="button"
            disabled={pending}
            onClick={onDeactivate}
            className="rounded-sm border border-parchment/20 px-4 py-2.5 text-sm text-parchment/70 hover:border-crest-red hover:text-crest-red disabled:opacity-50"
          >
            Hide my listing
          </button>
        )}
      </div>
    </form>
  );
}