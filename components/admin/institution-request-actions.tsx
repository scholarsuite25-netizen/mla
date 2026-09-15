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
        className="rounded-sm bg-crest-red px-3 py-1 text-xs font-medium text-white hover:bg-crest-red/90 disabled:opacity-50"
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
        className="rounded-sm border border-parchment/20 px-3 py-1 text-xs text-parchment/70 hover:border-crest-red hover:text-crest-red disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
