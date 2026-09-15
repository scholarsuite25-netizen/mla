"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Code,
  Table as TableIcon,
  Minus,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import {
  savePostAction,
  publishPostAction,
  unpublishPostAction,
  uploadCoverAction,
} from "@/app/admin/blog/actions";
import { inputClass } from "@/components/login-form";
import { Markdown } from "@/components/markdown";

type Post = {
  id: string;
  title: string;
  slug: string;
  body: string;
  cover_image_url: string | null;
  status: string;
};

export function PostForm({ post }: { post: Post | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [cover, setCover] = useState(post?.cover_image_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("edit");

  const id = post?.id ?? null;

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  function handleAutoSlug() {
    if (title) setSlug(slugify(title));
  }

  function wrap(before: string, after = before) {
    const ta = document.getElementById("body") as HTMLTextAreaElement | null;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const next = value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e);
    setBody(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = s + before.length;
    });
  }

  async function onCoverChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const res = await uploadCoverAction(fd);
      setUploading(false);
      if (res.error) {
        setError(res.error);
      } else if (res.url) {
        setCover(res.url);
      }
    });
  }

  function submit(action: "draft" | "publish" | "unpublish") {
    return (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const form = e.currentTarget;
      startTransition(async () => {
        const result = await savePostAction(id, new FormData(form));
        if (result?.error) {
          setError(result.error);
          return;
        }
        if (action === "publish") {
          const res = await publishPostAction(id!);
          if (res?.error) setError(res.error);
          else {
            router.push("/admin/blog");
            router.refresh();
          }
        } else if (action === "unpublish") {
          const res = await unpublishPostAction(id!);
          if (res?.error) setError(res.error);
          else {
            router.push("/admin/blog");
            router.refresh();
          }
        } else {
          router.push("/admin/blog");
          router.refresh();
        }
      });
    };
  }

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <form onSubmit={submit("draft")} className="space-y-6">
      {/* Title & Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
            Post Title
          </span>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (!slug) handleAutoSlug();
            }}
            placeholder="e.g. Masterclass in Executive AI Automation"
            required
            className={inputClass}
          />
        </label>

        <label className="block">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-parchment/60 font-semibold">
              URL Slug
            </span>
            <button
              type="button"
              onClick={handleAutoSlug}
              className="text-[11px] text-gold hover:underline flex items-center gap-1"
            >
              <Sparkles size={11} />
              <span>Generate Slug</span>
            </button>
          </div>
          <input
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. executive-ai-automation"
            required
            className={inputClass}
          />
        </label>
      </div>

      {/* Featured Cover Image */}
      <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
        <span className="mb-2 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
          Featured Header Image
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-parchment hover:border-gold hover:text-gold transition-colors">
            <UploadCloud size={16} />
            <span>Upload Cover File</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={(e) => onCoverChange(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
          <div className="flex-1">
            <input
              type="text"
              name="cover_image_url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="Or paste external image URL (e.g. https://...)"
              className={inputClass}
            />
          </div>
          {uploading && <span className="text-xs text-gold animate-pulse">Uploading file...</span>}
        </div>

        {cover && (
          <div className="mt-3 relative inline-block group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt="Cover preview"
              className="h-28 w-48 rounded-xl object-cover border border-white/10 shadow-md"
            />
            <button
              type="button"
              onClick={() => setCover("")}
              className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700"
              title="Remove image"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Rich Markdown Formatting Toolbar */}
      <div className="rounded-2xl border border-white/10 bg-[#120D09] overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-white/[0.03] p-2.5 gap-2">
          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-1">
            <ToolbarBtn onClick={() => wrap("**")} label="Bold" icon={<Bold size={14} />} />
            <ToolbarBtn onClick={() => wrap("_")} label="Italic" icon={<Italic size={14} />} />
            <ToolbarBtn onClick={() => wrap("~~")} label="Strikethrough" icon={<Strikethrough size={14} />} />
            <div className="h-4 w-px bg-white/10 mx-1" />
            <ToolbarBtn onClick={() => wrap("## ")} label="Heading 2" icon={<Heading2 size={14} />} />
            <ToolbarBtn onClick={() => wrap("### ")} label="Heading 3" icon={<Heading3 size={14} />} />
            <ToolbarBtn onClick={() => wrap("> ")} label="Blockquote" icon={<Quote size={14} />} />
            <div className="h-4 w-px bg-white/10 mx-1" />
            <ToolbarBtn onClick={() => wrap("\n- ")} label="Bullet List" icon={<List size={14} />} />
            <ToolbarBtn onClick={() => wrap("\n1. ")} label="Numbered List" icon={<ListOrdered size={14} />} />
            <ToolbarBtn onClick={() => wrap("\n```\n", "\n```\n")} label="Code Block" icon={<Code size={14} />} />
            <ToolbarBtn onClick={() => wrap("[", "](https://)")} label="Insert Link" icon={<LinkIcon size={14} />} />
            <ToolbarBtn
              onClick={() =>
                wrap(
                  "\n| Column 1 | Column 2 |\n| :--- | :--- |\n| Data 1 | Data 2 |\n"
                )
              }
              label="Insert Table"
              icon={<TableIcon size={14} />}
            />
            <ToolbarBtn onClick={() => wrap("\n---\n")} label="Horizontal Divider" icon={<Minus size={14} />} />
          </div>

          {/* View Mode & Metrics */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-parchment/50 font-mono hidden sm:inline">
              {wordCount} words · ~{readTime} min read
            </span>
            <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-colors ${
                  viewMode === "edit" ? "bg-gold/20 text-gold" : "text-parchment/60 hover:text-parchment"
                }`}
                title="Visual Editor"
              >
                <Edit3 size={12} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`hidden md:flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-colors ${
                  viewMode === "split" ? "bg-gold/20 text-gold" : "text-parchment/60 hover:text-parchment"
                }`}
                title="Split View"
              >
                <Columns size={12} />
                <span>Split</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-colors ${
                  viewMode === "preview" ? "bg-gold/20 text-gold" : "text-parchment/60 hover:text-parchment"
                }`}
                title="Live Preview"
              >
                <Eye size={12} />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Editor Body */}
        <div className="p-4">
          {viewMode === "edit" && (
            <textarea
              id="body"
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={18}
              placeholder="Write your article in markdown..."
              className="w-full rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-sm leading-relaxed text-parchment placeholder:text-parchment/30 focus:border-gold/50 focus:outline-none"
            />
          )}

          {viewMode === "preview" && (
            <div className="min-h-[400px] rounded-xl border border-white/5 bg-black/30 p-6">
              <div className="prose prose-invert max-w-none">
                <Markdown>{body || "*Start typing to see live formatted preview...*"}</Markdown>
              </div>
            </div>
          )}

          {viewMode === "split" && (
            <div className="grid grid-cols-2 gap-4">
              <textarea
                id="body"
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={18}
                placeholder="Write markdown here..."
                className="w-full rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-sm leading-relaxed text-parchment focus:border-gold/50 focus:outline-none"
              />
              <div className="h-[460px] overflow-y-auto rounded-xl border border-white/5 bg-black/30 p-6">
                <div className="prose prose-invert max-w-none text-xs">
                  <Markdown>{body || "*Live preview updates as you type...*"}</Markdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-crest-red font-medium">{error}</p>}

      {/* Bottom Save & Publish Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl border border-gold/40 bg-gold/10 px-6 py-2.5 text-xs font-semibold text-gold hover:bg-gold/20 transition-all disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save Draft"}
          </button>

          {id && post?.status === "draft" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const res = await publishPostAction(id);
                  if (res?.error) setError(res.error);
                  else {
                    router.push("/admin/blog");
                    router.refresh();
                  }
                });
              }}
              className="rounded-xl bg-gradient-to-r from-crest-red to-amber-700 px-6 py-2.5 text-xs font-semibold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              {pending ? "Publishing..." : "Publish Article"}
            </button>
          )}

          {id && post?.status === "published" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const res = await unpublishPostAction(id);
                  if (res?.error) setError(res.error);
                  else {
                    router.push("/admin/blog");
                    router.refresh();
                  }
                });
              }}
              className="rounded-xl border border-parchment/20 px-5 py-2.5 text-xs font-semibold text-parchment/80 hover:border-crest-red hover:text-crest-red transition-colors disabled:opacity-50"
            >
              {pending ? "Updating..." : "Revert to Draft"}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="text-xs text-parchment/60 hover:text-parchment hover:underline"
        >
          Cancel &amp; Return
        </button>
      </div>
    </form>
  );
}

function ToolbarBtn({
  onClick,
  label,
  icon,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition-colors"
    >
      {icon}
    </button>
  );
}