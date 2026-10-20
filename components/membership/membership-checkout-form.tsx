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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold mb-2">
          <Building2 size={32} />
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold text-parchment">
            Transfer Instructions
          </h3>
          <p className="text-xs text-parchment/70 mt-1">
            Please transfer exactly <strong>₦20,000</strong> to complete your Lifetime Membership.
          </p>
        </div>

        {/* Bank Account Details Card */}
        <div className="rounded-2xl border border-gold/30 bg-[#140F0B] p-5 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-parchment/50">
                Bank Name
              </p>
              <p className="text-sm font-bold text-parchment">{bankName}</p>
            </div>
            <span className="text-[10px] font-bold text-gold bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/30">
              Official Account
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-parchment/50">
                Account Name
              </p>
              <p className="text-sm font-bold text-parchment">{accName}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-parchment/50">
                Account Number
              </p>
              <p className="text-lg font-mono font-bold text-gold tracking-wider">
                {accNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={copyAccount}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-parchment hover:border-gold/40 hover:text-gold transition cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-parchment/80 text-left space-y-1">
          <p>
            <strong>Payment Reference:</strong>{" "}
            <span className="font-mono text-gold font-bold">{transferResult.reference}</span>
          </p>
          <p className="text-[11px] text-parchment/60">
            Use this reference in your transfer narration or attach it in your WhatsApp verification below.
          </p>
        </div>

        {/* WhatsApp Verification CTA */}
        {transferResult.whatsappUrl && (
          <a
            href={transferResult.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 font-bold text-ink shadow-lg hover:bg-[#20BA5A] transition"
          >
            <MessageCircle size={20} />
            <span>Send Receipt via WhatsApp (+2348034710699)</span>
            <ExternalLink size={16} />
          </a>
        )}

        <button
          type="button"
          onClick={() => setTransferResult(null)}
          className="text-xs text-parchment/50 hover:text-parchment underline cursor-pointer"
        >
          ← Change Details or Payment Method
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="rounded-xl border border-crest-red/30 bg-crest-red/10 p-4 text-xs text-crest-red font-medium">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase font-bold tracking-widest text-parchment/60 mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Dr. / Mr. / Mrs. Full Name"
            className="w-full rounded-xl border border-white/10 bg-[#0E0A08] px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-bold tracking-widest text-parchment/60 mb-1.5">
            Email Address for Delivery &amp; Membership ID *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@university.edu.ng"
            className="w-full rounded-xl border border-white/10 bg-[#0E0A08] px-4 py-3 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
          <p className="text-[11px] text-parchment/40 mt-1">
            Your 50% discount and Membership Deal access will be tied directly to this email address.
          </p>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs uppercase font-bold tracking-widest text-parchment/60 mb-2">
            Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("paystack")}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-semibold transition cursor-pointer ${
                paymentMethod === "paystack"
                  ? "border-gold bg-gold/15 text-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  : "border-white/10 bg-[#0E0A08] text-parchment/60 hover:border-white/20 hover:text-parchment"
              }`}
            >
              <CreditCard size={20} />
              <span>Card / Online Paystack</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("bank_transfer")}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-semibold transition cursor-pointer ${
                paymentMethod === "bank_transfer"
                  ? "border-gold bg-gold/15 text-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                  : "border-white/10 bg-[#0E0A08] text-parchment/60 hover:border-white/20 hover:text-parchment"
              }`}
            >
              <Building2 size={20} />
              <span>Direct GTBank Transfer</span>
            </button>
          </div>
        </div>

        {paymentMethod === "bank_transfer" && (
          <div>
            <label className="block text-xs uppercase font-bold tracking-widest text-parchment/60 mb-1.5">
              Optional Transfer Note / Sender Name
            </label>
            <input
              type="text"
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              placeholder="e.g. Sent from GTBank mobile app"
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] px-4 py-2.5 text-xs text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-dark to-gold px-8 py-4 font-bold text-ink shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] cursor-pointer disabled:opacity-50"
      >
        <Lock size={18} />
        <span>
          {pending
            ? "Processing..."
            : paymentMethod === "paystack"
            ? "Pay ₦20,000 via Paystack (Instant Access)"
            : "Generate GTBank Transfer Invoice"}
        </span>
        <ArrowRight size={18} />
      </button>

      <div className="flex items-center justify-center gap-2 text-center text-xs text-parchment/50">
        <ShieldCheck size={16} className="text-gold" />
        <span>Secure 256-bit encryption · Official Tintol Business Services Account</span>
      </div>
    </form>
  );
}
