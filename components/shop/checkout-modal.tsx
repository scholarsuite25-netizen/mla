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
} from "lucide-react";
import {
  startCheckoutAction,
  startBankTransferAction,
  validateCouponAction,
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
  initialUser,
  bankSettings,
}: CheckoutModalProps) {
  const [pending, startTransition] = useTransition();

  const item = bundle || product;
  const isBundle = Boolean(bundle);

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

  if (!isOpen || !item) return null;

  const basePrice = Number(item.price);
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
      setCouponError("Could not validate coupon. Please check connection.");
    } finally {
      setCouponValidating(false);
    }
  }

  function handleCopyAccount(accountNumber: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleSubmit() {
    setGeneralError(null);

    if (!buyerName.trim()) {
      setGeneralError("Please enter your full name.");
      return;
    }
    if (!buyerEmail.trim() || !buyerEmail.includes("@")) {
      setGeneralError("Please enter a valid email address so we can deliver your notes.");
      return;
    }

    startTransition(async () => {
      if (currentTotal <= 0) {
        // Zero-cost product or 100% coupon: direct DRM delivery
        const res = await startCheckoutAction({
          productId: product?.id,
          bundleId: bundle?.id,
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
          productId: product?.id,
          bundleId: bundle?.id,
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
          productId: product?.id,
          bundleId: bundle?.id,
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

  const bankName = transferResult?.bankDetails.company_bank_name ?? bankSettings?.company_bank_name ?? "Guaranty Trust Bank";
  const accountName = transferResult?.bankDetails.company_account_name ?? bankSettings?.company_account_name ?? "Tintol Business Services";
  const accountNumber = transferResult?.bankDetails.company_account_number ?? bankSettings?.company_account_number ?? "0029103844";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-gold/20 bg-[#120D09] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#18110C]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-gold" />
            <h2 className="font-display text-lg text-parchment">
              {transferResult ? "Payment & Transfer Instructions" : "Instant Secure Checkout"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-parchment/60 hover:bg-white/10 hover:text-parchment transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto p-6 space-y-6">
          {/* STEP 2: Direct Bank Transfer Details Generated */}
          {transferResult ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold mb-1">
                  <CheckCircle2 size={16} /> Order Reserved
                </span>
                <p className="font-mono text-2xl font-bold text-parchment">
                  {transferResult.reference}
                </p>
                <p className="text-xs text-parchment/60 mt-1">
                  Keep this reference code for your WhatsApp receipt
                </p>
              </div>

              {/* Bank Details Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <p className="text-xs uppercase tracking-wider text-gold font-bold">
                  Transfer to Company Account
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-parchment/50">Bank Name</p>
                    <p className="font-semibold text-parchment mt-0.5">{bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-parchment/50">Account Name</p>
                    <p className="font-semibold text-parchment mt-0.5">{accountName}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gold/20 bg-black/40 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gold">Account Number</p>
                    <p className="font-mono text-2xl font-bold text-parchment tracking-wider mt-0.5">
                      {accountNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(accountNumber)}
                    className="flex items-center gap-1.5 rounded-full bg-gold/10 border border-gold/30 px-3.5 py-2 text-xs font-medium text-gold hover:bg-gold hover:text-ink transition-all"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-sm text-parchment/70">Exact Amount to Transfer:</span>
                  <span className="font-display text-2xl font-bold text-gold">
                    ₦{transferResult.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Big Action: WhatsApp Receipt */}
              <div className="space-y-3">
                <a
                  href={transferResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-4 font-bold text-white shadow-[0_0_25px_rgba(37,211,102,0.3)] transition-all hover:bg-[#1EBE5D] hover:shadow-[0_0_35px_rgba(37,211,102,0.5)] text-center text-sm sm:text-base"
                >
                  <MessageCircle size={22} className="fill-current" />
                  <span>Send Receipt on WhatsApp</span>
                  <ExternalLink size={16} />
                </a>
                <p className="text-center text-xs text-parchment/50">
                  Click above to open WhatsApp directly with your receipt. Once confirmed, your license and notes will be sent immediately to <strong>{buyerEmail}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-xs text-parchment/60 hover:text-gold transition-colors py-2"
              >
                Close Window
              </button>
            </div>
          ) : (
            /* STEP 1: Fast Checkout & Payment Method Selection */
            <>
              {/* Product Preview Bar */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="min-w-0 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                    {isBundle ? "Lecture Notes Bundle" : (product?.type ?? "Digital Material")}
                  </span>
                  <h3 className="font-display text-base text-parchment truncate mt-0.5">
                    {item.title}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  {appliedCoupon ? (
                    <div>
                      <p className="text-xs text-parchment/40 line-through">
                        ₦{basePrice.toLocaleString()}
                      </p>
                      <p className="font-display text-xl font-bold text-gold">
                        ₦{currentTotal.toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="font-display text-xl font-bold text-gold">
                      ₦{basePrice.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Buyer Contact Form (Frictionless Guest Delivery) */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-parchment/70 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Dr. Babatunde Adeyemi"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-parchment/70 mb-1">
                    Your Email Address * (Notes and license key sent here)
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="e.g. adeyemi@example.com"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              {/* Event Coupon / Promo Code Input */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Have an Event Promo Code? (e.g. KEYNOTE20)"
                      className="w-full rounded-lg border border-white/10 bg-black/40 pl-9 pr-3 py-2 text-xs uppercase font-mono text-parchment placeholder:text-parchment/30 placeholder:normal-case focus:border-gold focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={couponValidating || !couponCode.trim()}
                    onClick={handleApplyCoupon}
                    className="rounded-lg bg-gold/10 border border-gold/30 px-4 py-2 text-xs font-medium text-gold hover:bg-gold hover:text-ink disabled:opacity-40 transition-colors shrink-0"
                  >
                    {couponValidating ? "Checking…" : "Apply"}
                  </button>
                </div>

                {appliedCoupon && (
                  <p className="text-xs text-green-400 flex items-center gap-1.5 font-medium">
                    <Sparkles size={14} /> Coupon {appliedCoupon.code} applied! Saved ₦{appliedCoupon.discountAmount.toLocaleString()}
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-crest-red">{couponError}</p>
                )}
              </div>

              {/* Payment Method Selector or Complimentary Notice */}
              {currentTotal <= 0 ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-emerald-400">
                      Complimentary Material (₦0.00 Free)
                    </p>
                    <p className="text-xs text-parchment/70 mt-1">
                      This publication is complimentary. Your name and email above will be embedded into an official HMAC DRM licence and forensically watermarked onto your PDF for anti-piracy verification.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-parchment/70">
                    Select Payment Method:
                  </label>

                  {/* Option 1: Direct Bank Transfer + WhatsApp (Recommended) */}
                  <div
                    onClick={() => setPaymentMethod("bank_transfer")}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-start gap-3.5 ${
                      paymentMethod === "bank_transfer"
                        ? "border-gold bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold mt-0.5">
                      <Building2 size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-parchment">
                          Direct Bank Transfer (GTBank) & WhatsApp Proof
                        </p>
                        <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-parchment/60 mt-1">
                        Transfer directly to <strong>Tintol Business Services (GTBank)</strong> from your bank app, then send proof via WhatsApp for instant activation.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Paystack Online */}
                  <div
                    onClick={() => setPaymentMethod("paystack")}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-start gap-3.5 ${
                      paymentMethod === "paystack"
                        ? "border-gold bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-parchment mt-0.5">
                      <CreditCard size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-parchment">
                        Pay Online (Debit Card / Apple Pay / Paystack)
                      </p>
                      <p className="text-xs text-parchment/60 mt-1">
                        Instant online payment using your Visa, Mastercard, Verve, or Apple Pay.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {generalError && (
                <div className="rounded-xl border border-crest-red/30 bg-crest-red/10 p-3 text-xs text-crest-red">
                  {generalError}
                </div>
              )}

              {/* Main Submit Button */}
              <button
                type="button"
                disabled={pending}
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-dark to-gold px-8 py-4 font-bold text-ink shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50"
              >
                {pending ? (
                  <span>Processing Order…</span>
                ) : currentTotal <= 0 ? (
                  <>
                    <span>Claim Complimentary Material &amp; Download</span>
                    <ArrowRight size={18} />
                  </>
                ) : paymentMethod === "bank_transfer" ? (
                  <>
                    <span>Generate GTBank Transfer Details</span>
                    <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    <span>Pay ₦{currentTotal.toLocaleString()} Online</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-parchment/50">
                <ShieldCheck size={14} className="text-gold" />
                <span>Forensic watermark stamped with buyer details upon delivery.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
