"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, ExternalLink, Calendar, FileText, CheckCircle2, CalendarClock } from "lucide-react";
import { PublishButton, UnpublishButton, DeleteButton } from "@/components/admin/post-actions";

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  updated_at: string;
}

export function BlogPostsManager({ initialPosts }: { initialPosts: BlogPostItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const isScheduled = (p: BlogPostItem) =>
    p.status === "draft" && !!p.published_at && new Date(p.published_at).getTime() > Date.now();

  const filteredPosts = initialPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.slug.toLowerCase().includes(search.toLowerCase());

    const postState = isScheduled(post) ? "draft" : post.status;
    const matchesStatus = statusFilter === "all" || postState === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const publishedCount = initialPosts.filter((p) => p.status === "published").length;
  const draftCount = initialPosts.filter((p) => p.status === "draft").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header & New Post Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">Articles &amp; Blog CMS</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Create, manage, and publish your articles seamlessly without code.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#00D2FF] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Write Article</span>
        </Link>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto p-1">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#120D42] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            All ({initialPosts.length})
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              statusFilter === "published"
                ? "bg-[#120D42] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              statusFilter === "draft"
                ? "bg-[#120D42] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title or slug..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="divide-y divide-slate-100">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition-colors hover:bg-slate-50/80"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
                    {post.title}
                  </h3>
                  {isScheduled(post) ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-sky-200 bg-sky-50 text-sky-700">
                      <CalendarClock size={10} />
                      Scheduled · {new Date(post.published_at!).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        post.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {post.status === "published" && <CheckCircle2 size={10} />}
                      {post.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                    /{post.slug}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(post.updated_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {post.status === "published" && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[#0284C7] hover:underline font-medium transition-colors"
                    >
                      <ExternalLink size={13} />
                      <span>View Live</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex shrink-0 items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-cyan-400 hover:text-[#0284C7] hover:bg-cyan-50/50 transition-all shadow-xs"
                >
                  Edit
                </Link>
                {post.status === "draft" ? (
                  <PublishButton postId={post.id} />
                ) : (
                  <UnpublishButton postId={post.id} />
                )}
                <DeleteButton postId={post.id} />
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4 border border-slate-200">
              <FileText size={32} className="text-slate-400" />
            </div>
            <p className="text-base font-bold text-slate-800">
              {search ? "No matches found" : "No articles yet"}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {search ? "Try adjusting your search query." : "Get started by writing your first article."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
