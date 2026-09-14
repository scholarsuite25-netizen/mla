"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetActivationsAction, revokeLicenseAction } from "@/app/admin/licenses/actions";

export type LicenseItem = {
  id: string;
  license_key: string;
  max_activations: number;
  activation_count: number;
  is_revoked: boolean;
  created_at: string;
  buyer?: { full_name: string | null } | null;
  products?: { title: string } | { title: string }[] | null;
};

export function LicensesList({ licenses }: { licenses: LicenseItem[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (licenses.length === 0) {
    return <p className="text-parchment/60">No licences issued yet.</p>;
  }

  return (
    <div className="space-y-3">
      {licenses.map((lic) => {
        const product = Array.isArray(lic.products)
          ? lic.products[0]?.title
          : (lic.products as { title: string } | null)?.title ?? "—";
        return (
          <div
            key={lic.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-parchment/10 bg-panel p-4"
          >
            <div className="min-w-0">
              <p className="font-mono text-sm text-parchment">{lic.license_key}</p>
              <p className="mt-1 text-xs text-parchment/50">
                {lic.buyer?.full_name ?? "Buyer"} · {product} ·{" "}
                {lic.activation_count}/{lic.max_activations} activations
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {lic.is_revoked && (
                <span className="rounded-sm bg-crest-red/20 px-2 py-1 text-xs text-crest-red">
                  Revoked
                </span>
              )}
              <button
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await resetActivationsAction(lic.id);
                    if (res?.error) alert(res.error);
                    router.refresh();
                  })
                }
                className="rounded-sm border border-parchment/20 px-3 py-1.5 text-xs text-parchment/80 hover:border-gold/60 hover:text-gold disabled:opacity-50"
              >
                Reset activations
              </button>
              <button
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await revokeLicenseAction(lic.id);
                    if (res?.error) alert(res.error);
                    router.refresh();
                  })
                }
                className="rounded-sm border border-crest-red/40 px-3 py-1.5 text-xs text-crest-red hover:border-crest-red disabled:opacity-50"
              >
                {lic.is_revoked ? "Unrevoke" : "Revoke"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}