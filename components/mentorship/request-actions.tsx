"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptRequestAction, rejectRequestAction } from "@/app/dashboard/actions";

export function RequestActions({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const res = await acceptRequestAction(requestId);
              if (res?.error) setError(res.error);
              router.refresh();
            })
          }
          className="rounded-sm bg-crest-red px-3 py-1.5 text-xs font-medium text-white hover:bg-crest-red/90 disabled:opacity-50"
        >
          Accept
        </button>
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const res = await rejectRequestAction(requestId);
              if (res?.error) setError(res.error);
              router.refresh();
            })
          }
          className="rounded-sm border border-parchment/20 px-3 py-1.5 text-xs text-parchment/70 hover:border-crest-red hover:text-crest-red disabled:opacity-50"
        >
          Decline
        </button>
      </div>
      {error && <p className="text-xs text-crest-red">{error}</p>}
    </div>
  );
}