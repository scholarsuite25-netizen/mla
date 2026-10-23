"use client";

import { useState } from "react";
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Building2,
  Tag,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { CheckoutModal } from "@/components/shop/checkout-modal";
import { validateCouponAction } from "@/app/shop/actions";

export function CartDrawer() {
  const { items, removeItem, isOpen, setIsOpen, cartCount, cartTotal } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Cart coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  const finalTotal = appliedCoupon ? appliedCoupon.finalAmount : cartTotal;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await validateCouponAction(couponCode, cartTotal);
      if (res.valid && res.discountAmount !== undefined && res.finalAmount !== undefined) {
        setAppliedCoupon({
          code: res.code ?? couponCode.toUpperCase(),
          discountAmount: res.discountAmount,
          finalAmount: res.finalAmount,
        });
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.error ?? "Invalid coupon code.");
      }
    } catch {
      setCouponError("Could not validate coupon.");
    } finally {
      setCouponLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="relative w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
            {/* Header (Royal Navy) */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-[#120D42] text-white">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={20} className="text-[#00D2FF]" />
                <h2 className="font-display text-lg font-bold text-white">
                  Your Cart ({cartCount})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content / Items list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-cyan-50 text-[#0284C7] border border-cyan-200">
                    <ShoppingBag size={30} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Explore keynote slides, lecture notes, audio masterclasses, and executive toolkits to build your digital library.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00D2FF] px-6 py-2.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] shadow-md transition-all cursor-pointer"
                  >
                    Browse Materials
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 hover:border-cyan-300 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-[#0284C7] overflow-hidden shadow-sm">
                            {item.coverImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <ShoppingBag size={20} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-display text-sm font-bold text-slate-900 truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs font-bold text-[#0284C7] mt-0.5">
                              {Number(item.price) === 0 ? "FREE" : `₦${Number(item.price).toLocaleString()}`}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Box */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2 mt-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Have a Promo / Event Code?"
                          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs uppercase font-mono text-slate-800 placeholder:text-slate-400 placeholder:normal-case focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={couponLoading || !couponCode.trim()}
                        onClick={handleApplyCoupon}
                        className="rounded-lg bg-cyan-50 border border-cyan-200 px-3 py-2 text-xs font-semibold text-[#0284C7] hover:bg-cyan-100 disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                      >
                        {couponLoading ? "…" : "Apply"}
                      </button>
                    </div>

                    {appliedCoupon && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                        <Sparkles size={13} /> {appliedCoupon.code} applied: -₦{appliedCoupon.discountAmount.toLocaleString()}
                      </p>
                    )}
                    {couponError && (
                      <p className="text-xs text-red-600">{couponError}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer / Checkout CTA */}
            {items.length > 0 && (
              <div className="border-t border-slate-200 p-6 bg-slate-50/70 space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₦{appliedCoupon.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span className="font-display text-xl text-[#0284C7]">₦{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setCheckoutOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00D2FF] px-6 py-4 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Proceed to Fast Checkout</span>
                    <ArrowRight size={18} />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                    <Building2 size={13} className="text-[#0284C7]" />
                    <span>Pay via Direct GTBank Transfer or Card</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {checkoutOpen && items.length > 0 && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          cartItems={items}
        />
      )}
    </>
  );
}
