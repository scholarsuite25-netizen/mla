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
      className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-gold-dark to-gold px-8 py-4 font-bold text-ink shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50"
    >
      {pending ? "Contacting Secure Payment Gateway…" : "Purchase Securely"}
    </button>
  );
}