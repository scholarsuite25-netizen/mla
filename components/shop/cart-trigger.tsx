"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CartTrigger() {
  const { cartCount, setIsOpen } = useCart();

  if (cartCount === 0) return null;

  return (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-gold-dark to-gold px-5 py-3.5 font-bold text-ink shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] transition-all animate-bounce-subtle cursor-pointer"
      aria-label="Open Shopping Cart"
    >
      <ShoppingBag size={20} />
      <span className="text-sm">Vault Cart</span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-gold text-xs font-bold">
        {cartCount}
      </span>
    </button>
  );
}
