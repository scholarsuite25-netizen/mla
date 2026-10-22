import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RsvpButton } from "@/components/events/rsvp-button";
import { Calendar, MapPin, Clock, Plus, Sparkles, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

function formatEventTime(start: string, end: string | null) {
  const s = new Date(start);
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  if (!end) return s.toLocaleDateString("en-NG", opts);
  const e = new Date(end);
  return `${s.toLocaleDateString("en-NG", opts)} – ${e.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
}

export default async function EventsListPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select(
      "id,title,description,start_time,end_time,location_or_link,institution_id,institutions(name)"
    )
    .order("start_time", { ascending: true })
    .gte("start_time", new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString())
    .limit(50);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rsvpEventIds = new Set<string>();
  let canCreate = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    canCreate =
      profile?.role === "super_admin" || profile?.role === "institution_admin";
    const { data: rsvps } = await supabase
      .from("event_rsvps")
      .select("event_id")
      .eq("profile_id", user.id);
    rsvpEventIds = new Set(rsvps?.map((r) => String(r.event_id)) ?? []);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800 w-full">
      {/* Royal Navy Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] text-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#00D2FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-[#7C3AED]/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-[#00D2FF] uppercase tracking-wider mb-3">
                <Sparkles size={12} />
                Gatherings &amp; Masterclasses
              </span>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Upcoming Events &amp; Workshops
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl">
                Attend live physical masterclasses, virtual AI bootcamps, and executive roundtables across MLA partner institutions.
              </p>
            </div>

            {canCreate && (
              <Link
                href="/events/new"
                className="rounded-lg bg-[#00D2FF] px-4 py-2.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] transition inline-flex items-center gap-2 shadow-md shrink-0 self-start sm:self-auto"
              >
                <Plus size={15} /> Create Event
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Events List */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {!events || events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-[#0284C7] mb-3">
              <Calendar size={24} />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900 mb-1">
              No Upcoming Events Scheduled
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Check back soon for new keynote workshops, webinars, and regional summit dates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const instRaw = event.institutions;
              const inst = Array.isArray(instRaw)
                ? instRaw[0]?.name
                : (instRaw as { name: string } | null)?.name ?? null;
              const isRsvp = rsvpEventIds.has(event.id);

              return (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-cyan-400/60 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0284C7]">
                          <Building2 size={11} />
                          {inst ?? "Platform-Wide"}
                        </span>
                      </div>

                      <Link
                        href={`/events/${event.id}`}
                        className="font-display text-base sm:text-lg font-bold text-slate-900 hover:text-[#0284C7] transition block"
                      >
                        {event.title}
                      </Link>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-[#0284C7]" />
                          <span>{formatEventTime(event.start_time, event.end_time)}</span>
                        </div>
                        {event.location_or_link && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <MapPin size={13} className="text-emerald-600" />
                            <span>{event.location_or_link}</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="mt-3 line-clamp-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 pt-1">
                      <RsvpButton eventId={event.id} isRsvp={isRsvp} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}