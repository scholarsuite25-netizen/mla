"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveCourseAction,
  saveModuleAction,
  deleteModuleAction,
  moveModuleAction,
  publishCourseAction,
  unpublishCourseAction,
} from "@/app/admin/courses/actions";
import { inputClass } from "@/components/login-form";
import { Markdown } from "@/components/markdown";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Pencil,
  Check,
  Eye,
  Edit3,
  Layers,
  ArrowLeft,
} from "lucide-react";

type Module = { id: string; title: string; content: string; order_index: number };

export function CourseForm({
  course,
  modules,
}: {
  course: { id: string; title: string; description: string; status: string } | null;
  modules: Module[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const id = course?.id ?? null;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveCourseAction(id, new FormData(e.currentTarget));
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <button
            type="button"
            onClick={() => router.push("/admin/courses")}
            className="inline-flex items-center gap-1.5 text-xs text-parchment/60 hover:text-gold mb-2"
          >
            <ArrowLeft size={13} />
            <span>Back to Courses</span>
          </button>
          <h2 className="font-display text-2xl font-bold text-parchment sm:text-3xl">
            {course ? "Course Curriculum Builder" : "Create New Course"}
          </h2>
          <p className="mt-1 text-xs text-parchment/60">
            Define course metadata, syllabus overview, and build structured learning modules.
          </p>
        </div>

        {id && (
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                course?.status === "published"
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-white/10 bg-white/5 text-parchment/50"
              }`}
            >
              {course?.status}
            </span>
            {course?.status === "draft" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await publishCourseAction(id);
                    if (res?.error) alert(res.error);
                    else router.refresh();
                  });
                }}
                className="rounded-xl bg-gradient-to-r from-crest-red to-amber-700 px-4 py-2 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"
              >
                Publish Course
              </button>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await unpublishCourseAction(id);
                    if (res?.error) alert(res.error);
                    else router.refresh();
                  });
                }}
                className="rounded-xl border border-parchment/20 px-4 py-2 text-xs font-semibold text-parchment/80 hover:border-crest-red hover:text-crest-red disabled:opacity-50"
              >
                Revert to Draft
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Course Details Form */}
      <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-[#120D09] p-6 space-y-5">
        <h3 className="font-display text-lg font-bold text-parchment">Course Details</h3>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
            Course Title
          </span>
          <input
            name="title"
            defaultValue={course?.title}
            placeholder="e.g. Applied AI Literacy & Vibe Coding"
            required
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
            Course Syllabus Overview &amp; Learning Objectives
          </span>
          <textarea
            name="description"
            defaultValue={course?.description}
            rows={4}
            placeholder="Describe what learners will accomplish in this course..."
            required
            className={inputClass}
          />
        </label>

        {error && <p className="text-sm text-crest-red">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl border border-gold/40 bg-gold/10 px-5 py-2.5 text-xs font-semibold text-gold hover:bg-gold/20 transition-all disabled:opacity-50"
          >
            {pending ? "Saving..." : id ? "Save Changes" : "Create Course & Add Modules"}
          </button>
        </div>
      </form>

      {/* Modules Curriculum Section */}
      {id && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-gold" />
              <h3 className="font-display text-xl font-bold text-parchment">
                Course Modules ({modules.length})
              </h3>
            </div>
            <p className="text-xs text-parchment/50">
              Use arrows to rearrange syllabus order.
            </p>
          </div>

          <ModuleManager courseId={id} modules={modules} />
        </div>
      )}
    </div>
  );
}

function ModuleManager({
  courseId,
  modules,
}: {
  courseId: string;
  modules: Module[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleModule(
    action: (formData: FormData) => Promise<{ error?: string }>,
    formData: FormData
  ) {
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {modules.map((mod, idx) => (
        <ModuleRow
          key={mod.id}
          index={idx + 1}
          module={mod}
          isFirst={idx === 0}
          isLast={idx === modules.length - 1}
          onSave={(fd) =>
            handleModule((fd2) => saveModuleAction(courseId, mod.id, fd2), fd)
          }
          onDelete={() => {
            if (!window.confirm("Delete this module?")) return;
            startTransition(async () => {
              await deleteModuleAction(courseId, mod.id);
              router.refresh();
            });
          }}
          onMove={(dir) => {
            startTransition(async () => {
              await moveModuleAction(courseId, mod.id, dir);
              router.refresh();
            });
          }}
          pending={pending}
        />
      ))}

      <AddModuleRow courseId={courseId} pending={pending} />
    </div>
  );
}

function ModuleRow({
  index,
  module: mod,
  isFirst,
  isLast,
  onSave,
  onDelete,
  onMove,
  pending,
}: {
  index: number;
  module: Module;
  isFirst: boolean;
  isLast: boolean;
  onSave: (fd: FormData) => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
  pending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(mod.title);
  const [content, setContent] = useState(mod.content);
  const [preview, setPreview] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);
    onSave(fd);
    setEditing(false);
  }

  if (editing) {
    return (
      <form onSubmit={onSubmit} className="rounded-2xl border border-gold/40 bg-[#15100C] p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-gold font-bold">
            Editing Module {index < 10 ? `0${index}` : index}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-parchment hover:text-gold"
            >
              {preview ? <Edit3 size={12} /> : <Eye size={12} />}
              <span>{preview ? "Edit" : "Preview"}</span>
            </button>
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
          placeholder="Module title (e.g. Prompt Architecture & Workflows)"
        />

        {preview ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 min-h-[200px] text-xs">
            <Markdown>{content || "*No content provided yet.*"}</Markdown>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-xs leading-relaxed text-parchment focus:border-gold focus:outline-none"
            placeholder="Write module lesson content, video embeds, and resource links in Markdown..."
          />
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-black hover:bg-gold-light disabled:opacity-50"
          >
            <Check size={13} />
            <span>Save Module</span>
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-parchment/70 hover:text-parchment"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#120D09] p-4 hover:border-gold/30 transition-all">
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono font-bold text-gold">
          {index < 10 ? `0${index}` : index}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-parchment">{mod.title}</p>
          <p className="mt-0.5 truncate text-[11px] text-parchment/50">
            {mod.content ? `${mod.content.length} characters of learning content` : "Empty module"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={isFirst || pending}
          onClick={() => onMove("up")}
          title="Move Up"
          className="rounded-lg p-1.5 text-parchment/60 hover:bg-white/10 hover:text-gold disabled:opacity-20 transition-colors"
        >
          <ChevronUp size={15} />
        </button>
        <button
          type="button"
          disabled={isLast || pending}
          onClick={() => onMove("down")}
          title="Move Down"
          className="rounded-lg p-1.5 text-parchment/60 hover:bg-white/10 hover:text-gold disabled:opacity-20 transition-colors"
        >
          <ChevronDown size={15} />
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setEditing(true)}
          title="Edit Module"
          className="rounded-lg p-1.5 text-parchment/60 hover:bg-white/10 hover:text-gold disabled:opacity-20 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onDelete}
          title="Delete Module"
          className="rounded-lg p-1.5 text-parchment/60 hover:bg-white/10 hover:text-crest-red disabled:opacity-20 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function AddModuleRow({
  courseId,
  pending,
}: {
  courseId: string;
  pending: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [localPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);

    startTransition(async () => {
      const res = await saveModuleAction(courseId, null, fd);
      if (res?.error) {
        alert(res.error);
      } else {
        setTitle("");
        setContent("");
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 p-4 text-xs font-semibold text-parchment/70 hover:border-gold hover:text-gold hover:bg-gold/5 transition-all"
      >
        <Plus size={15} />
        <span>Add Next Module</span>
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-gold/30 bg-[#140F0B] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm font-bold text-parchment">New Course Module</h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-parchment/50 hover:text-parchment"
        >
          Cancel
        </button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Module title (e.g. Cognitive Prompt Engineering)"
        className={inputClass}
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        placeholder="Lesson content, code examples, or lecture notes in markdown..."
        className="w-full rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-xs leading-relaxed text-parchment focus:border-gold focus:outline-none"
      />

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending || localPending}
          className="rounded-xl bg-gold px-5 py-2 text-xs font-semibold text-black hover:bg-gold-light disabled:opacity-50"
        >
          {localPending ? "Adding..." : "Add Module to Curriculum"}
        </button>
      </div>
    </form>
  );
}