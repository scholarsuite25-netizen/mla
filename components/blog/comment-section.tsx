"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Send, CheckCircle2, AlertCircle, User, Clock } from "lucide-react";
import { submitCommentAction } from "@/app/blog/actions";
import { type BlogComment } from "@/lib/blog";

export function CommentSection({
  postId,
  postSlug,
  initialComments,
  allowComments = true,
}: {
  postId: string;
  postSlug: string;
  initialComments: BlogComment[];
  allowComments?: boolean;
}) {
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!allowComments) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
        Comments are closed for this article.
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || !email.trim() || !content.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    const fd = new FormData();
    fd.append("postId", postId);
    fd.append("postSlug", postSlug);
    fd.append("authorName", name);
    fd.append("authorEmail", email);
    fd.append("content", content);
    fd.append("website", honeypot); // honeypot

    startTransition(async () => {
      const res = await submitCommentAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        // Optimistically add comment to list
        const newComment: BlogComment = {
          id: crypto.randomUUID(),
          post_id: postId,
          author_name: name,
          author_id: null,
          content: content,
          status: "approved",
          created_at: new Date().toISOString(),
        };
        setComments([...comments, newComment]);
        setContent("");
      }
    });
  }

  return (
    <section id="comments" className="mt-16 border-t border-slate-200 pt-12 space-y-10">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-[#0284C7] border border-cyan-200">
            <MessageSquare size={18} />
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Discussion &amp; Perspectives ({comments.length})
          </h3>
        </div>
        <span className="text-xs text-slate-400">Academy thread</span>
      </div>

      {/* Existing Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const dateStr = new Date(comment.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const initials = comment.author_name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={comment.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5 transition hover:border-cyan-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 border border-cyan-200 text-[#0284C7] text-xs font-bold font-display">
                      {initials || <User size={14} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {comment.author_name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock size={11} className="text-slate-400" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-wrap pl-11">
                  {comment.content}
                </p>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            Be the first to share a perspective on this dispatch.
          </div>
        )}
      </div>

      {/* Leave a Reply Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-5">
        <div>
          <h4 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            Leave a Reply
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Your email address will not be published. Required fields are marked *
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-medium">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 font-medium">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>Thank you! Your comment has been published.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field (hidden from real users) */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jane Doe"
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@university.edu"
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Your Perspective / Comment *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Contribute constructive insights, counter-perspectives, or questions on this article..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none leading-relaxed transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00D2FF] px-6 py-3 text-xs sm:text-sm font-bold text-[#0A0E2A] hover:bg-[#38BDF8] shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Send size={14} />
            <span>{pending ? "Submitting..." : "Post Comment"}</span>
          </button>
        </form>
      </div>
    </section>
  );
}
