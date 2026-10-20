"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, ShieldCheck, BookOpen, FileCheck } from "lucide-react";
import { DownloadLink } from "@/components/shop/download-link";
import Link from "next/link";

interface LicenseItem {
  id: string;
  license_key: string;
  max_activations: number;
  activation_count: number;
  product: {
    id: string;
    title: string;
    type: string;
    file_url: string | null;
  } | null;
}

interface DeliveryClientProps {
  order: {
    id: string;
    amount: number;
    status: string;
    buyer_name: string | null;
    buyer_email: string | null;
    paystack_reference: string | null;
    created_at: string;
  };
  licenses: LicenseItem[];
}

export function DeliveryClient({ order, licenses }: DeliveryClientProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copyToClipboard(key: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  }

  const isFree = Number(order.amount) === 0;

  return (
    <div className="space-y-8">
      {/* Status Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#1A1208] via-[#120D09] to-[#0A0705] p-6 sm:p-8 text-center shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 shadow-lg shadow-emerald-950/40">
          <FileCheck size={32} />
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-parchment">
          {isFree ? "Your Complimentary Material is Ready!" : "Payment Confirmed & Delivered!"}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-parchment/70 max-w-lg mx-auto">
          Thank you, <strong className="text-parchment font-semibold">{order.buyer_name || "Valued Reader"}</strong>.
          Your delivery has been authenticated, and an HMAC DRM licence has been generated for your device.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[11px] text-parchment/60">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono">
            Ref: {order.paystack_reference || order.id.slice(0, 12)}
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-3 py-1 font-semibold">
            Status: {order.status.toUpperCase()}
          </span>
          <span className="rounded-full border border-gold/30 bg-gold/10 text-gold px-3 py-1 font-semibold">
            {isFree ? "Complimentary (₦0.00)" : `Total: ₦${Number(order.amount).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Forensic Anti-Piracy Watermark Notice */}
      <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 sm:p-5 flex items-start gap-4 text-xs text-parchment/80">
        <ShieldCheck size={22} className="text-gold shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-gold text-sm">Forensic Anti-Piracy Watermarking Active</h2>
          <p className="mt-1 leading-relaxed text-parchment/70">
            Every downloaded PDF contains an invisible, cryptographically signed watermark embedding your legal name (
            <strong className="text-parchment font-semibold">{order.buyer_name || "Registered User"}</strong>) and email address (
            <strong className="text-parchment font-semibold">{order.buyer_email}</strong>). Unauthorised distribution or public uploading is traceable and strictly prohibited.
          </p>
        </div>
      </div>

      {/* Available Downloads Section */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-parchment flex items-center gap-2">
          <BookOpen size={18} className="text-gold" />
          <span>Licensed Materials &amp; Instant Downloads</span>
        </h2>

        {licenses.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#120D09] p-8 text-center text-xs text-parchment/60">
            Generating your digital delivery links... Please refresh in a few moments.
          </div>
        ) : (
          <div className="space-y-4">
            {licenses.map((lic) => {
              const isCopied = copiedKey === lic.license_key;
              const title = lic.product?.title || "Digital Publication";
              return (
                <div
                  key={lic.id}
                  className="rounded-2xl border border-white/10 bg-[#120D09] p-5 sm:p-6 transition-all hover:border-gold/30 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gold/80 font-semibold">
                        Type: {lic.product?.type?.replace("_", " ") || "Material"}
                      </span>
                      <h3 className="font-display text-base sm:text-lg font-bold text-parchment mt-0.5">
                        {title}
                      </h3>
                    </div>
                    {lic.product?.file_url ? (
                      <DownloadLink
                        licenseId={lic.id}
                        licenseKey={lic.license_key}
                        title={title}
                        label="Download Personalised Copy"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-crest-red to-amber-700 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
                      />
                    ) : (
                      <span className="text-xs text-amber-400 italic">File processing by publisher</span>
                    )}
                  </div>

                  {/* Licence Key Box */}
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-semibold tracking-wider text-parchment/40 flex items-center gap-1.5">
                        <KeyRound size={11} className="text-gold" />
                        <span>Cryptographic Licence Key</span>
                      </p>
                      <code className="block font-mono text-[11px] sm:text-xs text-gold/90 break-all select-all">
                        {lic.license_key}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(lic.license_key)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-parchment hover:bg-white/10 transition-colors self-start sm:self-auto shrink-0"
                    >
                      {isCopied ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} className="text-parchment/60" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-parchment/50 pt-1 border-t border-white/5">
                    <span>Device Activation Limit: {lic.max_activations} devices</span>
                    <span>Activations Used: {lic.activation_count} of {lic.max_activations}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/shop"
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-parchment hover:bg-white/10 transition-colors"
        >
          Explore More Publications
        </Link>
        <Link
          href="/speaking"
          className="rounded-xl border border-gold/30 bg-gold/10 px-5 py-2.5 text-xs font-semibold text-gold hover:bg-gold/20 transition-colors"
        >
          Invite S. B. Omotoso for Speaking
        </Link>
      </div>
    </div>
  );
}
