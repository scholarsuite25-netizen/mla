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
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-2xl bg-[#120D42] border border-cyan-400/30 px-5 py-3.5 font-bold text-white shadow-xl shadow-cyan-950/25 hover:bg-[#161152] transition-all cursor-pointer"
      aria-label="Open Shopping Cart"
    >
      <ShoppingBag size={18} className="text-[#00D2FF]" />
      <span className="text-xs sm:text-sm font-bold">Cart</span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00D2FF] text-[#0A0E2A] text-xs font-bold">
        {cartCount}
      </span>
    </button>
  );
}
