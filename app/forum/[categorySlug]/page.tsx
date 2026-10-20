import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  MessageSquarePlus,
  Pin,
  Clock,
  User,
  Sparkles,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const admin = createAdminClient();
  const { data: category } = await admin
    .from("forum_categories")
    .select("name, description")
    .eq("slug", categorySlug)
    .single();

  if (!category) {
    return { title: "Category Not Found | Community Forum" };
  }

  return {
    title: `${category.name} | Community Forum`,
    description: category.description || `Browse discussions in ${category.name}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const admin = createAdminClient();

  const { data: category } = await admin
    .from("forum_categories")
    .select("id, name, slug, icon, description")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .single();

  if (!category) {
    notFound();
  }

  const { data: threads } = await admin
    .from("forum_threads")
    .select("id, title, slug, content, author_name, replies_count, is_pinned, created_at, last_activity_at")
    .eq("category_id", category.id)
    .order("is_pinned", { ascending: false })
    .order("last_activity_at", { ascending: false });

  const threadList = threads || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Forum Categories
          </Link>

          <Link
            href={`/forum/new?category=${category.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4" /> Start Discussion Here
          </Link>
        </div>

        {/* Category Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/30 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{category.icon || "💬"}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Topic Channel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
              {category.description}
            </p>
          )}
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-4">
            <span>{threadList.length} total discussion{threadList.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        {/* Threads List */}
        <div className="space-y-3">
          {threadList.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-300">No discussions yet in this channel</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                Be the first scholar to pose a question, share an exam experience, or start a debate!
              </p>
              <div className="mt-6">
                <Link
                  href={`/forum/new?category=${category.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all"
                >
                  <MessageSquarePlus className="w-4 h-4" /> Start the First Discussion
                </Link>
              </div>
            </div>
          ) : (
            threadList.map((t) => (
              <Link
                key={t.id}
                href={`/forum/thread/${t.id}`}
                className="group block bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-xl p-5 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {t.is_pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                        {t.title}
                      </h2>
                    </div>

                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {t.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {t.author_name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Updated {new Date(t.last_activity_at || t.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                    <span>{t.replies_count || 0}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
