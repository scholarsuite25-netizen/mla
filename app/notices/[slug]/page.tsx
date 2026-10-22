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
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800">
      <div className="mx-auto max-w-4xl px-4 py-10 lg:py-16">
        <Link
          href="/notices"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0284C7] transition mb-6"
        >
          <ChevronLeft size={16} /> Back to All Notices
        </Link>

        <article className="rounded-2xl border border-slate-200/90 bg-white p-7 sm:p-12 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-5 mb-6">
            {notice.is_pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 text-[#0284C7] border border-cyan-200 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                <Pin size={12} /> Pinned Notice
              </span>
            )}
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-700 capitalize">
              {notice.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 ml-auto">
              <Calendar size={13} />
              {new Date(notice.published_at).toLocaleDateString("en-NG", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-6">
            {notice.title}
          </h1>

          <div className="text-slate-700 leading-relaxed text-sm sm:text-base font-normal whitespace-pre-wrap">
            {notice.content}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bell size={14} className="text-[#0284C7]" />
              <span>Official Circular · Mentorship &amp; Leadership Academy</span>
            </div>
            <Link
              href="/notices"
              className="text-xs font-bold text-[#0284C7] hover:underline"
            >
              Browse More Bulletins →
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
