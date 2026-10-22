import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  MessageSquare,
  MessagesSquare,
  BookOpen,
  Sparkles,
  Award,
  Plus,
  ArrowRight,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Scholarly & Leadership Community Forum — Mentorship & Leadership Academy",
  description:
    "Engage in academic discussions, research methodologies, generative AI workflows, and university governance with peers and mentors.",
};

const iconMap: Record<string, React.ElementType> = {
  MessagesSquare,
  BookOpen,
  Sparkles,
  Award,
  MessageSquare,
};

export default async function ForumHomePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: recentThreads }] = await Promise.all([
    supabase
      .from("forum_categories")
      .select("id, name, slug, description, icon, display_order")
      .order("display_order", { ascending: true }),
    supabase
      .from("forum_threads")
      .select("id, title, slug, content, author_name, replies_count, views_count, last_activity_at, created_at, category:forum_categories(name, slug)")
      .order("last_activity_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800">
      {/* Royal Navy Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] text-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#00D2FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-[#7C3AED]/25 blur-3xl" />

        <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-[#00D2FF] uppercase tracking-wider mb-3">
              <MessagesSquare size={13} /> Academic Discourse &amp; Exchange
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-2.5">
              Community Forum
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Connect with fellow researchers, educators, and leaders. Exchange insights on AI workflows, institutional administration, research publishing, and digital wealth creation.
            </p>
          </div>

          <Link
            href="/forum/new"
            className="rounded-lg bg-[#00D2FF] px-5 py-2.5 text-xs font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition shrink-0 inline-flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <Plus size={15} />
            <span>Start a Discussion</span>
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Categories Grid */}
        <div className="mb-14">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
            <span>Discussion Categories</span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(categories ?? []).map((cat) => {
              const Icon = iconMap[cat.icon ?? "MessageSquare"] || MessageSquare;
              return (
                <Link
                  key={cat.id}
                  href={`/forum/${cat.slug}`}
                  className="group rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-cyan-400/60 hover:shadow-md transition shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#0284C7] border border-cyan-100 group-hover:scale-105 transition-transform">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0284C7]">
                    <span>Explore Topics</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Active Discussions Stream */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Recent Discussions
            </h2>
            <Link href="/forum/new" className="text-xs font-bold text-[#0284C7] hover:underline">
              + Post Topic
            </Link>
          </div>

          <div className="space-y-3">
            {(recentThreads ?? []).map((thread) => {
              const categoryData = Array.isArray(thread.category) ? thread.category[0] : thread.category;
              return (
                <Link
                  key={thread.id}
                  href={`/forum/thread/${thread.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 hover:border-cyan-400/60 hover:shadow-md transition shadow-sm"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      {categoryData?.name && (
                        <span className="rounded-full bg-cyan-50 border border-cyan-200 px-2 py-0.5 font-bold text-[#0284C7]">
                          {categoryData.name}
                        </span>
                      )}
                      <span className="text-slate-400">Started by</span>
                      <span className="font-semibold text-slate-700">{thread.author_name}</span>
                    </div>

                    <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition line-clamp-1">
                      {thread.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {thread.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-[#0284C7]" />
                      <span className="font-bold text-slate-800">{thread.replies_count}</span>
                      <span className="hidden sm:inline">replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>
                        {new Date(thread.last_activity_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {(!recentThreads || recentThreads.length === 0) && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center text-slate-400 shadow-sm">
                <MessagesSquare size={36} className="mx-auto mb-2.5 opacity-40" />
                <p className="text-xs sm:text-sm">No discussions yet. Be the first to start a conversation!</p>
                <Link
                  href="/forum/new"
                  className="mt-3 inline-block text-xs font-bold text-[#0284C7] underline"
                >
                  Create Discussion Thread
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
