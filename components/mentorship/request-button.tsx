"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRequestAction } from "@/app/mentorship/actions";

export function RequestMentorButton({
  mentorId,
  pending,
  signedIn,
}: {
  mentorId: string;
  pending: boolean;
  signedIn: boolean;
}) {
  const [pendingTransition, startTransition] = useTransition();
  const router = useRouter();

  if (!signedIn) {
    return (
      <Link
        href={`/login?next=/mentorship/find`}
        className="shrink-0 rounded-sm bg-crest-red px-4 py-2 text-xs font-medium text-white hover:bg-crest-red/90"
      >
        Sign in to request
      </Link>
    );
  }

  if (pending) {
    return (
      <span className="shrink-0 rounded-sm border border-gold/50 px-4 py-2 text-xs text-gold">
        Request pending
      </span>
    );
  }

  return (
    <button
      disabled={pendingTransition}
      onClick={() =>
        startTransition(async () => {
          const res = await createRequestAction(mentorId);
          if (res?.error) alert(res.error);
          router.refresh();
        })
      }
      className="shrink-0 rounded-sm bg-crest-red px-4 py-2 text-xs font-medium text-white hover:bg-crest-red/90 disabled:opacity-60"
    >
      {pendingTransition ? "Sending…" : "Request mentorship"}
    </button>
  );
}