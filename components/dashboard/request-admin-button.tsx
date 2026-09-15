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
      <p className="text-xs text-parchment/50">
        Update your institution in settings to request administration rights.
      </p>
    );
  }

  if (isAlreadyAdmin) {
    return (
      <p className="text-xs text-gold">
        You are an administrator of {institutionName}.
      </p>
    );
  }

  if (hasPendingRequest) {
    return (
      <div className="rounded-md border border-gold/40 bg-gold/5 p-4">
        <p className="text-sm text-parchment">
          Request to administer <span className="text-gold font-medium">{institutionName}</span> is pending Super Admin review.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-parchment/10 bg-panel p-4 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-parchment">
          Request to administer {institutionName}
        </p>
        <p className="text-xs text-parchment/50 mt-0.5">
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
        className="rounded-sm bg-crest-red px-4 py-2 text-xs font-medium text-white hover:bg-crest-red/90 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Request Admin Role"}
      </button>
    </div>
  );
}
