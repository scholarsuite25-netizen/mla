"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { rsvpToggleAction } from "@/app/events/actions";

export function RsvpButton({
  eventId,
  isRsvp,
}: {
  eventId: string;
  isRsvp: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await rsvpToggleAction(eventId);
          if (res?.error) alert(res.error);
          router.refresh();
        })
      }
      className={`shrink-0 rounded-sm border px-4 py-2 text-xs font-medium disabled:opacity-50 ${
        isRsvp
          ? "border-gold text-gold hover:border-crest-red hover:text-crest-red"
          : "border-parchment/20 text-parchment/70 hover:border-gold hover:text-gold"
      }`}
    >
      {pending ? "…" : isRsvp ? "Going ✓" : "RSVP"}
    </button>
  );
}