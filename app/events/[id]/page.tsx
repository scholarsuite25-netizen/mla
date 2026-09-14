import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RsvpButton } from "@/components/events/rsvp-button";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, institutions(name)")
    .eq("id", id)
    .maybeSingle();
  if (!event) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isRsvp = false;
  if (user) {
    const { data } = await supabase
      .from("event_rsvps")
      .select("id")
      .eq("event_id", event.id)
      .eq("profile_id", user.id)
      .maybeSingle();
    isRsvp = !!data;
  }

  const { count: goingCount } = await supabase
    .from("event_rsvps")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("rsvp_status", "going");

  const instRaw = event.institutions;
  const inst = Array.isArray(instRaw)
    ? instRaw[0]?.name
    : (instRaw as { name: string } | null)?.name ?? null;

  const start = new Date(event.start_time).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const end = event.end_time
    ? new Date(event.end_time).toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs uppercase tracking-widest text-gold">
        {inst ?? "MLA Platform-wide event"}
      </p>
      <h1 className="mt-2 font-display text-4xl text-parchment">{event.title}</h1>

      <div className="mt-6 space-y-2 text-parchment/70">
        <p>
          <span className="text-parchment/50">When:</span>{" "}
          {start}
          {end ? ` – ${end}` : ""}
        </p>
        {event.location_or_link && (
          <p>
            <span className="text-parchment/50">Where:</span>{" "}
            {event.location_or_link}
          </p>
        )}
        <p>
          <span className="text-parchment/50">Going:</span>{" "}
          {goingCount} attending
        </p>
      </div>

      <div className="mt-8 flex items-center gap-4">
        {user ? (
          <RsvpButton eventId={event.id} isRsvp={isRsvp} />
        ) : (
          <a
            href="/register"
            className="inline-block rounded-sm bg-crest-red px-6 py-2.5 text-sm font-medium text-white hover:bg-crest-red/90"
          >
            Create a free account to RSVP
          </a>
        )}
      </div>

      {event.description && (
        <div className="mt-10 whitespace-pre-wrap text-parchment/80">
          {event.description}
        </div>
      )}
    </div>
  );
}