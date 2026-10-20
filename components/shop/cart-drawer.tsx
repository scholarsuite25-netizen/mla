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

  // Combined product representation for checkout modal
  const combinedProduct = items.length > 0
    ? {
        id: items[0].id,
        title: items.length === 1 ? items[0].title : `${items[0].title} + ${items.length - 1} more items`,
        price: finalTotal,
        type: "pack",
        cover_image_url: items[0].coverImageUrl,
      }
    : null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="relative w-screen max-w-md bg-[#120D09] border-l border-gold/20 shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-[#18110C]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={20} className="text-gold" />
                <h2 className="font-display text-lg text-parchment">
                  Your Lecture Vault ({cartCount})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-parchment/60 hover:bg-white/10 hover:text-parchment transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content / Items list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gold/10 text-gold">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="font-display text-xl text-parchment">Your cart is empty</h3>
                  <p className="text-xs text-parchment/60 max-w-xs mx-auto">
                    Explore keynote slides, lecture notes, and executive toolkits to build your digital library.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-xs font-bold text-ink hover:bg-gold-light transition-all"
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
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 hover:border-gold/30 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/40 border border-white/5 text-gold overflow-hidden">
                            {item.coverImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <ShoppingBag size={20} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-display text-sm text-parchment truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs font-bold text-gold mt-0.5">
                              ₦{Number(item.price).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-full p-2 text-parchment/40 hover:bg-crest-red/10 hover:text-crest-red transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Box */}
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2 pt-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Event Coupon Code"
                          className="w-full rounded-lg border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs uppercase font-mono text-parchment placeholder:text-parchment/30 placeholder:normal-case focus:border-gold focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={couponLoading || !couponCode.trim()}
                        onClick={handleApplyCoupon}
                        className="rounded-lg bg-gold/10 border border-gold/30 px-3 py-2 text-xs font-semibold text-gold hover:bg-gold hover:text-ink disabled:opacity-40 transition-colors shrink-0"
                      >
                        {couponLoading ? "…" : "Apply"}
                      </button>
                    </div>

                    {appliedCoupon && (
                      <p className="text-xs text-green-400 flex items-center gap-1 font-medium">
                        <Sparkles size={13} /> {appliedCoupon.code} applied: -₦{appliedCoupon.discountAmount.toLocaleString()}
                      </p>
                    )}
                    {couponError && (
                      <p className="text-xs text-crest-red">{couponError}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer / Checkout CTA */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-6 bg-[#16100B] space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-parchment/60">
                    <span>Subtotal</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₦{appliedCoupon.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-parchment pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span className="font-display text-xl text-gold">₦{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setCheckoutOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-dark to-gold px-6 py-3.5 font-bold text-ink shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all cursor-pointer"
                  >
                    <span>Proceed to Fast Checkout</span>
                    <ArrowRight size={18} />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-parchment/50">
                    <Building2 size={13} className="text-gold" />
                    <span>Pay via Direct GTBank Transfer or Card</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {checkoutOpen && combinedProduct && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          product={combinedProduct}
        />
      )}
    </>
  );
}
