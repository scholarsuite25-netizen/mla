import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Pin,
  Clock,
  MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ForumReplyForm } from "./reply-form";

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ThreadPageProps) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: thread } = await admin
    .from("forum_threads")
    .select("title")
    .eq("id", id)
    .single();

  if (!thread) {
    return { title: "Discussion Not Found | Community Forum" };
  }

  return {
    title: `${thread.title} | Community Forum`,
  };
}

export default async function ThreadDetailPage({ params }: ThreadPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  // Fetch thread and category
  const { data: thread } = await admin
    .from("forum_threads")
    .select(
      `
      id,
      title,
      slug,
      content,
      author_id,
      author_name,
      author_email,
      is_pinned,
      is_locked,
      views_count,
      replies_count,
      created_at,
      updated_at,
      category_id,
      forum_categories (
        id,
        name,
        slug,
        icon
      )
    `
    )
    .eq("id", id)
    .single();

  if (!thread) {
    notFound();
  }

  // Fetch replies
  const { data: replies } = await admin
    .from("forum_replies")
    .select(
      `
      id,
      content,
      author_id,
      author_name,
      is_solution,
      created_at
    `
    )
    .eq("thread_id", id)
    .order("created_at", { ascending: true });

  const replyList = replies || [];
  // Category extracted from joined query
  const rawCategory = (thread as Record<string, unknown>).forum_categories;
  const category = (rawCategory && typeof rawCategory === "object" && !Array.isArray(rawCategory)
    ? rawCategory
    : null) as {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  } | null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/forum" className="hover:text-white transition-colors">
            Forum
          </Link>
          <span>/</span>
          {category && (
            <>
              <Link
                href={`/forum/${category.slug}`}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>{category.icon || "💬"}</span> {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-300 truncate max-w-xs">{thread.title}</span>
        </div>

        {/* Thread Original Post */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {thread.is_pinned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                  <Pin className="w-3 h-3" /> Pinned
                </span>
              )}
              {category && (
                <Link
                  href={`/forum/${category.slug}`}
                  className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 text-xs font-medium border border-teal-500/20 hover:bg-teal-500/20 transition-colors"
                >
                  {category.name}
                </Link>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {thread.title}
            </h1>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 pt-2 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center border border-teal-500/30">
                  {thread.author_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <div className="font-semibold text-slate-200">{thread.author_name}</div>
                  <div className="text-xs text-slate-500">Author</div>
                </div>
              </div>

              <div className="h-4 w-px bg-slate-800" />

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(thread.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-base font-sans">
            {thread.content}
          </div>
        </div>

        {/* Replies Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-400" />
              <span>Responses ({replyList.length})</span>
            </h2>
          </div>

          {replyList.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400 text-sm">
              No replies yet. Be the first to share your thoughts on this topic!
            </div>
          ) : (
            <div className="space-y-4">
              {replyList.map((reply, idx) => (
                <div
                  key={reply.id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 sm:p-6 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 font-semibold flex items-center justify-center border border-slate-700 text-xs">
                        {reply.author_name?.charAt(0).toUpperCase() || "S"}
                      </div>
                      <span className="font-semibold text-slate-200">
                        {reply.author_name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      #{idx + 1} •{" "}
                      {new Date(reply.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap pl-9">
                    {reply.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        <ForumReplyForm threadId={thread.id} isLoggedIn={Boolean(user)} />
      </div>
    </div>
  );
}
