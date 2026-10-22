"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveInstitutionAdminRequestAction,
  rejectInstitutionAdminRequestAction,
} from "@/app/admin/requests/actions";

export function InstitutionRequestActions({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await approveInstitutionAdminRequestAction(requestId);
            if (res?.error) alert(res.error);
            router.refresh();
          })
        }
        className="rounded-lg bg-[#00D2FF] px-3.5 py-1.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] shadow-sm transition-all disabled:opacity-50 cursor-pointer"
      >
        Approve
      </button>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await rejectInstitutionAdminRequestAction(requestId);
            if (res?.error) alert(res.error);
            router.refresh();
          })
        }
        className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50/50 transition-all disabled:opacity-50 cursor-pointer"
      >
        Reject
      </button>
    </div>
  );
}
