"use client";

import { useTransition } from "react";
import { startCheckoutAction } from "@/app/shop/actions";

export function BuyButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await startCheckoutAction(productId);
          if (res?.url) {
            window.location.href = res.url;
          } else {
            alert(res?.error ?? "Could not start checkout.");
          }
        })
      }
      className="rounded-sm bg-crest-red px-8 py-3 text-sm font-medium text-white hover:bg-crest-red/90 disabled:opacity-50"
    >
      {pending ? "Contacting Paystack…" : "Buy now"}
    </button>
  );
}