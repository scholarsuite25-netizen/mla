"use client";

import { useState } from "react";
import {
  Mail,
  ExternalLink,
} from "lucide-react";

export type SpeakingInquiry = {
  id: string;
  organizer_name: string;
  organization: string;
  email: string;
  phone: string | null;
  event_type: string;
  event_date: string | null;
  location: string | null;
  estimated_attendees: string | null;
  budget_range: string | null;
  message: string;
  status: string;
  created_at: string;
};

export function SpeakingInquiriesManager({
  initialInquiries,
}: {
  initialInquiries: SpeakingInquiry[];
}) {
  const [inquiries] = useState<SpeakingInquiry[]>(initialInquiries);
  const [selected, setSelected] = useState<SpeakingInquiry | null>(
    initialInquiries.length > 0 ? initialInquiries[0] : null
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List */}
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-3 overflow-y-auto max-h-[75vh]">
          <p className="text-xs font-bold uppercase tracking-wider text-parchment/50 px-2">
            Invitations ({inquiries.length})
          </p>

          {inquiries.length === 0 ? (
            <div className="py-12 text-center text-xs text-parchment/40">
              No speaking inquiries received yet.
            </div>
          ) : (
            inquiries.map((inq) => {
              const isSelected = selected?.id === inq.id;
              return (
                <div
                  key={inq.id}
                  onClick={() => setSelected(inq)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-gold bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                      : "border-white/5 bg-white/[0.02] hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                      {inq.event_type}
                    </span>
                    <span className="text-[10px] text-parchment/40">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-parchment mt-1 truncate">
                    {inq.organization}
                  </h4>
                  <p className="text-xs text-parchment/60 mt-0.5 truncate">
                    {inq.organizer_name}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Detail */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#140F0B] p-6 sm:p-8 space-y-6">
          {selected ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <span className="inline-block rounded-full bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold mb-2">
                    {selected.event_type}
                  </span>
                  <h3 className="font-display text-2xl text-parchment">
                    {selected.organization}
                  </h3>
                  <p className="text-sm text-parchment/70 mt-1">
                    Contact: <strong>{selected.organizer_name}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=Re:%20Speaking%20Invitation%20for%20${encodeURIComponent(selected.organization)}`}
                    className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-bold text-ink hover:bg-gold-light transition-all"
                  >
                    <Mail size={14} />
                    <span>Reply via Email</span>
                  </a>

                  {selected.phone && (
                    <a
                      href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2 text-xs font-bold text-[#25D366] hover:bg-[#25D366]/20 transition-all"
                    >
                      <span>WhatsApp</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              {/* Event Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <p className="text-[11px] text-parchment/50 uppercase font-semibold">Target Date</p>
                  <p className="font-medium text-sm text-parchment mt-1">
                    {selected.event_date || "To be decided"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <p className="text-[11px] text-parchment/50 uppercase font-semibold">Location</p>
                  <p className="font-medium text-sm text-parchment mt-1">
                    {selected.location || "Virtual / TBD"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <p className="text-[11px] text-parchment/50 uppercase font-semibold">Audience Size</p>
                  <p className="font-medium text-sm text-parchment mt-1">
                    {selected.estimated_attendees || "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <p className="text-[11px] text-parchment/50 uppercase font-semibold">Budget / Honorarium</p>
                  <p className="font-medium text-sm text-gold mt-1">
                    {selected.budget_range || "Negotiable"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <p className="text-[11px] text-parchment/50 uppercase font-semibold">Email</p>
                  <p className="font-mono text-xs text-parchment mt-1 truncate">
                    {selected.email}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <p className="text-[11px] text-parchment/50 uppercase font-semibold">Phone</p>
                  <p className="font-mono text-xs text-parchment mt-1">
                    {selected.phone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-parchment/50 font-semibold">
                  Event Objectives & Message
                </p>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-parchment/80 leading-relaxed font-light">
                  {selected.message || "No additional message provided."}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-parchment/40">
              Select an inquiry from the list to view event parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
