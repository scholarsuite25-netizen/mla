"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/app/events/actions";

export function EventForm({
  role,
  institutions,
}: {
  role: string;
  institutions: { id: string; name: string }[];
}) {
  const [pending] = useTransition();
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        const res = await createEventAction(formData);
        if (res?.error) alert(res.error);
        router.refresh();
      }}
      className="mt-8 space-y-5"
    >
      <div>
        <label htmlFor="title" className="mb-1 block text-sm text-parchment/70">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          className="w-full rounded-sm border border-parchment/10 bg-panel px-3 py-2 text-parchment outline-none focus:border-gold"
        />
      </div>

      {role === "super_admin" && (
        <div>
          <label
            htmlFor="institution_id"
            className="mb-1 block text-sm text-parchment/70"
          >
            Institution
          </label>
          <select
            id="institution_id"
            name="institution_id"
            className="w-full rounded-sm border border-parchment/10 bg-panel px-3 py-2 text-parchment outline-none focus:border-gold"
          >
            <option value="platform">Platform-wide</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-parchment/50">
            Platform-wide events reach every member.
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="start_time"
          className="mb-1 block text-sm text-parchment/70"
        >
          Start time
        </label>
        <input
          id="start_time"
          name="start_time"
          type="datetime-local"
          required
          className="w-full rounded-sm border border-parchment/10 bg-panel px-3 py-2 text-parchment outline-none focus:border-gold"
        />
      </div>

      <div>
        <label
          htmlFor="end_time"
          className="mb-1 block text-sm text-parchment/70"
        >
          End time <span className="text-parchment/50">(optional)</span>
        </label>
        <input
          id="end_time"
          name="end_time"
          type="datetime-local"
          className="w-full rounded-sm border border-parchment/10 bg-panel px-3 py-2 text-parchment outline-none focus:border-gold"
        />
      </div>

      <div>
        <label
          htmlFor="location_or_link"
          className="mb-1 block text-sm text-parchment/70"
        >
          Venue or meeting link
        </label>
        <input
          id="location_or_link"
          name="location_or_link"
          maxLength={500}
          placeholder="Hall A, Main Campus — or https://meet.google.com/..."
          className="w-full rounded-sm border border-parchment/10 bg-panel px-3 py-2 text-parchment outline-none focus:border-gold"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm text-parchment/70"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={8}
          maxLength={5000}
          className="w-full rounded-sm border border-parchment/10 bg-panel px-3 py-2 text-parchment outline-none focus:border-gold"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-crest-red px-6 py-2.5 text-sm font-medium text-white hover:bg-crest-red/90 disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create event"}
        </button>
        <Link
          href="/events"
          className="text-sm text-parchment/60 hover:text-gold"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}