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
      className="rounded-lg bg-[#00D2FF] px-4 py-1.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] shadow-sm transition-all disabled:opacity-50 cursor-pointer"
    >
      {pending ? "Approving…" : "Approve"}
    </button>
  );
}