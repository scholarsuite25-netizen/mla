"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, ShieldCheck, Download, ArrowRight, Library, FileText, CheckCircle2 } from "lucide-react";
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
    payment_method?: string | null;
    paystack_reference: string | null;
    transfer_reference?: string | null;
    created_at: string;
  };
  licenses: LicenseItem[];
  buyerEmail?: string;
}

export function DeliveryClient({ order, licenses, buyerEmail }: DeliveryClientProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copyToClipboard(key: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  }

  const isFree = Number(order.amount) === 0;
  const isPaid = order.status === "paid";
  const orderRef = order.transfer_reference || order.paystack_reference || order.id.slice(0, 10).toUpperCase();
  const effectiveEmail = buyerEmail || order.buyer_email || "";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* WooCommerce-Style Order Received Notice Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <span className="inline-block rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              {isFree ? "Complimentary Access" : isPaid ? "Payment Verified" : "Order Placed"}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {isPaid || isFree ? "Your Downloads Are Ready!" : "Order Awaiting Confirmation"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Thank you, <strong className="text-slate-900 font-semibold">{order.buyer_name || "Valued Reader"}</strong>.
              Your digital publication licenses have been issued.
            </p>
          </div>
        </div>

        {/* Order Details Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="border-r border-slate-100 pr-3 last:border-r-0">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Order Reference</span>
            <span className="font-mono font-bold text-slate-800 break-all">{orderRef}</span>
          </div>

          <div className="border-r border-slate-100 pr-3 last:border-r-0">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Date</span>
            <span className="font-semibold text-slate-800">
              {new Date(order.created_at).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="border-r border-slate-100 pr-3 last:border-r-0">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Delivery Email</span>
            <span className="font-semibold text-slate-800 truncate block">{effectiveEmail || "Sent to your email"}</span>
          </div>

          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Total</span>
            <span className="font-bold text-slate-900">
              {isFree ? "Free (₦0.00)" : `₦${Number(order.amount).toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* WooCommerce-Standard Downloads Table Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-[#0284C7] border border-cyan-200">
              <Download size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Downloads ({licenses.length})
              </h2>
              <p className="text-xs text-slate-500">
                Click below to begin your direct high-speed download.
              </p>
            </div>
          </div>
        </div>

        {licenses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">Verifying and generating your digital licenses...</p>
            <p className="text-[11px] text-slate-400">Please refresh this page in a moment if your files do not appear immediately.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {licenses.map((lic) => {
              const isCopied = copiedKey === lic.license_key;
              const title = lic.product?.title || "Digital Publication";
              const type = lic.product?.type || "pdf";

              return (
                <div
                  key={lic.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-cyan-300 hover:bg-slate-50 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-cyan-50 text-[#0284C7] border border-cyan-200/80 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          {type.replace("_", " ")}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Check size={12} /> Ready for Download
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                        {title}
                      </h3>
                    </div>

                    <div className="shrink-0">
                      {lic.product?.file_url ? (
                        <DownloadLink
                          licenseId={lic.id}
                          licenseKey={lic.license_key}
                          orderId={order.id}
                          buyerEmail={effectiveEmail}
                          title={title}
                          label="Download File"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00D2FF] px-6 py-2.5 text-xs font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] active:scale-[0.98] transition cursor-pointer"
                        />
                      ) : (
                        <span className="text-xs text-amber-600 italic">File processing by publisher</span>
                      )}
                    </div>
                  </div>

                  {/* License Key Box */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                        <KeyRound size={11} className="text-[#0284C7]" />
                        Cryptographic License Key
                      </span>
                      <code className="block font-mono text-xs font-bold text-slate-800 select-all truncate">
                        {lic.license_key}
                      </code>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(lic.license_key)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-cyan-400 hover:text-[#0284C7] transition cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      {isCopied ? (
                        <>
                          <Check size={13} className="text-emerald-500" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Personal License: Up to {lic.max_activations} devices</span>
                    <span>Activations Used: {lic.activation_count} of {lic.max_activations}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Forensic Anti-Piracy Watermark Notice */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-3.5 text-xs text-slate-600 shadow-sm">
        <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Forensic Anti-Piracy Protection Active</h4>
          <p className="mt-1 leading-relaxed text-slate-600">
            Each downloaded publication includes an invisible cryptographic digital watermark embedding your buyer credentials (
            <strong className="text-slate-800">{order.buyer_name || "Registered User"}</strong> ·{" "}
            <strong className="text-slate-800">{effectiveEmail}</strong>). You retain permanent lifetime access to re-download this material.
          </p>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:border-cyan-400 hover:text-[#0284C7] transition shadow-sm"
        >
          <FileText size={14} />
          <span>Browse More Materials</span>
        </Link>

        <Link
          href="/dashboard/library"
          className="inline-flex items-center gap-2 rounded-xl bg-[#00D2FF] px-6 py-2.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] shadow-md shadow-cyan-500/20 transition"
        >
          <Library size={14} />
          <span>Access My Member Library</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
