"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, CheckCircle2, Flag, Trash2, Mail, ShieldAlert } from "lucide-react";
import {
  moderateCommentAction,
  deleteCommentAction,
} from "@/app/admin/blog/actions";

export type BlogCommentRow = {
  id: string;
  post_id: string;
  posts: { title: string; slug: string } | { title: string; slug: string }[] | null;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  spam: "Spam",
};

export function BlogCommentsManager({ initialComments }: { initialComments: BlogCommentRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "spam">("pending");
  const [pending, startTransition] = useTransition();

  const counts = {
    all: initialComments.length,
    pending: initialComments.filter((c) => c.status === "pending").length,
    approved: initialComments.filter((c) => c.status === "approved").length,
    spam: initialComments.filter((c) => c.status === "spam").length,
  };

  const shown = initialComments.filter((c) => filter === "all" || c.status === filter);

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold text-parchment">Comment Moderation</h1>
        <p className="text-sm text-parchment/60">
          Approve, flag, or remove reader comments across all posts.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-parchment/10 bg-panel p-2">
        {(["all", "pending", "approved", "spam"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              filter === s
                ? "bg-ink text-parchment shadow-inner border border-parchment/5"
                : "text-parchment/60 hover:text-parchment hover:bg-ink/50"
            }`}
          >
            {STATUS_LABEL[s]}
            <span className="ml-2 text-xs text-gold">{counts[s]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-parchment/20 p-12 text-center text-parchment/50">
          No {filter === "all" ? "" : STATUS_LABEL[filter].toLowerCase() + " "}comments to review.
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((comment) => {
            const inst =
              comment.posts && !Array.isArray(comment.posts) ? comment.posts : Array.isArray(comment.posts) ? comment.posts[0] : null;
            return (
              <div
                key={comment.id}
                className="rounded-2xl border border-parchment/10 bg-panel p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-parchment">{comment.author_name}</p>
                      <p className="flex items-center gap-1 text-xs text-parchment/50">
                        <Mail size={11} /> {comment.author_email}
                        <span className="text-parchment/30">·</span>
                        {new Date(comment.created_at).toLocaleString("en-NG")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      comment.status === "pending"
                        ? "border border-amber-500/40 bg-amber-500/10 text-amber-300"
                        : comment.status === "spam"
                        ? "border border-crest-red/40 bg-crest-red/10 text-crest-red-bright"
                        : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {STATUS_LABEL[comment.status]}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-ink p-4 text-sm text-parchment/80">
                  {comment.content}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {comment.status !== "approved" && (
                    <button
                      onClick={() => run(() => moderateCommentAction(comment.id, "approved"))}
                      disabled={pending}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20 disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                  )}
                  {comment.status !== "spam" && (
                    <button
                      onClick={() => run(() => moderateCommentAction(comment.id, "spam"))}
                      disabled={pending}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-crest-red/30 bg-crest-red/10 px-3 py-1.5 text-xs font-semibold text-crest-red hover:bg-crest-red/20 disabled:opacity-50"
                    >
                      <Flag size={13} /> Mark as Spam
                    </button>
                  )}
                  <button
                    onClick={() => run(() => deleteCommentAction(comment.id))}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-parchment/60 hover:text-crest-red hover:border-crest-red/40 disabled:opacity-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>

                  {inst && (
                    <Link
                      href={`/admin/blog/${comment.post_id}/edit`}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-parchment/60 hover:text-gold hover:border-gold/30"
                    >
                      <ShieldAlert size={13} /> On: {inst.title}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}