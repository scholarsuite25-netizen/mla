"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { endRequestAction } from "@/app/mentorship/actions";

export function EndMatchButton({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm("End this mentorship match? This cannot be undone by the other party.")) return;
          startTransition(async () => {
            setError(null);
            const res = await endRequestAction(requestId);
            if (res?.error) setError(res.error);
            router.refresh();
          });
        }}
        className="rounded-sm border border-parchment/20 px-3 py-1.5 text-xs text-parchment/70 hover:border-crest-red hover:text-crest-red disabled:opacity-50"
      >
        {pending ? "Ending…" : "End match"}
      </button>
      {error && <p className="text-xs text-crest-red">{error}</p>}
    </div>
  );
}