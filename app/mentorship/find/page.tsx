import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RequestMentorButton } from "@/components/mentorship/request-button";

export const dynamic = "force-dynamic";

export default async function FindMentorPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; inst?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 40);
  const inst = (sp.inst ?? "").trim();

  const supabase = await createClient();

  let query = supabase
    .from("mentor_profiles")
    .select(
      "id,profile_id,bio,expertise_tags,availability,profiles(full_name,institutions(name))"
    )
    .eq("is_active", true);
  if (q) query = query.overlaps("expertise_tags", [q]);
  if (inst) query = query.eq("profiles.institution_id", inst);
  const { data: mentors } = await query.order("created_at", { ascending: false });

  const { data: institutions } = await supabase
    .from("institutions")
    .select("id,name")
    .order("name", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Latest request status per mentor for this user (pending / approved).
  const statusByMentor = new Map<string, string>();
  if (user) {
    const { data: requests } = await supabase
      .from("mentorship_requests")
      .select("mentor_id,status,created_at")
      .eq("mentee_id", user.id)
      .order("created_at", { ascending: true });
    for (const r of requests ?? []) {
      const key = String(r.mentor_id);
      if (!statusByMentor.has(key)) statusByMentor.set(key, String(r.status));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs uppercase tracking-widest text-gold">Mentorship</p>
      <h1 className="mt-2 font-display text-4xl text-parchment">Find a Mentor</h1>
      <p className="mt-3 text-parchment/70">
        Browse active mentors across all institutions. Send a request and
        the mentor will respond; MLA gives final approval once both sides agree.
      </p>

      {/* Directory search / filter */}
      {(mentors?.length ?? 0) > 0 && (
        <form className="mt-6 flex flex-col sm:flex-row gap-3" method="get">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Filter by expertise (e.g. leadership)"
            className="flex-1 rounded-sm border border-parchment/15 bg-panel px-3 py-2 text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
          />
          <select
            name="inst"
            defaultValue={inst}
            className="rounded-sm border border-parchment/15 bg-panel px-3 py-2 text-sm text-parchment focus:border-gold focus:outline-none"
          >
            <option value="">All institutions</option>
            {(institutions ?? []).map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-sm bg-crest-red px-4 py-2 text-xs font-medium text-white hover:bg-crest-red/90"
          >
            Filter
          </button>
          {(q || inst) && (
            <a
              href="/mentorship/find"
              className="rounded-sm border border-parchment/15 px-4 py-2 text-xs text-parchment/70 hover:text-parchment"
            >
              Clear
            </a>
          )}
        </form>
      )}

      {!mentors || mentors.length === 0 ? (
        <p className="mt-10 text-parchment/50">
          {q || inst
            ? "No mentors match that filter."
            : "No mentors have listed yet. "}
          {(q || inst) && (
            <a href="/mentorship/find" className="text-gold hover:underline">
              Clear filters
            </a>
          )}
          {!q && !inst && (
            <Link href="/mentorship/become" className="text-gold hover:underline">
              Become one now →
            </Link>
          )}
        </p>
      ) : (
        <div className="mt-10 space-y-5">
          {mentors.map((mentor) => {
            const profileArr = mentor.profiles as unknown as
              | { full_name: string; institutions?: { name: string }[] }[]
              | null;
            const profile = profileArr?.[0];
            const instName = profile?.institutions?.[0]?.name ?? null;
            const isSelf = user?.id === mentor.profile_id;
            const matchState = statusByMentor.get(mentor.profile_id);
            return (
              <div
                key={mentor.id}
                className="rounded-md border border-parchment/10 bg-panel p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display text-xl text-parchment">
                      {profile?.full_name ?? "Mentor"}
                    </p>
                    {instName && <p className="mt-0.5 text-xs text-parchment/50">{instName}</p>}
                  </div>
                  {!isSelf && matchState === "approved" && (
                    <span className="shrink-0 rounded-sm border border-emerald-500/40 px-4 py-2 text-xs text-emerald-400">
                      Active match
                    </span>
                  )}
                  {!isSelf && matchState === "pending" && (
                    <span className="shrink-0 rounded-sm border border-gold/50 px-4 py-2 text-xs text-gold">
                      Request pending
                    </span>
                  )}
                  {!isSelf && matchState !== "approved" && matchState !== "pending" && (
                    <RequestMentorButton
                      mentorId={mentor.profile_id}
                      pending={false}
                      signedIn={!!user}
                    />
                  )}
                </div>
                <p className="mt-3 text-sm text-parchment/70">{mentor.bio}</p>
                {mentor.expertise_tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {((mentor.expertise_tags as string[]) ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gold/40 px-3 py-0.5 text-xs text-gold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {mentor.availability && (
                  <p className="mt-2 text-xs text-parchment/50">
                    Available: {mentor.availability}
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