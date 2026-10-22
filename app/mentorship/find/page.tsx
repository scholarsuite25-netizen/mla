import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RequestMentorButton } from "@/components/mentorship/request-button";
import { Users, Search, Sparkles, Building2, CheckCircle2, Clock } from "lucide-react";

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
                Verified Executive Guidance
              </span>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Find an Industry Mentor
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl">
                Browse verified senior technology professionals, corporate leaders, and university faculty across Nigeria.
              </p>
            </div>

            <Link
              href="/mentorship/become"
              className="rounded-lg bg-[#00D2FF] px-4 py-2.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] transition inline-flex items-center gap-1.5 shadow-md shrink-0 self-start sm:self-auto"
            >
              Become a Mentor →
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content & Filters */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Filter Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-8">
          <form className="flex flex-col sm:flex-row gap-3" method="get">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Filter by expertise (e.g. AI, Software, Management)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none transition"
              />
            </div>
            <select
              name="inst"
              defaultValue={inst}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-cyan-400 focus:bg-white focus:outline-none transition"
            >
              <option value="">All Partner Institutions</option>
              {(institutions ?? []).map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-[#120D42] px-5 py-2 text-xs font-bold text-white hover:bg-[#1a1359] transition"
            >
              Filter
            </button>
            {(q || inst) && (
              <a
                href="/mentorship/find"
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition flex items-center justify-center"
              >
                Clear
              </a>
            )}
          </form>
        </div>

        {!mentors || mentors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-[#0284C7] mb-3">
              <Users size={24} />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900 mb-1">
              {q || inst ? "No Mentors Match That Search" : "No Mentors Listed Yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              {q || inst
                ? "Try clearing your filters to see all available corporate and campus mentors."
                : "Be the pioneer mentor for your field and empower Nigerian scholars."}
            </p>
            {q || inst ? (
              <a
                href="/mentorship/find"
                className="rounded-lg bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition inline-block"
              >
                Clear Filters
              </a>
            ) : (
              <Link
                href="/mentorship/become"
                className="rounded-lg bg-[#00D2FF] px-5 py-2.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] transition inline-block shadow-sm"
              >
                Apply to Mentor
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
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
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-cyan-400/60 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#120D42] to-[#241468] text-white font-display font-bold text-base shadow-sm">
                          {profile?.full_name?.charAt(0) || "M"}
                        </div>
                        <div>
                          <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                            {profile?.full_name ?? "Mentor"}
                          </h3>
                          {instName && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building2 size={12} className="text-[#0284C7]" />
                              <span>{instName}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {mentor.bio}
                      </p>

                      {mentor.expertise_tags?.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {((mentor.expertise_tags as string[]) ?? []).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-cyan-50 border border-cyan-200 px-3 py-0.5 text-[10px] font-semibold text-[#0284C7]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {mentor.availability && (
                        <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                          <Clock size={12} />
                          <span>Availability: {mentor.availability}</span>
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 pt-1">
                      {!isSelf && matchState === "approved" && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 size={14} /> Active Match
                        </span>
                      )}
                      {!isSelf && matchState === "pending" && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
                          <Clock size={14} /> Request Pending
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