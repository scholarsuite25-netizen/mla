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
    <div className="min-h-screen bg-ink text-parchment">
      {/* Header Banner */}
      <div className="border-b border-white/10 bg-gradient-to-b from-[#18110B] via-[#0E0A08] to-ink py-16 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold uppercase tracking-widest mb-6">
            <Bell size={14} /> Official Bulletins &amp; Circulars
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-parchment tracking-tight mb-4">
            Notice Board
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-parchment/70 leading-relaxed font-light">
            Stay informed with the latest administrative updates, academic announcements, lecture schedules, and membership releases from S. B. Omotoso.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((c) => {
            const isActive = (!category && c.value === "all") || category === c.value;
            return (
              <Link
                key={c.value}
                href={c.value === "all" ? "/notices" : `/notices?category=${c.value}`}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-gold text-ink shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    : "bg-white/5 text-parchment/70 hover:bg-white/10 hover:text-parchment border border-white/5"
                }`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* Notices Feed */}
        {error ? (
          <p className="text-crest-red">{error.message}</p>
        ) : (
          <div className="space-y-4">
            {(notices ?? []).map((notice) => (
              <div
                key={notice.id}
                className={`group rounded-2xl border p-6 transition-all ${
                  notice.is_pinned
                    ? "border-gold/40 bg-gradient-to-r from-gold/10 via-[#18110B] to-[#120D09] shadow-lg shadow-gold/5"
                    : "border-white/10 bg-[#120D09] hover:border-gold/30 hover:bg-[#16100C]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 text-gold border border-gold/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                        <Pin size={10} /> Pinned Notice
                      </span>
                    )}
                    <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold capitalize">
                      {notice.category}
                    </span>
                  </div>

                  <span className="text-xs text-parchment/40 flex items-center gap-1.5">
                    <Calendar size={12} />
                    {new Date(notice.published_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <Link href={`/notices/${notice.slug}`} className="block group-hover:text-gold transition">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-parchment group-hover:text-gold mb-3 transition">
                    {notice.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm text-parchment/70 leading-relaxed line-clamp-3 mb-4 font-light">
                  {notice.content}
                </p>

                <Link
                  href={`/notices/${notice.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:underline"
                >
                  <span>Read Full Notice</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}

            {(!notices || notices.length === 0) && (
              <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-parchment/50">
                <Bell size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notices published in this category yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
