import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft, Calendar, Pin, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: notice } = await supabase
    .from("notices")
    .select("title, content")
    .eq("slug", slug)
    .maybeSingle();

  if (!notice) return { title: "Notice Not Found" };
  return {
    title: `${notice.title} — Official Notice`,
    description: notice.content.slice(0, 160),
  };
}

export default async function SingleNoticePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: notice } = await supabase
    .from("notices")
    .select("id, title, slug, content, category, is_pinned, published_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!notice) notFound();

  return (
    <div className="min-h-screen bg-ink text-parchment">
      <div className="mx-auto max-w-4xl px-4 py-12 lg:py-20">
        <Link
          href="/notices"
          className="inline-flex items-center gap-2 text-xs font-semibold text-parchment/60 hover:text-gold transition mb-8"
        >
          <ChevronLeft size={16} /> Back to All Notices
        </Link>

        <article className="rounded-3xl border border-white/10 bg-[#120D09] p-8 sm:p-12 shadow-2xl">
          <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-6 mb-8">
            {notice.is_pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 text-gold border border-gold/40 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <Pin size={12} /> Pinned Notice
              </span>
            )}
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold capitalize">
              {notice.category}
            </span>
            <span className="text-xs text-parchment/40 flex items-center gap-1.5 ml-auto">
              <Calendar size={13} />
              {new Date(notice.published_at).toLocaleDateString("en-NG", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold text-parchment leading-tight mb-8">
            {notice.title}
          </h1>

          <div className="prose prose-invert prose-parchment max-w-none text-parchment/80 leading-relaxed text-sm sm:text-base font-light whitespace-pre-wrap">
            {notice.content}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-parchment/40">
              <Bell size={14} className="text-gold" />
              <span>Official Circular · Mentorship &amp; Leadership Academy</span>
            </div>
            <Link
              href="/notices"
              className="text-xs font-bold text-gold hover:underline"
            >
              Browse More Bulletins →
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
