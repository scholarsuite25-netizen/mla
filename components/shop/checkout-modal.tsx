"use client";

import { useState, useTransition } from "react";
import {
  X,
  CreditCard,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Tag,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Lock,
} from "lucide-react";
import {
  startCheckoutAction,
  startBankTransferAction,
  validateCouponAction,
  type CartItemInput,
} from "@/app/shop/actions";
import type { StoreSettings } from "@/lib/store";

export type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id: string;
    title: string;
    price: number;
    type?: string;
    cover_image_url?: string | null;
  } | null;
  bundle?: {
    id: string;
    title: string;
    price: number;
    cover_image_url?: string | null;
  } | null;
  cartItems?: CartItemInput[];
  initialUser?: {
    email?: string;
    name?: string;
  } | null;
  bankSettings?: StoreSettings | null;
};

export function CheckoutModal({
  isOpen,
  onClose,
  product,
  bundle,
  cartItems,
  initialUser,
  bankSettings,
}: CheckoutModalProps) {
  const [pending, startTransition] = useTransition();

  const hasCart = Array.isArray(cartItems) && cartItems.length > 0;
  const isBundle = Boolean(bundle);

  const cartTotal = hasCart ? cartItems.reduce((acc, i) => acc + Number(i.price), 0) : 0;
  const singleItem = bundle || product;
  const basePrice = hasCart ? cartTotal : Number(singleItem?.price ?? 0);
  const displayTitle = hasCart
    ? (cartItems.length === 1 ? cartItems[0].title : `${cartItems[0].title} + ${cartItems.length - 1} more items`)
    : (singleItem?.title ?? "Digital Material");

  // Form State
  const [buyerName, setBuyerName] = useState(initialUser?.name ?? "");
  const [buyerEmail, setBuyerEmail] = useState(initialUser?.email ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "paystack">("bank_transfer");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
    discountType: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Transfer Result State (Step 2)
  const [transferResult, setTransferResult] = useState<{
    orderId: string;
    reference: string;
    amount: number;
    whatsappUrl: string;
    bankDetails: StoreSettings;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isOpen || (!hasCart && !singleItem)) return null;

  const currentTotal = appliedCoupon ? appliedCoupon.finalAmount : basePrice;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponValidating(true);
    setCouponError(null);
    try {
      const res = await validateCouponAction(couponCode, basePrice);
      if (res.valid && res.discountAmount !== undefined && res.finalAmount !== undefined) {
        setAppliedCoupon({
          code: res.code ?? couponCode.toUpperCase(),
          discountAmount: res.discountAmount,
          finalAmount: res.finalAmount,
          discountType: res.discountType ?? "percent",
        });
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.error ?? "Invalid coupon code.");
      }
    } catch {
      setCouponError("Could not validate coupon.");
    } finally {
      setCouponValidating(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);

    if (!buyerName.trim()) {
      setGeneralError("Please enter your full name.");
      return;
    }
    if (!buyerEmail.trim() || !buyerEmail.includes("@")) {
      setGeneralError("Please enter a valid email address so we can deliver your publications.");
      return;
    }

    startTransition(async () => {
      if (currentTotal <= 0) {
        // Zero-cost product or 100% coupon: direct DRM delivery
        const res = await startCheckoutAction({
          productId: hasCart ? undefined : product?.id,
          bundleId: hasCart ? undefined : bundle?.id,
          cartItems: hasCart ? cartItems : undefined,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          couponCode: appliedCoupon?.code,
        });

        if (res.url) {
          window.location.href = res.url;
        } else {
          setGeneralError(res.error ?? "Could not generate download delivery. Please try again.");
        }
      } else if (paymentMethod === "bank_transfer") {
        const res = await startBankTransferAction({
          productId: hasCart ? undefined : product?.id,
          bundleId: hasCart ? undefined : bundle?.id,
          cartItems: hasCart ? cartItems : undefined,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          couponCode: appliedCoupon?.code,
        });

        if (res.success && res.orderId && res.reference && res.whatsappUrl && res.bankDetails) {
          setTransferResult({
            orderId: res.orderId,
            reference: res.reference,
            amount: res.amount ?? currentTotal,
            whatsappUrl: res.whatsappUrl,
            bankDetails: res.bankDetails,
          });
        } else {
          setGeneralError(res.error ?? "Could not initiate transfer. Please try again.");
        }
      } else {
        // Paystack Online
        const res = await startCheckoutAction({
          productId: hasCart ? undefined : product?.id,
          bundleId: hasCart ? undefined : bundle?.id,
          cartItems: hasCart ? cartItems : undefined,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          couponCode: appliedCoupon?.code,
        });

        if (res.url) {
          window.location.href = res.url;
        } else {
          setGeneralError(res.error ?? "Could not open payment gateway.");
        }
      }
    });
  }

  const bankName = transferResult?.bankDetails.company_bank_name ?? bankSettings?.company_bank_name ?? "Guaranty Trust Bank (GTBank)";
  const accountName = transferResult?.bankDetails.company_account_name ?? bankSettings?.company_account_name ?? "Tintol Business Services";
  const accountNumber = transferResult?.bankDetails.company_account_number ?? bankSettings?.company_account_number ?? "0029103844";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header (Royal Navy) */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#120D42] text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-[#00D2FF]" />
            <h2 className="font-display text-base sm:text-lg font-bold text-white">
              {transferResult ? "Payment & Transfer Instructions" : "Instant Secure Checkout"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto p-6 space-y-6">
          {/* STEP 2: Direct Bank Transfer Details Generated */}
          {transferResult ? (
            <div className="space-y-6 text-center animate-in fade-in duration-200">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-[#0284C7] border border-cyan-200 shadow-sm">
                <Building2 size={28} />
              </div>

              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  Transfer Instructions
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Please transfer exactly <strong className="text-slate-900 font-bold">₦{transferResult.amount.toLocaleString()}</strong> to complete your order.
                </p>
              </div>

              {/* Bank Account Details Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Bank Name
                    </p>
                    <p className="text-sm font-bold text-slate-900">{bankName}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#0284C7] bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                    Corporate Account
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Account Name
                    </p>
                    <p className="text-sm font-bold text-slate-900">{accountName}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Account Number
                    </p>
                    <p className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                      {accountNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(accountNumber);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-400 hover:text-[#0284C7] transition cursor-pointer shadow-sm"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 text-left space-y-1 shadow-sm">
                <p>
                  <strong>Payment Reference:</strong>{" "}
                  <span className="font-mono text-[#0284C7] font-bold">{transferResult.reference}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Use this reference in your transfer narration or attach it in your WhatsApp confirmation below.
                </p>
              </div>

              {/* WhatsApp CTA */}
              {transferResult.whatsappUrl && (
                <a
                  href={transferResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer text-xs sm:text-sm"
                >
                  <MessageCircle size={18} />
                  <span>Send Receipt on WhatsApp (+234 803 471 0699)</span>
                  <ExternalLink size={15} />
                </a>
              )}

              <button
                type="button"
                onClick={() => setTransferResult(null)}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                ← Back to Order Details
              </button>
            </div>
          ) : (
            /* STEP 1: Fast Checkout & Payment Method Selection */
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {generalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600 font-medium">
                  {generalError}
                </div>
              )}

              {/* Product Preview Bar */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="min-w-0 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7]">
                    {hasCart
                      ? `${cartItems.length} Publication${cartItems.length > 1 ? "s" : ""}`
                      : isBundle
                      ? "Lecture Notes Bundle"
                      : (product?.type ?? "Digital Material")}
                  </span>
                  <h3 className="font-display text-base font-bold text-slate-900 truncate mt-0.5">
                    {displayTitle}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  {appliedCoupon ? (
                    <div>
                      <p className="text-xs text-slate-400 line-through">
                        ₦{basePrice.toLocaleString()}
                      </p>
                      <p className="font-display text-xl font-bold text-[#0284C7]">
                        ₦{currentTotal.toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="font-display text-xl font-bold text-slate-900">
                      ₦{basePrice.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Buyer Contact Form (Frictionless Guest Delivery) */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Dr. Babatunde Adeyemi"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
                    Your Email Address * (Downloads and license key sent here)
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="e.g. adeyemi@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Coupon / Promo Code Input */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
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
                    disabled={couponValidating || !couponCode.trim()}
                    onClick={handleApplyCoupon}
                    className="rounded-lg bg-cyan-50 border border-cyan-200 px-4 py-2 text-xs font-semibold text-[#0284C7] hover:bg-cyan-100 disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                  >
                    {couponValidating ? "Checking…" : "Apply"}
                  </button>
                </div>

                {appliedCoupon && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
                    <Sparkles size={14} /> Coupon {appliedCoupon.code} applied! Saved ₦{appliedCoupon.discountAmount.toLocaleString()}
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-600">{couponError}</p>
                )}
              </div>

              {/* Payment Method Selector or Complimentary Notice */}
              {currentTotal <= 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mt-0.5">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-emerald-900">
                      Complimentary Material (₦0.00 Free)
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      This publication is complimentary. Your name and email above will be embedded into an official DRM licence and forensically watermarked onto your PDF for anti-piracy protection.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs uppercase font-bold tracking-wider text-slate-700">
                    Select Payment Method:
                  </label>

                  {/* Option 1: Direct Bank Transfer + WhatsApp */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank_transfer")}
                    className={`w-full text-left rounded-2xl border p-4 transition-all flex items-start gap-3.5 cursor-pointer ${
                      paymentMethod === "bank_transfer"
                        ? "border-2 border-cyan-400 bg-cyan-50/70 shadow-sm"
                        : "border border-slate-200 bg-white hover:border-cyan-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        paymentMethod === "bank_transfer"
                          ? "bg-[#00D2FF] text-[#0A0E2A]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Building2 size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-slate-900">
                          Direct GTBank Transfer &amp; WhatsApp Confirmation
                        </p>
                        <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-[#0284C7] uppercase tracking-wider">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Transfer directly to <strong>Tintol Business Services (GTBank)</strong> and attach receipt via WhatsApp for instant activation.
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Paystack Online */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paystack")}
                    className={`w-full text-left rounded-2xl border p-4 transition-all flex items-start gap-3.5 cursor-pointer ${
                      paymentMethod === "paystack"
                        ? "border-2 border-cyan-400 bg-cyan-50/70 shadow-sm"
                        : "border border-slate-200 bg-white hover:border-cyan-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        paymentMethod === "paystack"
                          ? "bg-[#00D2FF] text-[#0A0E2A]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <CreditCard size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-slate-900">
                          Card / Online Paystack Checkout
                        </p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Instant Card
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Pay securely with your debit card, Apple Pay, or bank account for automated instant delivery.
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00D2FF] py-4 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock size={16} />
                <span>
                  {pending
                    ? "Processing..."
                    : currentTotal <= 0
                    ? "Claim Free Download (₦0.00)"
                    : paymentMethod === "bank_transfer"
                    ? `Generate GTBank Invoice (₦${currentTotal.toLocaleString()})`
                    : `Pay ₦${currentTotal.toLocaleString()} via Paystack`}
                </span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Secure 256-bit checkout · Official Tintol Business Services Account</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
