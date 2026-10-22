"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestInstitutionAdminAction } from "@/app/dashboard/actions";

export function RequestAdminButton({
  institutionName,
  hasPendingRequest,
  isAlreadyAdmin,
}: {
  institutionName: string | null;
  hasPendingRequest: boolean;
  isAlreadyAdmin: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!institutionName) {
    return (
      <p className="text-xs text-slate-500">
        Update your institution in settings to request administration rights.
      </p>
    );
  }

  if (isAlreadyAdmin) {
    return (
      <p className="text-xs font-semibold text-[#0284C7]">
        You are an administrator of {institutionName}.
      </p>
    );
  }

  if (hasPendingRequest) {
    return (
      <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
        <p className="text-xs sm:text-sm text-slate-800">
          Request to administer <strong className="text-[#0284C7] font-bold">{institutionName}</strong> is pending Super Admin review.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-slate-900">
          Request to administer {institutionName}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Institution Admins can approve members and create school-scoped events.
        </p>
      </div>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await requestInstitutionAdminAction();
            if (res?.error) alert(res.error);
            router.refresh();
          })
        }
        className="rounded-lg bg-[#00D2FF] px-4 py-2 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] shadow-sm transition-all disabled:opacity-50 cursor-pointer"
      >
        {pending ? "Submitting…" : "Request Admin Role"}
      </button>
    </div>
  );
}
