"use client";

import { useState, useTransition } from "react";
import {
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { joinMembershipAction, type MembershipActionResult } from "@/app/membership/actions";
import type { StoreSettings } from "@/lib/store";
import { inputClass } from "@/components/login-form";

export function MembershipCheckoutForm({
  initialUser,
  bankSettings,
}: {
  initialUser?: { email?: string; name?: string } | null;
  bankSettings?: StoreSettings | null;
}) {
  const [pending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(initialUser?.name ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "bank_transfer">("paystack");
  const [transferNote, setTransferNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [transferResult, setTransferResult] = useState<MembershipActionResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await joinMembershipAction({
        fullName,
        email,
        paymentMethod,
        transferNote,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.url) {
        // Redirect to Paystack
        window.location.href = res.url;
      } else if (res.success && res.bankDetails) {
        setTransferResult(res);
      }
    });
  }

  const bankName = bankSettings?.company_bank_name || "Guaranty Trust Bank (GTBank)";
  const accNumber = bankSettings?.company_account_number || "0029103844";
  const accName = bankSettings?.company_account_name || "Tintol Business Services";

  function copyAccount() {
    navigator.clipboard.writeText(accNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (transferResult) {
    return (
      <div className="space-y-6 text-center animate-in fade-in duration-300">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-[#0284C7] mb-2 border border-cyan-200 shadow-sm">
          <Building2 size={28} />
        </div>

        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Transfer Instructions
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Please transfer exactly <strong className="text-slate-900 font-bold">₦20,000</strong> to complete your Lifetime Membership.
          </p>
        </div>

        {/* Bank Account Details Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Bank Name
              </p>
              <p className="text-sm font-bold text-slate-900">{bankName}</p>
            </div>
            <span className="text-[10px] font-bold text-[#0284C7] bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200/80">
              Verified Corporate Account
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Account Name
              </p>
              <p className="text-sm font-bold text-slate-900">{accName}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Account Number
              </p>
              <p className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                {accNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={copyAccount}
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

        {/* WhatsApp Verification CTA */}
        {transferResult.whatsappUrl && (
          <a
            href={transferResult.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer text-xs sm:text-sm"
          >
            <MessageCircle size={18} />
            <span>Confirm Transfer via WhatsApp (+234 803 471 0699)</span>
            <ExternalLink size={15} />
          </a>
        )}

        <button
          type="button"
          onClick={() => setTransferResult(null)}
          className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
        >
          ← Change Details or Payment Method
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600 font-medium">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        {/* Full Name Input */}
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Dr. Adebayo Mustapha"
            className={inputClass}
          />
        </div>

        {/* Email Address Input */}
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
            Email Address for Delivery &amp; Membership ID *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className={inputClass}
          />
          <p className="text-[11px] text-slate-500 mt-1.5">
            Your permanent 50% discount and complimentary Membership Deals will be linked to this email.
          </p>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-2">
            Select Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("paystack")}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-xs font-semibold transition cursor-pointer text-left ${
                paymentMethod === "paystack"
                  ? "border-2 border-cyan-400 bg-cyan-50/70 text-[#0284C7] shadow-sm font-bold"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-slate-50/50"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  paymentMethod === "paystack"
                    ? "bg-[#00D2FF] text-[#0A0E2A]"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <CreditCard size={18} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">Card / Online Paystack</p>
                <p className="text-[10px] text-slate-500">Instant automatic activation</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("bank_transfer")}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-xs font-semibold transition cursor-pointer text-left ${
                paymentMethod === "bank_transfer"
                  ? "border-2 border-cyan-400 bg-cyan-50/70 text-[#0284C7] shadow-sm font-bold"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-slate-50/50"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  paymentMethod === "bank_transfer"
                    ? "bg-[#00D2FF] text-[#0A0E2A]"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Building2 size={18} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">Direct GTBank Transfer</p>
                <p className="text-[10px] text-slate-500">Invoice &amp; bank receipt</p>
              </div>
            </button>
          </div>
        </div>

        {paymentMethod === "bank_transfer" && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 animate-in fade-in duration-200">
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-700">
              Optional Transfer Note / Sender Name
            </label>
            <input
              type="text"
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              placeholder="e.g. Transfer from GTBank mobile app / Adebayo Mustapha"
              className={inputClass}
            />
          </div>
        )}
      </div>

      {/* Primary Submit CTA */}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00D2FF] py-4 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
      >
        <Lock size={16} />
        <span>
          {pending
            ? "Processing..."
            : paymentMethod === "paystack"
            ? "Pay ₦20,000 via Paystack (Instant Activation)"
            : "Generate GTBank Transfer Invoice"}
        </span>
        <ArrowRight size={16} />
      </button>

      <div className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
        <ShieldCheck size={15} className="text-emerald-600" />
        <span>Secure 256-bit encrypted checkout · Official Tintol Business Services Account</span>
      </div>
    </form>
  );
}
