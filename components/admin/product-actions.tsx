"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction, publishProductAction } from "@/app/admin/products/actions";

export function ProductActions({
  productId,
  status,
}: {
  productId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await publishProductAction(productId);
            if (res?.error) alert(res.error);
            router.refresh();
          })
        }
        className={`rounded-sm border px-3 py-1.5 text-xs disabled:opacity-50 ${
          status === "published"
            ? "border-gold text-gold hover:border-parchment/30"
            : "border-parchment/20 text-parchment/80 hover:border-gold/60 hover:text-gold"
        }`}
      >
        {pending ? "…" : status === "published" ? "Unpublish" : "Publish"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this product? This removes all its licences.")) return;
          startTransition(() => {
            void deleteProductAction(productId);
          });
        }}
        className="rounded-sm border border-crest-red/40 px-3 py-1.5 text-xs text-crest-red hover:border-crest-red"
      >
        {pending ? "…" : "Delete"}
      </button>
    </div>
  );
}