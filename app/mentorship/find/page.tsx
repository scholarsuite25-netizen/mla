import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RequestMentorButton } from "@/components/mentorship/request-button";

export const dynamic = "force-dynamic";

export default async function FindMentorPage() {
  const supabase = await createClient();
  const { data: mentors } = await supabase
    .from("mentor_profiles")
    .select(
      "id,bio,expertise_tags,availability,profiles(full_name,institutions(name))"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Which mentors has this user already sent a pending request to?
  const pendingIds = new Set<string>();
  if (user) {
    const { data: requests } = await supabase
      .from("mentorship_requests")
      .select("mentor_id,status")
      .eq("mentee_id", user.id);
    for (const r of requests ?? []) {
      if (r.status === "pending") pendingIds.add(String(r.mentor_id));
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

      {!mentors || mentors.length === 0 ? (
        <p className="mt-10 text-parchment/50">
          No mentors have listed yet.{" "}
          <Link href="/mentorship/become" className="text-gold hover:underline">
            Become one now →
          </Link>
        </p>
      ) : (
        <div className="mt-10 space-y-5">
          {mentors.map((mentor) => {
            const profileArr = mentor.profiles as unknown as
              | { full_name: string; institutions?: { name: string }[] }[]
              | null;
            const profile = profileArr?.[0];
            const inst = profile?.institutions?.[0]?.name ?? null;
            const isSelf = user?.id === mentor.id;
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
                    {inst && <p className="mt-0.5 text-xs text-parchment/50">{inst}</p>}
                  </div>
                  {!isSelf && (
                    <RequestMentorButton
                      mentorId={mentor.id}
                      pending={pendingIds.has(mentor.id)}
                      signedIn={!!user}
                    />
                  )}
                </div>
                <p className="mt-3 text-sm text-parchment/70">{mentor.bio}</p>
                {mentor.expertise_tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(mentor.expertise_tags as string[]).map((tag) => (
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