"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveCourseAction,
  saveModuleAction,
  deleteModuleAction,
  moveModuleAction,
} from "@/app/admin/courses/actions";
import { inputClass } from "@/components/login-form";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Pencil,
  Check,
  Loader2,
} from "lucide-react";

type Module = { id: string; title: string; content: string; order_index: number };

export function CourseForm({
  course,
  modules,
}: {
  course: { id: string; title: string; description: string; status: string } | null;
  modules: Module[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const id = course?.id ?? null;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveCourseAction(id, new FormData(e.currentTarget));
      if (result?.error) setError(result.error);
      // saveCourseAction redirects to edit page on success
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Title
        </span>
        <input
          name="title"
          defaultValue={course?.title}
          required
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-parchment/60">
          Description
        </span>
        <textarea
          name="description"
          defaultValue={course?.description}
          rows={4}
          required
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-crest-red">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-sm border border-parchment/25 px-5 py-2.5 text-sm text-parchment/85 hover:border-gold hover:text-gold disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save draft"}
      </button>

      {id && (
        <>
          <div className="mt-6 flex items-center gap-3 border-t border-parchment/10 pt-4">
            <h3 className="font-display text-xl text-parchment">Modules</h3>
          </div>
          <ModuleManager courseId={id} modules={modules} />
        </>
      )}
    </form>
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
  module: mod,
  isFirst,
  isLast,
  onSave,
  onDelete,
  onMove,
  pending,
}: {
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
      <form onSubmit={onSubmit} className="rounded-md border border-gold/40 bg-panel p-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
          placeholder="Module title"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full rounded-sm border border-parchment/20 bg-ink px-3 py-2 font-mono text-sm text-parchment focus:border-gold focus:outline-none"
          placeholder="Module content (markdown)"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-sm bg-crest-red px-4 py-1.5 text-sm text-white hover:bg-crest-red/90 disabled:opacity-50"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-sm border border-parchment/20 px-3 py-1.5 text-xs text-parchment/70 hover:border-parchment/40"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-parchment/10 bg-panel p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-parchment">{mod.title}</p>
        <p className="mt-0.5 truncate text-xs text-parchment/50">
          {mod.content.length} chars
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          disabled={isFirst || pending}
          onClick={() => onMove("up")}
          className="rounded-sm p-1.5 text-parchment/60 hover:bg-panel hover:text-gold disabled:opacity-30"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          disabled={isLast || pending}
          onClick={() => onMove("down")}
          className="rounded-sm p-1.5 text-parchment/60 hover:bg-panel hover:text-gold disabled:opacity-30"
        >
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setEditing(true)}
          className="rounded-sm p-1.5 text-parchment/60 hover:bg-panel hover:text-gold disabled:opacity-30"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onDelete}
          className="rounded-sm p-1.5 text-parchment/60 hover:bg-panel hover:text-crest-red disabled:opacity-30"
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
  const [addPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);
    startTransition(async () => {
      const result = await saveModuleAction(courseId, null, fd);
      if (result?.error) {
        alert(result.error);
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
        disabled={pending}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-dashed border-parchment/20 px-4 py-3 text-sm text-parchment/60 hover:border-gold/50 hover:text-gold disabled:opacity-50"
      >
        <Plus size={16} /> Add module
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-gold/40 bg-panel p-4 space-y-3"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className={inputClass}
        placeholder="Module title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="w-full rounded-sm border border-parchment/20 bg-ink px-3 py-2 font-mono text-sm text-parchment focus:border-gold focus:outline-none"
        placeholder="Module content (markdown)"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={addPending}
          className="rounded-sm bg-crest-red px-4 py-1.5 text-sm text-white hover:bg-crest-red/90 disabled:opacity-50"
        >
          {addPending ? <Loader2 size={14} className="animate-spin" /> : "Save module"}
        </button>
        <button
          type="button"
          disabled={addPending}
          onClick={() => setOpen(false)}
          className="rounded-sm border border-parchment/20 px-3 py-1.5 text-xs text-parchment/70 hover:border-parchment/40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}