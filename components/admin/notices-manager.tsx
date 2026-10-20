"use client";

import { useState, useTransition } from "react";
import {
  Bell,
  Plus,
  Pin,
  Trash2,
  Edit3,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
} from "lucide-react";
import { saveNoticeAction, deleteNoticeAction } from "@/app/admin/notices/actions";

export type NoticeItem = {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: "general" | "academic" | "membership" | "urgent" | "event";
  is_pinned: boolean;
  is_published: boolean;
  published_at: string;
  created_at: string;
};

export function NoticesManager({ initialNotices }: { initialNotices: NoticeItem[] }) {
  const [notices, setNotices] = useState(initialNotices);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);

  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"general" | "academic" | "membership" | "urgent" | "event">("general");
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  function openCreate() {
    setEditingNotice(null);
    setTitle("");
    setContent("");
    setCategory("general");
    setIsPinned(false);
    setIsPublished(true);
    setMsg(null);
    setModalOpen(true);
  }

  function openEdit(notice: NoticeItem) {
    setEditingNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setCategory(notice.category);
    setIsPinned(notice.is_pinned);
    setIsPublished(notice.is_published);
    setMsg(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);
    fd.append("category", category);
    fd.append("is_pinned", String(isPinned));
    fd.append("is_published", String(isPublished));

    startTransition(async () => {
      const res = await saveNoticeAction(editingNotice ? editingNotice.id : null, fd);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        setMsg({ type: "success", text: "Notice saved successfully!" });
        setTimeout(() => {
          setModalOpen(false);
          window.location.reload();
        }, 800);
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    startTransition(async () => {
      const res = await deleteNoticeAction(id);
      if (res.error) {
        alert(res.error);
      } else {
        setNotices((prev) => prev.filter((n) => n.id !== id));
      }
    });
  }

  const filtered = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || n.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-parchment flex items-center gap-2.5">
            <Bell className="text-gold" size={28} />
            <span>Notice Board &amp; Announcements</span>
          </h1>
          <p className="text-xs sm:text-sm text-parchment/60 mt-1">
            Issue and broadcast official notices, urgent campus updates, and membership bulletins.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-dark to-gold px-5 py-2.5 text-xs font-bold text-ink shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] transition cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Issue New Notice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#120D09] border border-white/10 p-4 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["all", "urgent", "academic", "membership", "general", "event"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold capitalize transition whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? "bg-gold text-ink"
                  : "bg-white/5 text-parchment/60 hover:text-parchment"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filtered.map((notice) => (
          <div
            key={notice.id}
            className={`rounded-2xl border p-5 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
              notice.is_pinned
                ? "border-gold/40 bg-gold/5"
                : "border-white/10 bg-[#120D09] hover:border-white/20"
            }`}
          >
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {notice.is_pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 text-gold border border-gold/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    <Pin size={10} /> Pinned
                  </span>
                )}
                <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-parchment/70 capitalize">
                  {notice.category}
                </span>
                <span className="text-[11px] text-parchment/40">
                  {new Date(notice.created_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-parchment">
                {notice.title}
              </h3>
              <p className="text-xs text-parchment/70 line-clamp-2 leading-relaxed">
                {notice.content}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => openEdit(notice)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-parchment/70 hover:border-gold/40 hover:text-gold transition cursor-pointer"
                title="Edit notice"
              >
                <Edit3 size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(notice.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-parchment/70 hover:border-crest-red/40 hover:text-crest-red transition cursor-pointer"
                title="Delete notice"
              >
                <Trash2 size={14} />
              </button>
              <a
                href={`/notices/${notice.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-parchment/70 hover:border-white/30 hover:text-parchment transition"
                title="View public notice"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-parchment/40 border border-dashed border-white/10 rounded-2xl">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notices found.</p>
          </div>
        )}
      </div>

      {/* Modal for Creating / Editing Notice */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-3xl border border-gold/30 bg-[#120D09] p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-parchment/40 hover:text-parchment cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-xl font-bold text-parchment mb-4">
              {editingNotice ? "Edit Notice" : "Issue New Notice"}
            </h2>

            {msg && (
              <div
                className={`mb-4 rounded-xl p-3 text-xs flex items-center gap-2 ${
                  msg.type === "error"
                    ? "bg-crest-red/10 border border-crest-red/30 text-crest-red"
                    : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                }`}
              >
                {msg.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold tracking-widest text-parchment/60 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for 2026 Maiden Registry Discourse"
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] px-4 py-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-widest text-parchment/60 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoticeItem["category"])}
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
                >
                  <option value="general">General Notice</option>
                  <option value="academic">Academic &amp; Research</option>
                  <option value="membership">Membership &amp; Privileges</option>
                  <option value="urgent">Urgent Announcement</option>
                  <option value="event">Upcoming Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-widest text-parchment/60 mb-1">
                  Notice Content *
                </label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the full announcement text..."
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-3 text-xs text-parchment focus:border-gold focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-parchment/80 select-none">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-[#0E0A08] text-gold accent-gold"
                  />
                  <span>Pin to Top of Notice Board</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-parchment/80 select-none">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-[#0E0A08] text-gold accent-gold"
                  />
                  <span>Publish Immediately</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full px-5 py-2 text-xs font-semibold text-parchment/60 hover:text-parchment cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-gradient-to-r from-gold-dark to-gold px-6 py-2.5 text-xs font-bold text-ink shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {pending ? "Saving..." : editingNotice ? "Update Notice" : "Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
