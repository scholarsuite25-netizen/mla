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
        {/* Left: Inquiries List */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 space-y-3 overflow-y-auto max-h-[75vh] shadow-sm">
          <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Invitations ({inquiries.length})
            </span>
          </div>

          {inquiries.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
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
                      ? "border-cyan-500 bg-cyan-50/70 shadow-xs"
                      : "border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-block rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0284C7]">
                      {inq.event_type}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-2 truncate">
                    {inq.organization}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 truncate">
                    Contact: {inq.organizer_name}
                  </p>
                  {inq.phone && (
                    <p className="text-[11px] font-mono text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <span>WhatsApp:</span> {inq.phone}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Detail */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
          {selected ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <span className="inline-block rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0284C7] mb-2">
                    {selected.event_type}
                  </span>
                  <h3 className="font-sans text-2xl font-bold text-slate-900">
                    {selected.organization}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Organizer / Contact: <strong className="text-slate-900">{selected.organizer_name}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selected.phone && (
                    <a
                      href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${selected.organizer_name}! Thank you for inviting S. B. Omotoso to speak at ${selected.organization} (${selected.event_type}). We are reaching out regarding your event schedule.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                    >
                      <span>Chat on WhatsApp</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <a
                    href={`mailto:${selected.email}?subject=Re:%20Speaking%20Invitation%20for%20${encodeURIComponent(selected.organization)}`}
                    className="flex items-center gap-1.5 rounded-xl bg-[#120D42] hover:bg-[#1b145a] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                  >
                    <Mail size={14} className="text-cyan-400" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>

              {/* Event Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Target Date</p>
                  <p className="font-semibold text-sm text-slate-900 mt-1">
                    {selected.event_date || "To be decided"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Location</p>
                  <p className="font-semibold text-sm text-slate-900 mt-1">
                    {selected.location || "Virtual / TBD"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Audience Size</p>
                  <p className="font-semibold text-sm text-slate-900 mt-1">
                    {selected.estimated_attendees || "Not specified"}
                  </p>
                </div>

                {selected.budget_range && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <p className="text-[11px] text-slate-500 uppercase font-semibold">Budget / Honorarium</p>
                    <p className="font-semibold text-sm text-[#0284C7] mt-1">
                      {selected.budget_range}
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Email</p>
                  <p className="font-mono text-xs font-semibold text-slate-800 mt-1 truncate">
                    {selected.email}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <p className="text-[11px] text-slate-500 uppercase font-semibold">Phone / WhatsApp</p>
                  <p className="font-mono text-xs font-semibold text-emerald-700 mt-1">
                    {selected.phone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Event Objectives &amp; Message
                </p>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-800 leading-relaxed font-normal">
                  {selected.message || "No additional message provided."}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-slate-400">
              Select an inquiry from the list to view event parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
