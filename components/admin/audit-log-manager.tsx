"use client";

import { useState } from "react";
import { Search, ShieldAlert, Clock } from "lucide-react";

export interface AuditEvent {
  id: string;
  action: string;
  detail: string;
  time: string;
  badge: string;
  badgeColor: string;
}

export function AuditLogManager({ events }: { events: AuditEvent[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = events.filter((evt) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      evt.action.toLowerCase().includes(term) ||
      evt.detail.toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (category === "all") return true;
    return evt.badge.toLowerCase().includes(category.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment/40" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0E0A08] py-2.5 pl-10 pr-4 text-xs text-parchment placeholder-parchment/40 focus:border-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-panel p-1 text-xs">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              category === "all"
                ? "bg-gold text-midnight font-semibold shadow"
                : "text-parchment/60 hover:text-parchment"
            }`}
          >
            All Logs ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setCategory("license")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              category === "license"
                ? "bg-gold text-midnight font-semibold shadow"
                : "text-parchment/60 hover:text-parchment"
            }`}
          >
            Shop &amp; Licenses
          </button>
          <button
            type="button"
            onClick={() => setCategory("mentorship")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              category === "mentorship"
                ? "bg-gold text-midnight font-semibold shadow"
                : "text-parchment/60 hover:text-parchment"
            }`}
          >
            Mentorship
          </button>
          <button
            type="button"
            onClick={() => setCategory("membership")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              category === "membership"
                ? "bg-gold text-midnight font-semibold shadow"
                : "text-parchment/60 hover:text-parchment"
            }`}
          >
            Membership
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-panel divide-y divide-white/5 shadow-xl overflow-hidden">
        {filtered.map((evt) => (
          <div
            key={evt.id}
            className="p-4 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold border ${evt.badgeColor}`}
                >
                  {evt.badge}
                </span>
                <span className="font-semibold text-xs text-parchment">{evt.action}</span>
              </div>
              <p className="text-xs text-parchment/70">{evt.detail}</p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-[11px] text-parchment/50 font-mono">
              <Clock className="h-3 w-3 text-parchment/40" />
              {new Date(evt.time).toLocaleString()}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-xs text-parchment/50">
            <ShieldAlert className="mx-auto h-8 w-8 text-parchment/30 mb-2" />
            No audit records match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
