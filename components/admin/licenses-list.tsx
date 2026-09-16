"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  resetActivationsAction,
  revokeLicenseAction,
  issueManualLicenseAction,
  getLicenseDevicesAction,
  verifyLicenseKeyAction,
  updateMaxActivationsAction,
  type DeviceActivationItem,
} from "@/app/admin/licenses/actions";
import {
  Search,
  KeyRound,
  RefreshCw,
  Ban,
  CheckCircle2,
  Plus,
  User,
  ShoppingBag,
  Copy,
  Check,
  Laptop,
  ShieldCheck,
  AlertTriangle,
  X,
  Clock,
  SlidersHorizontal,
  ShieldAlert,
} from "lucide-react";

export type LicenseItem = {
  id: string;
  license_key: string;
  max_activations: number;
  activation_count: number;
  is_revoked: boolean;
  created_at: string;
  buyer_id?: string;
  buyer?: { full_name: string | null } | null;
  digital_products?: { title: string } | { title: string }[] | null;
  products?: { title: string } | { title: string }[] | null;
  orders?: { paystack_reference: string | null } | null;
};

export interface ProductOption {
  id: string;
  title: string;
}

export interface MemberOption {
  id: string;
  full_name: string | null;
}

export function LicensesList({
  licenses,
  products = [],
  members = [],
}: {
  licenses: LicenseItem[];
  products?: ProductOption[];
  members?: MemberOption[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "maxed" | "revoked">("all");

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    message: string;
    license?: {
      id: string;
      key: string;
      productTitle: string;
      buyerName: string;
      activations: string;
      isRevoked: boolean;
      createdAt: string;
    };
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Device Inspection Drawer
  const [inspectingLic, setInspectingLic] = useState<LicenseItem | null>(null);
  const [devices, setDevices] = useState<DeviceActivationItem[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  // Action status message
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  }

  // Filter logic
  const filteredLicenses = licenses.filter((lic) => {
    const prodRaw = lic.digital_products ?? lic.products;
    const productTitle = Array.isArray(prodRaw)
      ? prodRaw[0]?.title ?? ""
      : (prodRaw as { title: string } | null)?.title ?? "";

    const buyerName = lic.buyer?.full_name ?? "";
    const key = lic.license_key ?? "";
    const term = search.toLowerCase();

    const matchesSearch =
      !search ||
      key.toLowerCase().includes(term) ||
      buyerName.toLowerCase().includes(term) ||
      productTitle.toLowerCase().includes(term) ||
      (lic.orders?.paystack_reference?.toLowerCase().includes(term) ?? false);

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "active") return !lic.is_revoked && lic.activation_count < lic.max_activations;
    if (statusFilter === "maxed") return !lic.is_revoked && lic.activation_count >= lic.max_activations;
    if (statusFilter === "revoked") return lic.is_revoked;
    return true;
  });

  // KPI calculations
  const totalCount = licenses.length;
  const activeCount = licenses.filter((l) => !l.is_revoked).length;
  const maxedCount = licenses.filter((l) => !l.is_revoked && l.activation_count >= l.max_activations).length;
  const revokedCount = licenses.filter((l) => l.is_revoked).length;
  const totalActivations = licenses.reduce((acc, l) => acc + (l.activation_count || 0), 0);

  // Manual Issue Submit
  function handleIssueSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIssueError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await issueManualLicenseAction(fd);
      if (res?.error) {
        setIssueError(res.error);
      } else {
        setIssueOpen(false);
        setStatusMsg({ text: "Cryptographic license generated and assigned successfully.", type: "success" });
        setTimeout(() => setStatusMsg(null), 4000);
        router.refresh();
      }
    });
  }

  // Verify Key Submit
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyInput.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    const res = await verifyLicenseKeyAction(verifyInput);
    setVerifyResult(res);
    setVerifying(false);
  }

  // Inspect Devices
  async function openDeviceInspector(lic: LicenseItem) {
    setInspectingLic(lic);
    setLoadingDevices(true);
    setDevices([]);
    const res = await getLicenseDevicesAction(lic.id);
    setDevices(res.devices ?? []);
    setLoadingDevices(false);
  }

  // Reset Activations
  function handleReset(licenseId: string) {
    startTransition(async () => {
      const res = await resetActivationsAction(licenseId);
      if (res?.error) {
        alert(res.error);
      } else {
        setStatusMsg({ text: "Device activation count reset to 0. Customer can now activate on new hardware.", type: "success" });
        setTimeout(() => setStatusMsg(null), 4000);
        if (inspectingLic && inspectingLic.id === licenseId) {
          setDevices([]);
          setInspectingLic({ ...inspectingLic, activation_count: 0 });
        }
        router.refresh();
      }
    });
  }

  // Toggle Revocation
  function handleRevoke(licenseId: string) {
    startTransition(async () => {
      const res = await revokeLicenseAction(licenseId);
      if (res?.error) {
        alert(res.error);
      } else {
        setStatusMsg({ text: "License status updated.", type: "success" });
        setTimeout(() => setStatusMsg(null), 3000);
        router.refresh();
      }
    });
  }

  // Change Max Devices Limit
  function handleUpdateMax(licenseId: string, current: number) {
    const nextStr = window.prompt("Enter new maximum allowed devices for this key (1 to 50):", String(current));
    if (!nextStr) return;
    const nextVal = parseInt(nextStr, 10);
    if (isNaN(nextVal) || nextVal < 1 || nextVal > 50) {
      alert("Please enter a valid number between 1 and 50.");
      return;
    }
    startTransition(async () => {
      const res = await updateMaxActivationsAction(licenseId, nextVal);
      if (res?.error) alert(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-parchment sm:text-3xl flex items-center gap-2">
            <KeyRound className="text-gold h-7 w-7" />
            <span>License Registry &amp; DRM Controller</span>
          </h2>
          <p className="mt-1 text-xs text-parchment/60">
            Cryptographic HMAC-SHA256 license engine: hardware lock verification, device limit resets, and manual issuance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setVerifyOpen(true);
              setVerifyResult(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-parchment hover:border-gold hover:text-gold transition-all"
          >
            <ShieldCheck size={14} className="text-gold" />
            <span>Verify / Lookup Key</span>
          </button>

          <button
            type="button"
            onClick={() => setIssueOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-amber-500 px-4 py-2 text-xs font-bold text-midnight hover:brightness-110 shadow-lg transition-all"
          >
            <Plus size={15} />
            <span>Issue Manual License</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <span className="text-[11px] uppercase tracking-wider text-parchment/50 font-semibold block">
            Total Issued
          </span>
          <p className="mt-1 text-xl font-bold text-parchment">{totalCount}</p>
          <span className="text-[10px] text-parchment/40 mt-0.5 block">Signed Keys</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold block">
            Active Keys
          </span>
          <p className="mt-1 text-xl font-bold text-emerald-400">{activeCount}</p>
          <span className="text-[10px] text-parchment/40 mt-0.5 block">Operational</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold block">
            Hardware Limit Reached
          </span>
          <p className="mt-1 text-xl font-bold text-amber-300">{maxedCount}</p>
          <span className="text-[10px] text-parchment/40 mt-0.5 block">At Quota</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <span className="text-[11px] uppercase tracking-wider text-crest-red font-semibold block">
            Revoked Keys
          </span>
          <p className="mt-1 text-xl font-bold text-crest-red">{revokedCount}</p>
          <span className="text-[10px] text-parchment/40 mt-0.5 block">Disabled</span>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <span className="text-[11px] uppercase tracking-wider text-parchment/50 font-semibold block">
            Device Fingerprints
          </span>
          <p className="mt-1 text-xl font-bold text-gold">{totalActivations}</p>
          <span className="text-[10px] text-parchment/40 mt-0.5 block">Active Devices</span>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`flex items-center gap-2 rounded-2xl border p-4 text-xs font-semibold animate-in fade-in ${
            statusMsg.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-crest-red/30 bg-crest-red/10 text-crest-red"
          }`}
        >
          <CheckCircle2 size={15} />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Control Bar: Search & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#120D09] p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-gold text-midnight font-bold shadow"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "active"
                ? "bg-gold text-midnight font-bold shadow"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("maxed")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "maxed"
                ? "bg-gold text-midnight font-bold shadow"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Maxed Out ({maxedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("revoked")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "revoked"
                ? "bg-gold text-midnight font-bold shadow"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Revoked ({revokedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-parchment/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search key, buyer, product, reference..."
            className="w-full rounded-xl border border-white/10 bg-[#0E0A08] pl-10 pr-3 py-2 text-xs text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Licenses Registry Table / Cards */}
      <div className="space-y-3">
        {filteredLicenses.map((lic) => {
          const prodRaw = lic.digital_products ?? lic.products;
          const productTitle = Array.isArray(prodRaw)
            ? prodRaw[0]?.title ?? "Digital Product"
            : (prodRaw as { title: string } | null)?.title ?? "Digital Product";

          const buyerName = lic.buyer?.full_name ?? "Verified Scholar";
          const isMaxed = !lic.is_revoked && lic.activation_count >= lic.max_activations;
          const pct = Math.min(100, Math.round((lic.activation_count / lic.max_activations) * 100));

          const dateStr = new Date(lic.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={lic.id}
              className={`rounded-2xl border p-5 shadow-lg transition-all hover:border-gold/40 ${
                lic.is_revoked
                  ? "border-crest-red/30 bg-[#160E0D]/90"
                  : isMaxed
                  ? "border-amber-500/30 bg-[#15120B]/90"
                  : "border-white/10 bg-[#140E0A]/90"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Key & Badge & Details */}
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        lic.is_revoked
                          ? "border-crest-red/40 bg-crest-red/15 text-crest-red"
                          : isMaxed
                          ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                          : "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          lic.is_revoked ? "bg-crest-red" : isMaxed ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                      />
                      {lic.is_revoked ? "Revoked" : isMaxed ? "Limit Reached" : "Active"}
                    </span>

                    {/* Cryptographic Key with One-Click Copy */}
                    <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/60 px-3 py-1">
                      <span className="font-mono text-xs font-bold text-parchment tracking-wider select-all">
                        {lic.license_key}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyKey(lic.license_key)}
                        className="text-parchment/50 hover:text-gold transition ml-1"
                        title="Copy license key"
                      >
                        {copiedKey === lic.license_key ? (
                          <Check size={13} className="text-emerald-400" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>

                    {copiedKey === lic.license_key && (
                      <span className="text-[10px] font-bold text-emerald-400 animate-in fade-in">
                        Copied to clipboard!
                      </span>
                    )}
                  </div>

                  {/* Product, Buyer, Order */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-parchment/70">
                    <span className="inline-flex items-center gap-1 font-medium text-parchment">
                      <ShoppingBag size={12} className="text-gold" />
                      <span>{productTitle}</span>
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <User size={12} className="text-gold" />
                      <span>{buyerName}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-parchment/50">
                      <Clock size={11} className="text-gold/60" />
                      <span>Issued {dateStr}</span>
                    </span>

                    {lic.orders?.paystack_reference && (
                      <span className="text-[11px] font-mono text-parchment/40">
                        Ref: {lic.orders.paystack_reference}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Hardware Meter & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  {/* Hardware Activation Meter */}
                  <div className="w-48 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-parchment/60 flex items-center gap-1">
                        <Laptop size={12} className="text-gold" /> Hardware Limit:
                      </span>
                      <span className="font-bold text-parchment font-mono">
                        {lic.activation_count} / {lic.max_activations} Devices
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-black/60 border border-white/5">
                      <div
                        className={`h-full transition-all duration-300 ${
                          lic.is_revoked
                            ? "bg-crest-red"
                            : isMaxed
                            ? "bg-amber-400"
                            : "bg-gradient-to-r from-emerald-500 to-gold"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openDeviceInspector(lic)}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-parchment/80 hover:border-gold hover:text-gold transition"
                      title="Inspect activated device fingerprints"
                    >
                      <Laptop size={13} />
                      <span className="hidden sm:inline">Devices</span>
                    </button>

                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleReset(lic.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-parchment/80 hover:border-gold hover:text-gold disabled:opacity-50 transition"
                      title="Reset hardware device count to 0"
                    >
                      <RefreshCw size={13} />
                      <span className="hidden sm:inline">Reset</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateMax(lic.id, lic.max_activations)}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-semibold text-parchment/60 hover:text-parchment hover:border-white/20 transition"
                      title="Adjust maximum hardware device activations"
                    >
                      <SlidersHorizontal size={13} />
                    </button>

                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleRevoke(lic.id)}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold border transition disabled:opacity-50 ${
                        lic.is_revoked
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "border-crest-red/40 bg-crest-red/10 text-crest-red hover:bg-crest-red/20"
                      }`}
                      title={lic.is_revoked ? "Re-activate license" : "Revoke license"}
                    >
                      {lic.is_revoked ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                      <span>{lic.is_revoked ? "Reinstate" : "Revoke"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredLicenses.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-[#120D09] p-12 text-center space-y-3">
            <KeyRound size={32} className="mx-auto text-gold/40" />
            <h4 className="font-display text-lg font-bold text-parchment">
              No matching licenses found
            </h4>
            <p className="text-xs text-parchment/50 max-w-sm mx-auto">
              {search
                ? `No cryptographic license records match "${search}". Try searching by customer name or product title.`
                : "No product licenses issued under this filter state."}
            </p>
          </div>
        )}
      </div>

      {/* MODAL 1: Issue Manual Cryptographic License */}
      {issueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-gold/40 bg-[#140E0A] p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-gold" />
                <h3 className="font-display text-lg font-bold text-parchment">
                  Issue Manual Cryptographic License
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIssueOpen(false)}
                className="text-parchment/50 hover:text-parchment"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-parchment/60 leading-relaxed">
              Generates a signed HMAC-SHA256 license key for complimentary administrative assignment, VIP scholarship, or institutional partnership.
            </p>

            {issueError && (
              <div className="rounded-xl border border-crest-red/30 bg-crest-red/10 p-3 text-xs text-crest-red">
                {issueError}
              </div>
            )}

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                  Digital Product *
                </label>
                <select
                  name="productId"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                >
                  <option value="">Select digital product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                  Recipient Member / Scholar *
                </label>
                <select
                  name="buyerId"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                >
                  <option value="">Select registered recipient member...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name || "Member"} ({m.id.slice(0, 8)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                  Maximum Hardware Activations
                </label>
                <input
                  type="number"
                  name="maxActivations"
                  defaultValue={3}
                  min={1}
                  max={20}
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                />
                <p className="text-[10px] text-parchment/40 mt-1">
                  Default 3 devices (e.g. Work PC, Personal Laptop, Tablet).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIssueOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-parchment/70 hover:text-parchment"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl bg-gradient-to-r from-gold to-amber-500 px-5 py-2 text-xs font-bold text-midnight hover:brightness-110 shadow disabled:opacity-50 transition"
                >
                  {pending ? "Signing Key..." : "Generate Signed Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Cryptographic Key Verification & Lookup Tool */}
      {verifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-[#140E0A] p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-gold" />
                <h3 className="font-display text-lg font-bold text-parchment">
                  Cryptographic Key Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVerifyOpen(false)}
                className="text-parchment/50 hover:text-parchment"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-gold font-bold block">
                Paste License Key to Verify
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  placeholder="MLA-XXXX-XXXX-XXXXXXXX-XXXXXXXX"
                  className="flex-1 rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 font-mono text-xs text-parchment focus:border-gold focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={verifying || !verifyInput.trim()}
                  className="rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-midnight hover:brightness-110 disabled:opacity-50"
                >
                  {verifying ? "Checking..." : "Verify"}
                </button>
              </div>
            </form>

            {verifyResult && (
              <div
                className={`rounded-2xl border p-4 space-y-2 text-xs ${
                  verifyResult.valid
                    ? verifyResult.license?.isRevoked
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                    : "border-crest-red/40 bg-crest-red/10 text-crest-red"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {verifyResult.valid ? (
                    verifyResult.license?.isRevoked ? (
                      <AlertTriangle size={15} className="text-amber-400" />
                    ) : (
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    )
                  ) : (
                    <ShieldAlert size={15} className="text-crest-red" />
                  )}
                  <span>{verifyResult.message}</span>
                </div>

                {verifyResult.license && (
                  <div className="space-y-1 pt-2 border-t border-white/10 text-[11px] text-parchment/80">
                    <p>
                      Product: <strong className="text-parchment">{verifyResult.license.productTitle}</strong>
                    </p>
                    <p>
                      Licensed To: <strong className="text-parchment">{verifyResult.license.buyerName}</strong>
                    </p>
                    <p>
                      Device Activations:{" "}
                      <strong className="text-parchment">{verifyResult.license.activations}</strong>
                    </p>
                    <p>Issued Date: {verifyResult.license.createdAt}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Hardware Device Inspection Drawer */}
      {inspectingLic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#140E0A] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Laptop size={18} className="text-gold" />
                <div>
                  <h3 className="font-display text-base font-bold text-parchment">
                    Hardware Device Activations
                  </h3>
                  <span className="font-mono text-[10px] text-gold/80 block">
                    {inspectingLic.license_key}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLic(null)}
                className="text-parchment/50 hover:text-parchment"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-parchment/60">
                <span>
                  Registered Devices:{" "}
                  <strong className="text-parchment">
                    {devices.length} of {inspectingLic.max_activations}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleReset(inspectingLic.id)}
                  className="text-xs text-gold hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw size={11} /> Reset All
                </button>
              </div>

              {loadingDevices ? (
                <div className="p-8 text-center text-xs text-parchment/50">
                  Inspecting hardware records...
                </div>
              ) : devices.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {devices.map((d, i) => (
                    <div
                      key={d.id}
                      className="rounded-xl border border-white/5 bg-black/40 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-parchment flex items-center gap-1.5">
                          <Laptop size={12} className="text-gold" />
                          Device #{i + 1}
                        </span>
                        <span className="text-[10px] text-parchment/40">
                          {new Date(d.activated_at).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-parchment/60 truncate" title={d.device_fingerprint}>
                        Fingerprint: {d.device_fingerprint}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/5 bg-black/30 p-6 text-center text-xs text-parchment/50">
                  No device hardware activations logged yet. Key is ready for initial device registration.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingLic(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-parchment hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}