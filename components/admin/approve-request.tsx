"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveRequestAction } from "@/app/admin/requests/actions";

export function ApproveRequestButton({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await approveRequestAction(requestId);
          if (res?.error) alert(res.error);
          router.refresh();
        })
      }
      className="rounded-sm bg-gold px-4 py-1.5 text-xs font-medium text-ink hover:bg-gold/90 disabled:opacity-50"
    >
      {pending ? "Approving…" : "Approve"}
    </button>
  );
}