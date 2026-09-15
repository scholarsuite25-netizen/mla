"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  resetActivationsAction,
  revokeLicenseAction,
  issueManualLicenseAction,
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
} from "lucide-react";

export type LicenseItem = {
  id: string;
  license_key: string;
  max_activations: number;
  activation_count: number;
  is_revoked: boolean;
  created_at: string;
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked">("all");
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  const filteredLicenses = licenses.filter((lic) => {
    const prodRaw = lic.digital_products ?? lic.products;
    const productTitle = Array.isArray(prodRaw)
      ? prodRaw[0]?.title ?? ""
      : (prodRaw as { title: string } | null)?.title ?? "";

    const buyerName = lic.buyer?.full_name ?? "";
    const key = lic.license_key ?? "";

    const matchesSearch =
      key.toLowerCase().includes(search.toLowerCase()) ||
      buyerName.toLowerCase().includes(search.toLowerCase()) ||
      productTitle.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !lic.is_revoked) ||
      (statusFilter === "revoked" && lic.is_revoked);

    return matchesSearch && matchesStatus;
  });

  const activeCount = licenses.filter((l) => !l.is_revoked).length;
  const revokedCount = licenses.filter((l) => l.is_revoked).length;

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
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-parchment">
            License Registry &amp; DRM Controller
          </h3>
          <p className="mt-0.5 text-xs text-parchment/60">
            Cryptographic HMAC license keys, device activation controls, and hardware limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIssueOpen(!issueOpen)}
          className="inline-flex items-center gap-2 rounded-xl bg-gold/15 border border-gold/40 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/25 transition-all self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Issue Manual License</span>
        </button>
      </div>

      {/* Manual License Drawer */}
      {issueOpen && (
        <form
          onSubmit={handleIssueSubmit}
          className="rounded-2xl border border-gold/40 bg-[#140F0B] p-6 space-y-4 shadow-2xl animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-gold" />
              <h4 className="font-display text-sm font-bold text-parchment">Issue Cryptographic License</h4>
            </div>
            <button
              type="button"
              onClick={() => setIssueOpen(false)}
              className="text-xs text-parchment/50 hover:text-parchment"
            >
              Close
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                Digital Product
              </span>
              <select
                name="productId"
                required
                className="w-full rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                Recipient Member
              </span>
              <select
                name="buyerId"
                required
                className="w-full rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
              >
                <option value="">Select member...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name || "Anonymous Member"}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                Max Device Activations
              </span>
              <input
                type="number"
                name="maxActivations"
                defaultValue={3}
                min={1}
                max={10}
                className="w-full rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
              />
            </label>
          </div>

          {issueError && <p className="text-xs text-crest-red font-medium">{issueError}</p>}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gold px-5 py-2 text-xs font-semibold text-black hover:bg-gold-light disabled:opacity-50"
            >
              {pending ? "Generating..." : "Generate Signed License Key"}
            </button>
          </div>
        </form>
      )}

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#120D09] p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            All ({licenses.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === "active"
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("revoked")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === "revoked"
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Revoked ({revokedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by key, buyer, or product..."
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-parchment placeholder:text-parchment/40 focus:border-gold/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Licenses List */}
      <div className="space-y-3">
        {filteredLicenses.map((lic) => {
          const prodRaw = lic.digital_products ?? lic.products;
          const product = Array.isArray(prodRaw)
            ? prodRaw[0]?.title
            : (prodRaw as { title: string } | null)?.title ?? "Digital Product";

          return (
            <div
              key={lic.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#140F0B] p-5 shadow-md hover:border-gold/30 transition-all"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      lic.is_revoked
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {lic.is_revoked ? "Revoked" : "Active"}
                  </span>
                  <span className="font-mono text-xs font-bold text-parchment select-all">
                    {lic.license_key}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-parchment/70">
                  <span className="inline-flex items-center gap-1">
                    <User size={12} className="text-gold" />
                    <span>{lic.buyer?.full_name ?? "Member"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShoppingBag size={12} className="text-gold" />
                    <span>{product}</span>
                  </span>
                  <span className="text-parchment/50">
                    Activations:{" "}
                    <strong className="text-parchment">
                      {lic.activation_count}/{lic.max_activations}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <button
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await resetActivationsAction(lic.id);
                      if (res?.error) alert(res.error);
                      else router.refresh();
                    })
                  }
                  title="Reset device count to 0 so customer can activate on new hardware"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-parchment hover:border-gold/60 hover:text-gold transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} />
                  <span>Reset Devices</span>
                </button>

                <button
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await revokeLicenseAction(lic.id);
                      if (res?.error) alert(res.error);
                      else router.refresh();
                    })
                  }
                  title={lic.is_revoked ? "Re-activate license" : "Revoke license"}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors disabled:opacity-50 ${
                    lic.is_revoked
                      ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                  }`}
                >
                  {lic.is_revoked ? <CheckCircle2 size={12} /> : <Ban size={12} />}
                  <span>{lic.is_revoked ? "Unrevoke" : "Revoke"}</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredLicenses.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-panel p-12 text-center">
            <KeyRound size={28} className="mx-auto text-parchment/30 mb-2" />
            <p className="text-sm text-parchment/60">
              {search ? "No licenses match your search query." : "No product licenses issued yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}