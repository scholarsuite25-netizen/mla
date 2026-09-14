import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RsvpButton } from "@/components/events/rsvp-button";

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
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl text-parchment">Events</h1>
      <p className="mt-3 text-parchment/70">
        Upcoming gatherings, workshops, and meetups across institutions and
        the MLA platform.
      </p>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-gold">
          Upcoming &amp; recent
        </p>
        {canCreate && (
          <Link
            href="/events/new"
            className="rounded-sm bg-crest-red px-4 py-2 text-sm font-medium text-white hover:bg-crest-red/90"
          >
            Create event
          </Link>
        )}
      </div>

      {!events || events.length === 0 ? (
        <p className="mt-8 text-parchment/50">No events scheduled yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {events.map((event) => {
            const instRaw = event.institutions;
            const inst = Array.isArray(instRaw)
              ? instRaw[0]?.name
              : (instRaw as { name: string } | null)?.name ?? null;
            const isRsvp = rsvpEventIds.has(event.id);
            return (
              <div
                key={event.id}
                className="rounded-md border border-parchment/10 bg-panel p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-gold">
                      {inst ?? "Platform-wide"}
                    </p>
                    <Link
                      href={`/events/${event.id}`}
                      className="mt-1 block font-display text-xl text-parchment hover:text-gold"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-1 text-sm text-parchment/60">
                      {formatEventTime(event.start_time, event.end_time)}
                    </p>
                    {event.location_or_link && (
                      <p className="mt-1 text-xs text-parchment/50">
                        📍 {event.location_or_link}
                      </p>
                    )}
                  </div>
                  <RsvpButton eventId={event.id} isRsvp={isRsvp} />
                </div>
                {event.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-parchment/60">
                    {event.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}