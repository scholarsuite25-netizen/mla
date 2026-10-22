import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Bell, Pin, ArrowRight, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Official Notice Board & Bulletins — Mentorship & Leadership Academy",
  description:
    "Official university circulars, academic memoranda, membership updates, and event notices from the Mentorship & Leadership Academy.",
};

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("notices")
    .select("id, title, slug, content, category, is_pinned, published_at")
    .eq("is_published", true)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data: notices, error } = await query;

  const categories = [
    { label: "All Notices", value: "all" },
    { label: "Urgent", value: "urgent" },
    { label: "Academic", value: "academic" },
    { label: "Membership", value: "membership" },
    { label: "General", value: "general" },
    { label: "Events", value: "event" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800">
      {/* Royal Navy Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] text-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#00D2FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-[#7C3AED]/25 blur-3xl" />

        <div className="mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-[#00D2FF] uppercase tracking-wider mb-4">
            <Bell size={13} /> Official Bulletins &amp; Circulars
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
            Notice Board
          </h1>
          <p className="mx-auto max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
            Stay informed with the latest administrative updates, academic announcements, lecture schedules, and membership releases from S. B. Omotoso.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8">
          {categories.map((c) => {
            const isActive = (!category && c.value === "all") || category === c.value;
            return (
              <Link
                key={c.value}
                href={c.value === "all" ? "/notices" : `/notices?category=${c.value}`}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "bg-[#00D2FF] text-[#0A0E2A] font-bold shadow-sm"
                    : "bg-white text-slate-600 hover:border-cyan-400 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* Notices Feed */}
        {error ? (
          <p className="text-red-500">{error.message}</p>
        ) : (
          <div className="space-y-4">
            {(notices ?? []).map((notice) => (
              <div
                key={notice.id}
                className={`group rounded-2xl border p-5 sm:p-6 transition-all ${
                  notice.is_pinned
                    ? "border-cyan-300 bg-cyan-50/50 shadow-sm"
                    : "border-slate-200/90 bg-white hover:border-cyan-400/60 hover:shadow-md shadow-sm"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 text-[#0284C7] border border-cyan-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        <Pin size={10} /> Pinned Notice
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 capitalize">
                      {notice.category}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar size={12} />
                    {new Date(notice.published_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <Link href={`/notices/${notice.slug}`} className="block group-hover:text-[#0284C7] transition">
                  <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0284C7] mb-2 transition">
                    {notice.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-3">
                  {notice.content}
                </p>

                <Link
                  href={`/notices/${notice.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:underline"
                >
                  <span>Read Full Notice</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}

            {(!notices || notices.length === 0) && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-400 shadow-sm">
                <Bell size={36} className="mx-auto mb-2.5 opacity-40" />
                <p className="text-xs sm:text-sm">No notices published in this category yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
