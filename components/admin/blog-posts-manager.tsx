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
          <h2 className="font-display text-3xl font-bold text-parchment">Content Editor</h2>
          <p className="mt-1 text-sm text-parchment/60">
            Create, manage, and publish your articles seamlessly.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-full bg-parchment px-5 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-parchment/10 hover:bg-white transition-all self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Write Article</span>
        </Link>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-parchment/10 bg-panel p-2 shadow-sm">
        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto p-1">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === "all"
                ? "bg-ink text-parchment shadow-inner border border-parchment/5"
                : "text-parchment/60 hover:text-parchment hover:bg-ink/50"
            }`}
          >
            All ({initialPosts.length})
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === "published"
                ? "bg-ink text-parchment shadow-inner border border-parchment/5"
                : "text-parchment/60 hover:text-parchment hover:bg-ink/50"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === "draft"
                ? "bg-ink text-parchment shadow-inner border border-parchment/5"
                : "text-parchment/60 hover:text-parchment hover:bg-ink/50"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title or slug..."
            className="w-full rounded-xl border border-parchment/10 bg-ink py-2.5 pl-11 pr-4 text-sm text-parchment placeholder:text-parchment/40 focus:border-parchment/30 focus:outline-none focus:ring-1 focus:ring-parchment/30"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="overflow-hidden rounded-2xl border border-parchment/10 bg-panel shadow-sm">
        <div className="divide-y divide-parchment/10">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition-colors hover:bg-ink/40"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-lg font-bold text-parchment truncate">
                    {post.title}
                  </h3>
                  {isScheduled(post) ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-sky-500/30 bg-sky-500/10 text-sky-400">
                      <CalendarClock size={10} />
                      Scheduled · {new Date(post.published_at!).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        post.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-parchment/5 text-parchment/50 border border-parchment/10"
                      }`}
                    >
                      {post.status === "published" && <CheckCircle2 size={10} />}
                      {post.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-parchment/50">
                  <span className="font-mono bg-ink px-1.5 py-0.5 rounded border border-parchment/5">
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
                      className="inline-flex items-center gap-1.5 text-parchment/60 hover:text-parchment transition-colors"
                    >
                      <ExternalLink size={13} />
                      <span>View Live</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex shrink-0 items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-parchment/10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="rounded-lg border border-parchment/20 bg-ink px-4 py-2 text-sm font-semibold text-parchment hover:bg-parchment/10 transition-colors shadow-sm"
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
            <div className="rounded-full bg-ink p-4 mb-4 border border-parchment/5">
              <FileText size={32} className="text-parchment/30" />
            </div>
            <p className="text-base font-medium text-parchment">
              {search ? "No matches found" : "No articles yet"}
            </p>
            <p className="mt-1 text-sm text-parchment/50">
              {search ? "Try adjusting your search query." : "Get started by writing your first article."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
