"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Send, AlertCircle, LogIn } from "lucide-react";
import { postReplyAction } from "../../actions";

export function ForumReplyForm({
  threadId,
  isLoggedIn,
}: {
  threadId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
        <h4 className="text-base font-bold text-white mb-2">Join this conversation</h4>
        <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
          Please log in or create a scholar account to contribute clinical insights, solutions, or comments to this discussion.
        </p>
        <Link
          href={`/auth/login?next=/forum/thread/${threadId}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all"
        >
          <LogIn className="w-4 h-4" /> Log In to Reply
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("threadId", threadId);
    formData.append("content", content);

    startTransition(async () => {
      const res = await postReplyAction(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      setContent("");
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
      <h3 className="text-lg font-bold text-white mb-4">Post a Response</h3>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 mb-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm">
          Your reply has been posted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Share your clinical insight, answer the query, or provide helpful pointers..."
          required
          minLength={3}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-sans"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || content.trim().length < 3}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-md shadow-teal-500/10 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post Reply
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
