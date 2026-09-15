"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Heading4,
  Quote,
  Code,
  Table as TableIcon,
  Minus,
  Eye,
  Edit3,
  Columns,
  UploadCloud,
  X,
  Image as ImageIcon,
  ExternalLink,
  AlignLeft,
  AlignRight,
  AlignCenter,
  CheckCircle2,
  AlertCircle,
  Hash,
  FolderTree,
  Search,
  Globe,
  Star,
} from "lucide-react";
import {
  savePostAction,
  publishPostAction,
  unpublishPostAction,
  uploadCoverAction,
  deletePostAction,
} from "@/app/admin/blog/actions";
import { Markdown } from "@/components/markdown";

type Post = {
  id: string;
  title: string;
  slug: string;
  body: string;
  cover_image_url: string | null;
  status: string;
  category?: string;
  tags?: string[];
  excerpt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  allow_comments?: boolean;
  featured?: boolean;
  published_at?: string | null;
};

const DEFAULT_CATEGORIES = [
  "Leadership & Governance",
  "Mentorship & Fellows",
  "Career Acceleration",
  "Higher Education",
  "Research & Policy",
  "Academy Dispatch",
];

const SUGGESTED_TAGS = [
  "Leadership",
  "Mentorship",
  "Fellowship",
  "Higher Ed",
  "Career Strategy",
  "AI & Future of Work",
  "Ethics",
  "Public Policy",
  "Scholarship",
];

export function PostForm({ post }: { post: Post | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [cover, setCover] = useState(post?.cover_image_url ?? "");
  const [category, setCategory] = useState(post?.category ?? "Leadership & Governance");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seo_description ?? "");
  const [allowComments, setAllowComments] = useState(post?.allow_comments ?? true);
  const [featured, setFeatured] = useState(post?.featured ?? false);

  const [activeSidebarTab, setActiveSidebarTab] = useState<"post" | "seo">("post");
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("edit");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  // Image Inserter Modal
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const [imgAlign, setImgAlign] = useState<"left" | "right" | "center">("left");
  const [imgUploading, setImgUploading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const id = post?.id ?? null;
  const isPublished = post?.status === "published";

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
    if (title && !slug) setSlug(slugify(title));
  }

  function wrap(before: string, after = before) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const next = value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e);
    setBody(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = s + before.length;
    });
  }

  function insertAtCursor(snippet: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const next = value.slice(0, s) + snippet + value.slice(e);
    setBody(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = s + snippet.length;
    });
  }

  // Cover image upload
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

  // Embedded image upload inside modal
  async function onEmbeddedImageUpload(file: File | null) {
    if (!file) return;
    setImgUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const res = await uploadCoverAction(fd);
      setImgUploading(false);
      if (res.error) {
        setError(res.error);
      } else if (res.url) {
        setImgUrl(res.url);
      }
    });
  }

  function handleInsertImage() {
    if (!imgUrl) return;
    const alignTag = imgAlign === "center" ? "" : `|${imgAlign}`;
    const altText = (imgAlt.trim() || "Article image") + alignTag;
    const snippet = `\n\n![${altText}](${imgUrl})\n\n`;
    insertAtCursor(snippet);
    setImageModalOpen(false);
    setImgUrl("");
    setImgAlt("");
  }

  // Tags management
  function addTag(tagToAdd: string) {
    const clean = tagToAdd.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  // Save / Publish / Delete
  function submit(action: "draft" | "publish" | "unpublish" | "delete") {
    return (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setError(null);

      const finalCategory = isCustomCat && customCategory.trim() ? customCategory.trim() : category;

      const fd = new FormData();
      fd.append("title", title);
      fd.append("slug", slug || slugify(title));
      fd.append("body", body);
      fd.append("cover_image_url", cover);
      fd.append("category", finalCategory);
      fd.append("tags", JSON.stringify(tags));
      fd.append("excerpt", excerpt);
      fd.append("seo_title", seoTitle);
      fd.append("seo_description", seoDescription);
      if (allowComments) fd.append("allow_comments", "on");
      if (featured) fd.append("featured", "on");

      startTransition(async () => {
        if (action === "delete") {
          if (!id) return;
          if (!confirm("Are you sure you want to permanently delete this post?")) return;
          const res = await deletePostAction(id);
          if (res?.error) setError(res.error);
          else {
            router.push("/admin/blog");
            router.refresh();
          }
          return;
        }

        const result = await savePostAction(id, fd);
        if (result?.error) {
          setError(result.error);
          return;
        }

        if (action === "publish" && id) {
          const res = await publishPostAction(id);
          if (res?.error) setError(res.error);
          else {
            router.push("/admin/blog");
            router.refresh();
          }
        } else if (action === "unpublish" && id) {
          const res = await unpublishPostAction(id);
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

  // SEO Snippet Preview Values
  const effectiveSeoTitle = seoTitle.trim() || (title ? `${title} — Mentorship & Leadership Academy` : "Post Title — MLA");
  const effectiveSeoDesc = seoDescription.trim() || excerpt.trim() || (body.slice(0, 155) || "Read the latest executive leadership, mentorship insights, and academic dispatches from MLA.");

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-parchment/60 hover:border-gold hover:text-gold transition-colors"
          >
            ← Back to Posts
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                isPublished
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-emerald-400" : "bg-amber-400"}`} />
              {isPublished ? "Published" : "Draft"}
            </span>
            {featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 border border-gold/40 px-2 py-0.5 text-[10px] font-semibold text-gold">
                <Star size={10} /> Featured
              </span>
            )}
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-1">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "edit" ? "bg-white/10 text-gold" : "text-parchment/60 hover:text-parchment"
              }`}
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "split" ? "bg-white/10 text-gold" : "text-parchment/60 hover:text-parchment"
              }`}
            >
              <Columns size={13} />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "preview" ? "bg-white/10 text-gold" : "text-parchment/60 hover:text-parchment"
              }`}
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
          </div>

          {id && slug && (
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-parchment/80 hover:text-gold hover:border-gold/30 transition-all"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">View Public</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => submit("draft")()}
            disabled={pending}
            className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-parchment hover:bg-white/10 disabled:opacity-50 transition-all"
          >
            {pending ? "Saving..." : "Save Draft"}
          </button>

          {isPublished ? (
            <button
              type="button"
              onClick={() => submit("publish")()}
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-gold to-amber-500 px-4 py-1.5 text-xs font-semibold text-midnight hover:brightness-110 shadow disabled:opacity-50 transition-all"
            >
              {pending ? "Updating..." : "Update Post"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => submit("publish")()}
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-crest-red to-amber-700 px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110 shadow disabled:opacity-50 transition-all"
            >
              {pending ? "Publishing..." : "Publish Now"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-crest-red/30 bg-crest-red/10 p-3 text-xs text-crest-red">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Canvas: Title, Gutenberg Toolbar, Body Editor & Live Preview */}
        <div className="space-y-4 lg:col-span-8">
          {/* Post Title & Permalink */}
          <div className="rounded-2xl border border-white/10 bg-[#120D09] p-5 shadow-xl space-y-3">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleAutoSlug}
                placeholder="Add Post Title..."
                className="w-full bg-transparent font-display text-2xl font-bold text-parchment placeholder-parchment/30 focus:outline-none sm:text-3xl"
              />
            </div>

            {/* Permalink bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-parchment/50 border-t border-white/5 pt-3">
              <span className="font-semibold text-parchment/40">Permalink:</span>
              <span className="text-gold/80 font-mono text-[11px]">
                https://mla.org.ng/blog/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="slug-url"
                className="rounded-lg border border-white/10 bg-black/50 px-2 py-0.5 font-mono text-[11px] text-parchment focus:border-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSlug(slugify(title))}
                className="text-[11px] text-gold hover:underline"
              >
                Auto-generate
              </button>
            </div>
          </div>

          {/* WordPress Formatting Toolbar */}
          <div className="sticky top-2 z-10 flex flex-wrap items-center gap-1 rounded-2xl border border-white/10 bg-[#140E0A]/95 p-2 backdrop-blur-xl shadow-lg">
            <button
              type="button"
              onClick={() => wrap("**")}
              title="Bold"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => wrap("*")}
              title="Italic"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => wrap("~~")}
              title="Strikethrough"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <Strikethrough size={15} />
            </button>

            <span className="h-4 w-px bg-white/10 mx-1" />

            <button
              type="button"
              onClick={() => wrap("\n## ", "\n")}
              title="Heading 2"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => wrap("\n### ", "\n")}
              title="Heading 3"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <Heading3 size={15} />
            </button>
            <button
              type="button"
              onClick={() => wrap("\n#### ", "\n")}
              title="Heading 4"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <Heading4 size={15} />
            </button>

            <span className="h-4 w-px bg-white/10 mx-1" />

            <button
              type="button"
              onClick={() => wrap("\n> ", "\n")}
              title="Blockquote"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <Quote size={15} />
            </button>
            <button
              type="button"
              onClick={() => wrap("\n```\n", "\n```\n")}
              title="Code Block"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <Code size={15} />
            </button>
            <button
              type="button"
              onClick={() => wrap("- ")}
              title="Bullet List"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => wrap("1. ")}
              title="Numbered List"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <ListOrdered size={15} />
            </button>
            <button
              type="button"
              onClick={() => wrap("\n---\n")}
              title="Divider"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <Minus size={15} />
            </button>

            <span className="h-4 w-px bg-white/10 mx-1" />

            {/* Link Inserter */}
            <button
              type="button"
              onClick={() => wrap("[link text](", ")")}
              title="Insert Link"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <LinkIcon size={15} />
            </button>

            {/* Table Inserter */}
            <button
              type="button"
              onClick={() =>
                insertAtCursor(
                  "\n| Pillar | Focus | Outcome |\n|---|---|---|\n| Mentorship | Executive Pairings | High Performance |\n| Leadership | Systems Architecture | Transformative |\n\n"
                )
              }
              title="Insert Table"
              className="rounded-lg p-1.5 text-parchment/70 hover:bg-white/10 hover:text-gold transition"
            >
              <TableIcon size={15} />
            </button>

            {/* Image Inserter Modal Trigger */}
            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="ml-auto flex items-center gap-1.5 rounded-xl bg-gold/15 border border-gold/40 px-2.5 py-1 text-xs font-semibold text-gold hover:bg-gold/25 transition"
            >
              <ImageIcon size={14} />
              <span>Insert Image</span>
            </button>
          </div>

          {/* Editor & Preview Workspace */}
          <div className="rounded-2xl border border-white/10 bg-[#0E0A08] p-4 shadow-inner">
            {viewMode === "edit" && (
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={22}
                placeholder="Write your article in Markdown or rich text... Use the 'Insert Image' tool above to embed photos with left or right text-wrapping!"
                className="w-full resize-y bg-transparent font-mono text-sm leading-relaxed text-parchment/90 placeholder-parchment/30 focus:outline-none"
              />
            )}

            {viewMode === "split" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={22}
                  className="w-full resize-y border-r border-white/10 bg-transparent pr-4 font-mono text-xs leading-relaxed text-parchment/90 placeholder-parchment/30 focus:outline-none"
                />
                <div className="max-h-[550px] overflow-y-auto pl-2">
                  <div className="text-[11px] uppercase tracking-widest text-gold/60 mb-2 font-semibold">
                    Live Render Preview
                  </div>
                  <Markdown>{body || "*Write content to preview rendered output...*"}</Markdown>
                </div>
              </div>
            )}

            {viewMode === "preview" && (
              <div className="min-h-[400px] p-4">
                <div className="text-xs uppercase tracking-widest text-gold mb-3 font-semibold">
                  Article Preview
                </div>
                <Markdown>{body || "*No content entered yet.*"}</Markdown>
              </div>
            )}
          </div>

          {/* Word Count & Stats Bar */}
          <div className="flex items-center justify-between px-2 text-xs text-parchment/50">
            <div className="flex items-center gap-4">
              <span>
                Words: <strong className="text-parchment">{wordCount}</strong>
              </span>
              <span>
                Est. Read Time: <strong className="text-parchment">{readTime} min</strong>
              </span>
            </div>
            <div className="text-[11px] text-parchment/40">
              Markdown &amp; GFM enabled
            </div>
          </div>
        </div>

        {/* Right Sidebar: WordPress Document Settings & Yoast-Style SEO */}
        <div className="space-y-5 lg:col-span-4">
          {/* Sidebar Tab Selector */}
          <div className="flex rounded-2xl border border-white/10 bg-[#120D09] p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveSidebarTab("post")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 font-medium transition ${
                activeSidebarTab === "post"
                  ? "bg-gold text-midnight font-bold shadow"
                  : "text-parchment/60 hover:text-parchment"
              }`}
            >
              <FolderTree size={14} />
              <span>Post Settings</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSidebarTab("seo")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 font-medium transition ${
                activeSidebarTab === "seo"
                  ? "bg-gold text-midnight font-bold shadow"
                  : "text-parchment/60 hover:text-parchment"
              }`}
            >
              <Globe size={14} />
              <span>SEO &amp; Snippet</span>
            </button>
          </div>

          {/* TAB 1: Post Settings (Category, Tags, Featured Image, Excerpt, Discussion) */}
          {activeSidebarTab === "post" && (
            <div className="space-y-5">
              {/* Category Box */}
              <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
                    <FolderTree size={14} /> Category
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomCat(!isCustomCat)}
                    className="text-[11px] text-gold hover:underline"
                  >
                    {isCustomCat ? "Choose standard" : "+ Add new"}
                  </button>
                </div>

                {!isCustomCat ? (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Enter new category name..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                    />
                    <p className="text-[10px] text-parchment/40">
                      Creates a new category archive on the public blog.
                    </p>
                  </div>
                )}
              </div>

              {/* Tags Manager */}
              <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
                    <Hash size={14} /> Tags
                  </span>
                  <span className="text-[11px] text-parchment/40">{tags.length} selected</span>
                </div>

                {/* Tag Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add tag and press Enter..."
                    className="flex-1 rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-parchment/80 hover:text-gold hover:border-gold/30"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Tags Chips */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-lg bg-gold/10 border border-gold/30 px-2 py-1 text-xs text-gold font-medium"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          className="text-gold/60 hover:text-gold"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Tags */}
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-parchment/40 block mb-1.5">
                    Suggested tags:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_TAGS.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => addTag(st)}
                        disabled={tags.includes(st)}
                        className={`rounded-md px-2 py-0.5 text-[10px] transition ${
                          tags.includes(st)
                            ? "bg-white/5 text-parchment/30 cursor-not-allowed"
                            : "bg-white/5 text-parchment/70 hover:text-gold hover:bg-white/10"
                        }`}
                      >
                        +{st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured Image Box */}
              <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-3">
                <span className="text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
                  <ImageIcon size={14} /> Featured Image
                </span>

                {cover ? (
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt="Cover"
                      className="aspect-[16/9] w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCover("")}
                      className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white/80 hover:text-crest-red transition"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-black/20 p-6 text-center hover:border-gold/50 cursor-pointer transition">
                    <UploadCloud size={24} className="text-gold mb-2" />
                    <span className="text-xs font-semibold text-parchment">
                      {uploading ? "Uploading..." : "Upload Featured Image"}
                    </span>
                    <span className="text-[10px] text-parchment/40 mt-1">
                      PNG, JPG, WebP up to 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onCoverChange(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </label>
                )}

                <div className="pt-2">
                  <input
                    type="url"
                    value={cover}
                    onChange={(e) => setCover(e.target.value)}
                    placeholder="Or paste external image URL..."
                    className="w-full rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Excerpt Box */}
              <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gold font-bold">
                    Excerpt / Teaser
                  </span>
                  <span className="text-[10px] text-parchment/40">
                    {excerpt.length} chars
                  </span>
                </div>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  placeholder="Write a compelling 1-2 sentence summary for article cards and social previews..."
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                />
              </div>

              {/* Discussion & Flags */}
              <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-3">
                <span className="text-xs uppercase tracking-wider text-gold font-bold block">
                  Discussion &amp; Presentation
                </span>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-black/40 text-gold focus:ring-gold"
                  />
                  <div>
                    <span className="text-xs text-parchment font-medium block">
                      Allow comments
                    </span>
                    <span className="text-[10px] text-parchment/40">
                      Displays a WordPress comment thread at the bottom of the article.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-white/5">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-black/40 text-gold focus:ring-gold"
                  />
                  <div>
                    <span className="text-xs text-parchment font-medium block">
                      Featured Hero Article
                    </span>
                    <span className="text-[10px] text-parchment/40">
                      Showcases this post in the high-impact editorial hero spot on /blog.
                    </span>
                  </div>
                </label>
              </div>

              {/* Danger Zone: Delete */}
              {id && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => submit("delete")()}
                    className="w-full rounded-xl border border-crest-red/30 bg-crest-red/10 px-4 py-2.5 text-xs font-semibold text-crest-red hover:bg-crest-red hover:text-white transition-all"
                  >
                    Move to Trash / Delete Post
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SEO & Google Search Snippet (Yoast/RankMath style) */}
          {activeSidebarTab === "seo" && (
            <div className="space-y-5">
              {/* Google SERP Snippet Preview Box */}
              <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-3">
                <span className="text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
                  <Search size={14} /> Google Search Preview
                </span>

                <div className="rounded-xl border border-white/15 bg-[#1F1B18] p-3.5 space-y-1.5 shadow-md">
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                    <Globe size={12} />
                    <span className="truncate">https://mla.org.ng › blog › {slug || "sample-slug"}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#8AB4F8] hover:underline cursor-pointer leading-snug line-clamp-2">
                    {effectiveSeoTitle}
                  </h4>
                  <p className="text-xs text-parchment/70 line-clamp-2 leading-relaxed">
                    {effectiveSeoDesc}
                  </p>
                </div>
                <p className="text-[10px] text-parchment/40">
                  How this post will appear on Google and search engines when indexed.
                </p>
              </div>

              {/* Custom SEO Title */}
              <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gold font-bold">
                    SEO Meta Title
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      seoTitle.length >= 40 && seoTitle.length <= 60
                        ? "text-emerald-400 font-bold"
                        : "text-parchment/40"
                    }`}
                  >
                    {seoTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title ? `${title} — MLA` : "Custom search engine title..."}
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                />
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full transition-all ${
                      seoTitle.length === 0
                        ? "w-0"
                        : seoTitle.length < 40
                        ? "w-1/2 bg-amber-400"
                        : seoTitle.length <= 60
                        ? "w-full bg-emerald-400"
                        : "w-full bg-crest-red"
                    }`}
                  />
                </div>
              </div>

              {/* Custom SEO Meta Description */}
              <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gold font-bold">
                    SEO Meta Description
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      seoDescription.length >= 120 && seoDescription.length <= 160
                        ? "text-emerald-400 font-bold"
                        : "text-parchment/40"
                    }`}
                  >
                    {seoDescription.length}/160
                  </span>
                </div>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                  placeholder={excerpt || "Enter a custom meta description for search engines..."}
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                />
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full transition-all ${
                      seoDescription.length === 0
                        ? "w-0"
                        : seoDescription.length < 120
                        ? "w-1/2 bg-amber-400"
                        : seoDescription.length <= 160
                        ? "w-full bg-emerald-400"
                        : "w-full bg-crest-red"
                    }`}
                  />
                </div>
              </div>

              {/* Content SEO Health Checklist */}
              <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-3">
                <span className="text-xs uppercase tracking-wider text-gold font-bold block">
                  SEO Audit &amp; Readability
                </span>

                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    {title.length >= 10 ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-400 shrink-0" />
                    )}
                    <span className={title.length >= 10 ? "text-parchment/90" : "text-parchment/50"}>
                      Post title length ({title.length} chars)
                    </span>
                  </li>

                  <li className="flex items-center gap-2">
                    {cover ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-400 shrink-0" />
                    )}
                    <span className={cover ? "text-parchment/90" : "text-parchment/50"}>
                      Featured image for Social &amp; Google Cards
                    </span>
                  </li>

                  <li className="flex items-center gap-2">
                    {wordCount >= 300 ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-400 shrink-0" />
                    )}
                    <span className={wordCount >= 300 ? "text-parchment/90" : "text-parchment/50"}>
                      Content length ({wordCount}/300 minimum words)
                    </span>
                  </li>

                  <li className="flex items-center gap-2">
                    {tags.length > 0 ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-400 shrink-0" />
                    )}
                    <span className={tags.length > 0 ? "text-parchment/90" : "text-parchment/50"}>
                      Topic tags assigned ({tags.length} tags)
                    </span>
                  </li>

                  <li className="flex items-center gap-2">
                    {excerpt ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-400 shrink-0" />
                    )}
                    <span className={excerpt ? "text-parchment/90" : "text-parchment/50"}>
                      Summary excerpt provided
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Insert Image with Text-Wrap Alignment */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#140E0A] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-gold" />
                <h3 className="font-display text-lg font-bold text-parchment">
                  Insert Image with Content Wrap
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="text-parchment/50 hover:text-parchment"
              >
                <X size={18} />
              </button>
            </div>

            {/* Alignment Options */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gold font-bold block">
                Text-Wrapping Alignment
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setImgAlign("left")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs transition ${
                    imgAlign === "left"
                      ? "border-gold bg-gold/15 text-gold font-semibold shadow"
                      : "border-white/10 bg-black/30 text-parchment/60 hover:text-parchment"
                  }`}
                >
                  <AlignLeft size={18} />
                  <span>Float Left</span>
                  <span className="text-[10px] text-parchment/40">Text wraps right</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImgAlign("right")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs transition ${
                    imgAlign === "right"
                      ? "border-gold bg-gold/15 text-gold font-semibold shadow"
                      : "border-white/10 bg-black/30 text-parchment/60 hover:text-parchment"
                  }`}
                >
                  <AlignRight size={18} />
                  <span>Float Right</span>
                  <span className="text-[10px] text-parchment/40">Text wraps left</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImgAlign("center")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs transition ${
                    imgAlign === "center"
                      ? "border-gold bg-gold/15 text-gold font-semibold shadow"
                      : "border-white/10 bg-black/30 text-parchment/60 hover:text-parchment"
                  }`}
                >
                  <AlignCenter size={18} />
                  <span>Full Width</span>
                  <span className="text-[10px] text-parchment/40">Standard break</span>
                </button>
              </div>
            </div>

            {/* Image Source: Upload or URL */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-gold font-bold block">
                Image Source
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
                />
                <label className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-parchment hover:border-gold hover:text-gold cursor-pointer transition">
                  <span>{imgUploading ? "Uploading..." : "Upload File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onEmbeddedImageUpload(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
              </div>

              {imgUrl && (
                <div className="max-h-32 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt="Preview" className="h-32 w-full object-cover" />
                </div>
              )}
            </div>

            {/* Caption & Alt Text */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-gold font-bold block">
                Caption &amp; Alt Text
              </label>
              <input
                type="text"
                placeholder="e.g. Inaugural Scholar Cohort in London"
                value={imgAlt}
                onChange={(e) => setImgAlt(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
              />
              <p className="text-[10px] text-parchment/40">
                Shown below the image and used for accessibility.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-parchment/70 hover:text-parchment"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={!imgUrl}
                className="rounded-xl bg-gradient-to-r from-gold to-amber-500 px-5 py-2 text-xs font-bold text-midnight hover:brightness-110 disabled:opacity-40 transition"
              >
                Insert into Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}