"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bold, Italic, Link as LinkIcon, List, Heading2 } from "lucide-react";
import {
  savePostAction,
  publishPostAction,
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
  const [body, setBody] = useState(post?.body ?? "");
  const [cover, setCover] = useState(post?.cover_image_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState(false);

  const id = post?.id ?? null;

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

  function submit(action: "draft" | "publish") {
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
        // savePostAction redirects to the edit page on success.
        if (action === "publish") {
          const res = await publishPostAction(id!);
          if (res?.error) setError(res.error);
          else router.push("/admin/blog");
        }
      });
    };
  }

  return (
    <form onSubmit={submit("draft")} className="mt-6 space-y-5">
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Title
        </span>
        <input name="title" defaultValue={post?.title} required className={inputClass} />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Slug
        </span>
        <input
          name="slug"
          defaultValue={post?.slug}
          placeholder="auto-generated from title"
          className={inputClass}
        />
      </label>

      <div className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Cover image
        </span>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={(e) => onCoverChange(e.target.files?.[0] ?? null)}
            className="text-sm text-parchment/60 file:mr-3 file:rounded-sm file:border-0 file:bg-panel file:px-3 file:py-2 file:text-sm file:text-gold"
          />
          {uploading && <span className="text-xs text-parchment/50">Uploading…</span>}
        </div>
        <input type="hidden" name="cover_image_url" value={cover} />
        {cover && (
          <div className="mt-3 flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="Cover preview" className="h-20 w-32 rounded-sm object-cover" />
            <button
              type="button"
              onClick={() => setCover("")}
              className="mt-1 text-xs text-crest-red hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="block">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-parchment/60">Body (markdown)</span>
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => wrap("**")} label="Bold" icon={<Bold size={14} />} />
            <ToolbarButton onClick={() => wrap("_")} label="Italic" icon={<Italic size={14} />} />
            <ToolbarButton onClick={() => wrap("## ")} label="Heading" icon={<Heading2 size={14} />} />
            <ToolbarButton onClick={() => wrap("\n- ")} label="Bullet list" icon={<List size={14} />} />
            <ToolbarButton
              onClick={() => wrap("[", "](https://)")}
              label="Link"
              icon={<LinkIcon size={14} />}
            />
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              className="ml-2 rounded-sm border border-gold/50 px-2 py-1 text-xs text-gold hover:bg-gold/10"
            >
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
        </div>

        {preview ? (
          <div className="rounded-sm border border-parchment/20 bg-panel p-4">
            <Markdown>{body}</Markdown>
          </div>
        ) : (
          <textarea
            id="body"
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="w-full rounded-sm border border-parchment/20 bg-ink px-3 py-2 font-mono text-sm text-parchment focus:border-gold focus:outline-none"
          />
        )}
      </div>

      {error && <p className="text-sm text-crest-red">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm border border-parchment/25 px-5 py-2.5 text-sm text-parchment/85 hover:border-gold hover:text-gold disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save draft"}
        </button>
        {id && (
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
            className="rounded-sm bg-crest-red px-5 py-2.5 text-sm font-medium text-white hover:bg-crest-red/90 disabled:opacity-50"
          >
            {pending ? "Publishing…" : "Publish now"}
          </button>
        )}
      </div>
    </form>
  );
}

function ToolbarButton({
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
      className="rounded-sm p-1.5 text-parchment/70 hover:bg-panel hover:text-gold"
    >
      {icon}
    </button>
  );
}