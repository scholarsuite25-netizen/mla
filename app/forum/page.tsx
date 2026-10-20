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
    <div className="min-h-screen bg-ink text-parchment">
      {/* Header Banner */}
      <div className="border-b border-white/10 bg-gradient-to-b from-[#1C140D] via-[#0E0A08] to-ink py-16 px-4">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold uppercase tracking-widest mb-4">
              <MessagesSquare size={14} /> Academic Discourse &amp; Exchange
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-parchment tracking-tight mb-3">
              Community Forum
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-parchment/70 font-light leading-relaxed">
              Connect with fellow researchers, educators, and leaders. Exchange insights on AI workflows, institutional administration, research publishing, and digital wealth creation.
            </p>
          </div>

          <Link
            href="/forum/new"
            className="rounded-full bg-gradient-to-r from-gold-dark to-gold px-6 py-3.5 text-xs font-bold text-ink shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition shrink-0 inline-flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <Plus size={16} />
            <span>Start a Discussion</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold text-parchment mb-6 flex items-center gap-2">
            <span>Discussion Categories</span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(categories ?? []).map((cat) => {
              const Icon = iconMap[cat.icon ?? "MessageSquare"] || MessageSquare;
              return (
                <Link
                  key={cat.id}
                  href={`/forum/${cat.slug}`}
                  className="group rounded-2xl border border-white/10 bg-[#120D09] p-6 hover:border-gold/40 hover:bg-[#16100C] transition shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold group-hover:scale-105 transition-transform">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-parchment group-hover:text-gold transition">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-parchment/65 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-gold">
                    <span>Explore Topics</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Active Discussions Stream */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-parchment">
              Recent Discussions
            </h2>
            <Link href="/forum/new" className="text-xs font-bold text-gold hover:underline">
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
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#120D09] p-5 hover:border-gold/30 hover:bg-[#16100C] transition shadow-md"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      {categoryData?.name && (
                        <span className="rounded-full bg-gold/10 border border-gold/20 px-2 py-0.5 font-bold text-gold">
                          {categoryData.name}
                        </span>
                      )}
                      <span className="text-parchment/40">Started by</span>
                      <span className="font-semibold text-parchment/80">{thread.author_name}</span>
                    </div>

                    <h3 className="font-display text-base sm:text-lg font-bold text-parchment group-hover:text-gold transition line-clamp-1">
                      {thread.title}
                    </h3>
                    <p className="text-xs text-parchment/60 line-clamp-1 font-light">
                      {thread.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 text-xs text-parchment/50 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-gold/70" />
                      <span className="font-bold text-parchment">{thread.replies_count}</span>
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
              <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-parchment/50">
                <MessagesSquare size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No discussions yet. Be the first to start a conversation!</p>
                <Link
                  href="/forum/new"
                  className="mt-4 inline-block text-xs font-bold text-gold underline"
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
