"use client";

import { useState, useTransition } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
  Search,
  Check,
  AlertCircle,
  RefreshCw,
  Mail,
} from "lucide-react";
import { approveTransferAction, rejectTransferAction, type OrderRecord } from "@/app/admin/orders/actions";
import type { StoreSettings } from "@/lib/store";

export function BankTransfersManager({
  initialOrders,
  storeSettings,
}: {
  initialOrders: OrderRecord[];
  storeSettings: StoreSettings;
}) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [tab, setTab] = useState<"pending" | "paid" | "all">("pending");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  const pendingTransfers = orders.filter(
    (o) => o.status === "pending" && o.payment_method === "bank_transfer"
  );
  const paidOrders = orders.filter((o) => o.status === "paid");

  const filteredOrders = orders.filter((o) => {
    if (tab === "pending") {
      if (o.status !== "pending" || o.payment_method !== "bank_transfer") return false;
    } else if (tab === "paid") {
      if (o.status !== "paid") return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (o.buyer_name ?? "").toLowerCase();
      const email = (o.buyer_email ?? "").toLowerCase();
      const ref = (o.transfer_reference ?? o.paystack_reference ?? o.id).toLowerCase();
      const prodTitle = (o.digital_products?.title ?? o.product_bundles?.title ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || ref.includes(q) || prodTitle.includes(q);
    }
    return true;
  });

  async function handleApprove(orderId: string) {
    if (!confirm("Confirm and issue access? This will generate the license keys, watermark the notes, and email the buyer.")) {
      return;
    }

    setPendingId(orderId);
    setMessage(null);

    startTransition(async () => {
      const res = await approveTransferAction(orderId);
      setPendingId(null);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "paid" } : o))
        );
        setMessage({
          type: "success",
          text: "Transfer approved! Licenses issued and delivery email sent to the buyer.",
        });
      } else {
        setMessage({
          type: "error",
          text: res.error ?? "Could not approve transfer.",
        });
      }
    });
  }

  async function handleReject(orderId: string) {
    const reason = prompt("Enter a brief reason for declining this transfer (optional):");
    if (reason === null) return;

    setPendingId(orderId);
    setMessage(null);

    startTransition(async () => {
      const res = await rejectTransferAction(orderId, reason);
      setPendingId(null);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "failed" } : o))
        );
        setMessage({
          type: "success",
          text: "Order marked as declined.",
        });
      } else {
        setMessage({
          type: "error",
          text: res.error ?? "Could not decline order.",
        });
      }
    });
  }

  const cleanWa = storeSettings.whatsapp_number.replace(/[^0-9]/g, "");

  return (
    <div className="space-y-8">
      {/* Top Banner & KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Company Bank Settings Card */}
        <div className="md:col-span-2 rounded-2xl border border-gold/30 bg-gradient-to-br from-[#1A140F] to-[#120D09] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
              <Building2 size={16} /> Official Receiving Account
            </span>
            <span className="rounded-full bg-green-500/10 border border-green-500/30 px-2.5 py-0.5 text-[10px] font-bold text-green-400">
              Active
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-2xl text-parchment">
              {storeSettings.company_bank_name}
            </h3>
            <p className="text-sm font-medium text-parchment/80">
              {storeSettings.company_account_name}
            </p>
            <p className="font-mono text-xl font-bold text-gold tracking-wider pt-1">
              {storeSettings.company_account_number}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-parchment/60">
            <span>WhatsApp Line: +{cleanWa}</span>
            <span className="text-gold font-medium">100% Direct Deposit (₦0 Fee)</span>
          </div>
        </div>

        {/* Pending Transfers Metric */}
        <div className="rounded-2xl border border-white/10 bg-[#140F0B] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-parchment/60 font-semibold">
              Pending Transfers
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <p className="font-display text-4xl text-parchment mt-2">
              {pendingTransfers.length}
            </p>
            <p className="text-xs text-parchment/50 mt-1">
              Awaiting WhatsApp receipt verification
            </p>
          </div>
        </div>

        {/* Total Paid Orders Metric */}
        <div className="rounded-2xl border border-white/10 bg-[#140F0B] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-parchment/60 font-semibold">
              Fulfilled Orders
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <p className="font-display text-4xl text-parchment mt-2">
              {paidOrders.length}
            </p>
            <p className="text-xs text-parchment/50 mt-1">
              Active licenses & watermarked downloads
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2.5 rounded-2xl p-4 text-sm ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-crest-red/10 border border-crest-red/30 text-crest-red"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("pending")}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
              tab === "pending"
                ? "bg-gold text-ink shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                : "bg-white/5 text-parchment/70 hover:bg-white/10"
            }`}
          >
            <Clock size={14} />
            <span>Pending GTBank Transfers ({pendingTransfers.length})</span>
          </button>

          <button
            onClick={() => setTab("paid")}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
              tab === "paid"
                ? "bg-gold text-ink shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                : "bg-white/5 text-parchment/70 hover:bg-white/10"
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Fulfilled / Paid ({paidOrders.length})</span>
          </button>

          <button
            onClick={() => setTab("all")}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
              tab === "all"
                ? "bg-gold text-ink shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                : "bg-white/5 text-parchment/70 hover:bg-white/10"
            }`}
          >
            All Orders ({orders.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-parchment/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buyer, reference, email…"
            className="w-full rounded-full border border-white/10 bg-black/40 pl-9 pr-4 py-2 text-xs text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#120D09]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-parchment/60 font-semibold">
              <tr>
                <th className="px-6 py-4">Reference & Date</th>
                <th className="px-6 py-4">Buyer Details</th>
                <th className="px-6 py-4">Material / Bundle</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method & Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-parchment/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-parchment/40">
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const title = o.digital_products?.title ?? o.product_bundles?.title ?? "Lecture Notes";
                  const refCode = o.transfer_reference ?? o.paystack_reference ?? o.id.slice(0, 8);
                  const isPendingTransfer = o.status === "pending" && o.payment_method === "bank_transfer";
                  const isProcessing = pendingId === o.id;

                  const buyerEmail = o.buyer_email ?? "N/A";
                  const buyerName = o.buyer_name ?? "Guest Buyer";

                  const replyWaText = encodeURIComponent(
                    `Hello ${buyerName}! Your payment for "${title}" (Ref: ${refCode}) has been confirmed. Your lecture notes and license key have been emailed to ${buyerEmail}. Thank you!`
                  );
                  const waReplyUrl = `https://wa.me/${cleanWa}?text=${replyWaText}`;

                  return (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-gold block">
                          {refCode}
                        </span>
                        <span className="text-[11px] text-parchment/50 mt-0.5 block">
                          {new Date(o.created_at).toLocaleString("en-NG", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-parchment block">
                          {buyerName}
                        </span>
                        <span className="text-xs text-parchment/50 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {buyerEmail}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-medium text-parchment block max-w-xs truncate">
                          {title}
                        </span>
                        {o.bundle_id && (
                          <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold uppercase mt-1 inline-block">
                            Bundle Pack
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-display text-base font-bold text-parchment block">
                          ₦{Number(o.amount).toLocaleString()}
                        </span>
                        {Number(o.discount_amount) > 0 && (
                          <span className="text-[11px] text-green-400 block">
                            -₦{Number(o.discount_amount).toLocaleString()} coupon
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              o.status === "paid"
                                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                                : o.status === "failed"
                                ? "bg-crest-red/10 border border-crest-red/30 text-crest-red"
                                : "bg-gold/10 border border-gold/30 text-gold"
                            }`}
                          >
                            {o.status === "paid" ? (
                              <CheckCircle2 size={12} />
                            ) : o.status === "failed" ? (
                              <XCircle size={12} />
                            ) : (
                              <Clock size={12} />
                            )}
                            {o.status}
                          </span>

                          <span className="text-[11px] text-parchment/50 block capitalize">
                            {o.payment_method === "bank_transfer" ? "GTBank Transfer" : "Paystack Online"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPendingTransfer ? (
                            <>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleApprove(o.id)}
                                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-dark to-gold px-3.5 py-1.5 text-xs font-bold text-ink hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all cursor-pointer"
                              >
                                {isProcessing ? (
                                  <RefreshCw size={13} className="animate-spin" />
                                ) : (
                                  <Check size={13} />
                                )}
                                <span>Approve & Fulfill</span>
                              </button>

                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleReject(o.id)}
                                className="rounded-full border border-crest-red/30 bg-crest-red/10 px-3 py-1.5 text-xs font-medium text-crest-red hover:bg-crest-red/20 transition-all cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          ) : (
                            <a
                              href={waReplyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-parchment/70 hover:bg-[#25D366]/10 hover:border-[#25D366]/40 hover:text-[#25D366] transition-all"
                            >
                              <MessageCircle size={14} className="text-[#25D366]" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
