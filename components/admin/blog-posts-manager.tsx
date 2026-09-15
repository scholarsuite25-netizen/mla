"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, ExternalLink, Calendar, FileText } from "lucide-react";
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

  const filteredPosts = initialPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.slug.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const publishedCount = initialPosts.filter((p) => p.status === "published").length;
  const draftCount = initialPosts.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header & New Post Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-parchment sm:text-3xl">Blog CMS</h2>
          <p className="mt-1 text-xs text-parchment/60">
            WordPress-grade content management: compose, edit, publish, and schedule articles.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-crest-red to-amber-700 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Article</span>
        </Link>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#120D09] p-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            All ({initialPosts.length})
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === "published"
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === "draft"
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title..."
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-parchment placeholder:text-parchment/40 focus:border-gold/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#140F0B] p-5 shadow-md hover:border-gold/30 transition-all"
          >
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    post.status === "published"
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-white/10 bg-white/5 text-parchment/50"
                  }`}
                >
                  {post.status}
                </span>
                <span className="text-[11px] text-parchment/40 font-mono">
                  /{post.slug}
                </span>
              </div>

              <h3 className="font-display text-base sm:text-lg font-bold text-parchment truncate">
                {post.title}
              </h3>

              <div className="flex items-center gap-4 text-[11px] text-parchment/50">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(post.updated_at).toLocaleDateString()}
                </span>
                {post.status === "published" && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-gold hover:underline"
                  >
                    <ExternalLink size={11} />
                    <span>View Live</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
              <Link
                href={`/admin/blog/${post.id}/edit`}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-parchment hover:border-gold/60 hover:text-gold transition-colors"
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

        {filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-panel p-12 text-center">
            <FileText size={28} className="mx-auto text-parchment/30 mb-2" />
            <p className="text-sm text-parchment/60">
              {search ? "No posts match your search query." : "No blog posts yet. Write your first article."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
