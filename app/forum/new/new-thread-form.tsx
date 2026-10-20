"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, AlertCircle } from "lucide-react";
import { createThreadAction } from "../actions";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

export function NewThreadForm({
  categories,
  defaultCategoryId,
}: {
  categories: CategoryOption[];
  defaultCategoryId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState<string>(
    defaultCategoryId || categories[0]?.id || ""
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("categoryId", categoryId);
    formData.append("title", title);
    formData.append("content", content);

    startTransition(async () => {
      const res = await createThreadAction(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.threadId) {
        router.push(`/forum/thread/${res.threadId}`);
      } else {
        router.push("/forum");
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Category <span className="text-red-400">*</span>
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-slate-400">
          Choose the most appropriate topic channel for maximum peer visibility.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Discussion Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. How to differentiate Stage 2 and Stage 3 Hypertensive Crisis in CHEW CBT?"
          required
          minLength={5}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Post Details & Context <span className="text-red-400">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Describe your question, cite relevant cases, past exam paper numbers, or clinical protocol details..."
          required
          minLength={15}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-sans leading-relaxed"
        />
        <p className="mt-1.5 text-xs text-slate-400">
          Minimum 15 characters. Be courteous, clear, and professional.
        </p>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publishing Thread...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Publish Discussion
            </>
          )}
        </button>
      </div>
    </form>
  );
}
