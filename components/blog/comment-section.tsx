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
      <div className="rounded-2xl border border-white/10 bg-[#120D09] p-6 text-center text-xs text-parchment/50">
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
    <section id="comments" className="mt-16 border-t border-white/10 pt-12 space-y-10">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-gold" />
          <h3 className="font-display text-2xl font-bold text-parchment">
            Discussion &amp; Perspectives ({comments.length})
          </h3>
        </div>
        <span className="text-xs text-parchment/40">WordPress-verified thread</span>
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
                className="rounded-2xl border border-white/10 bg-[#140E0A] p-5 shadow-md space-y-2.5 transition hover:border-gold/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold font-display">
                      {initials || <User size={14} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-parchment">
                        {comment.author_name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-parchment/40">
                        <Clock size={11} className="text-gold/60" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-parchment/80 whitespace-pre-wrap pl-11">
                  {comment.content}
                </p>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#120D09]/50 p-8 text-center text-xs text-parchment/50">
            Be the first to share a perspective on this dispatch.
          </div>
        )}
      </div>

      {/* Leave a Reply Form */}
      <div className="rounded-3xl border border-white/15 bg-[#120D09] p-6 sm:p-8 shadow-xl space-y-5">
        <div>
          <h4 className="font-display text-xl font-bold text-parchment">
            Leave a Reply
          </h4>
          <p className="text-xs text-parchment/50 mt-1">
            Your email address will not be published. Required fields are marked *
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-crest-red/30 bg-crest-red/10 p-3 text-xs text-crest-red">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
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
              <label className="text-xs font-semibold uppercase tracking-wider text-parchment/70">
                Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jane Doe"
                className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-3 text-xs text-parchment placeholder-parchment/40 focus:border-gold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-parchment/70">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@university.edu"
                className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-3 text-xs text-parchment placeholder-parchment/40 focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-parchment/70">
              Your Perspective / Comment *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Contribute constructive insights, counter-perspectives, or questions on this article..."
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-3 text-xs sm:text-sm text-parchment placeholder-parchment/40 focus:border-gold focus:outline-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-amber-500 px-6 py-3 text-xs font-bold text-midnight hover:brightness-110 shadow-lg disabled:opacity-50 transition-all"
          >
            <Send size={13} />
            <span>{pending ? "Submitting..." : "Post Comment"}</span>
          </button>
        </form>
      </div>
    </section>
  );
}
