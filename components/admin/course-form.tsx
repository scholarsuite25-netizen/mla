"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  saveCourseAction,
  saveModuleAction,
  deleteModuleAction,
  moveModuleAction,
  publishCourseAction,
  unpublishCourseAction,
  uploadCourseThumbnailAction,
  deleteCourseAction,
} from "@/app/admin/courses/actions";
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
  Video,
  BookOpen,
  Users,
  CheckSquare,
  Clock,
  Unlock,
  UploadCloud,
  Award,
  Star,
  ExternalLink,
  PlayCircle,
  FileText,
  X,
  Link as LinkIcon,
} from "lucide-react";

export type CourseData = {
  id: string;
  title: string;
  description: string;
  status: string;
  cover_image_url?: string | null;
  category?: string;
  level?: string;
  estimated_duration?: string;
  instructor_name?: string;
  instructor_title?: string;
  certificate_enabled?: boolean;
  featured?: boolean;
};

export type LessonResource = {
  title: string;
  url: string;
};

export type ModuleData = {
  id: string;
  title: string;
  content: string;
  order_index: number;
  lesson_type?: string;
  video_url?: string | null;
  duration_minutes?: number;
  is_free_preview?: boolean;
  resources?: LessonResource[];
};

const CATEGORIES = [
  "Executive Leadership",
  "Mentorship & Fellows",
  "Career Acceleration",
  "Higher Education Governance",
  "AI & Future Systems",
  "Strategic Policy & Ethics",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Executive Masterclass"];

export function CourseForm({
  course,
  modules,
}: {
  course: CourseData | null;
  modules: ModuleData[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [coverUrl, setCoverUrl] = useState(course?.cover_image_url ?? "");
  const [category, setCategory] = useState(course?.category ?? "Executive Leadership");
  const [level, setLevel] = useState(course?.level ?? "Intermediate");
  const [duration, setDuration] = useState(course?.estimated_duration ?? "4 Weeks");
  const [instructorName, setInstructorName] = useState(
    course?.instructor_name ?? "MLA Faculty & Mentors"
  );
  const [instructorTitle, setInstructorTitle] = useState(
    course?.instructor_title ?? "Executive Leadership Fellow"
  );
  const [certificateEnabled, setCertificateEnabled] = useState(
    course?.certificate_enabled ?? true
  );
  const [featured, setFeatured] = useState(course?.featured ?? false);

  const id = course?.id ?? null;
  const isPublished = course?.status === "published";

  async function handleThumbnailUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const res = await uploadCourseThumbnailAction(fd);
      setUploading(false);
      if (res.error) {
        setError(res.error);
      } else if (res.url) {
        setCoverUrl(res.url);
      }
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("cover_image_url", coverUrl);
    fd.append("category", category);
    fd.append("level", level);
    fd.append("estimated_duration", duration);
    fd.append("instructor_name", instructorName);
    fd.append("instructor_title", instructorTitle);
    if (certificateEnabled) fd.append("certificate_enabled", "on");
    if (featured) fd.append("featured", "on");

    startTransition(async () => {
      const result = await saveCourseAction(id, fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 text-xs text-parchment/60 hover:text-gold mb-2 transition"
          >
            <ArrowLeft size={13} />
            <span>Back to Courses</span>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-parchment sm:text-3xl">
              {course ? "Teachable-Grade Curriculum Builder" : "Create New LMS Course"}
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider border ${
                isPublished
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              }`}
            >
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <p className="mt-1 text-xs text-parchment/60">
            Design multi-tier syllabi, video lectures, lesson notes, and student certification.
          </p>
        </div>

        {id && (
          <div className="flex flex-wrap items-center gap-2">
            {isPublished && (
              <Link
                href={`/courses/${id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-parchment hover:border-gold hover:text-gold transition"
              >
                <ExternalLink size={13} />
                <span>Public View</span>
              </Link>
            )}

            {isPublished ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await unpublishCourseAction(id);
                    if (res?.error) setError(res.error);
                    else router.refresh();
                  });
                }}
                className="rounded-xl border border-parchment/20 px-4 py-2 text-xs font-semibold text-parchment/80 hover:border-crest-red hover:text-crest-red disabled:opacity-50 transition"
              >
                Revert to Draft
              </button>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await publishCourseAction(id);
                    if (res?.error) setError(res.error);
                    else router.refresh();
                  });
                }}
                className="rounded-xl bg-gradient-to-r from-crest-red to-amber-700 px-4 py-2 text-xs font-semibold text-white hover:brightness-110 shadow disabled:opacity-50 transition"
              >
                Publish Curriculum
              </button>
            )}

            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm("Permanently delete this entire course and all associated lessons?")) return;
                startTransition(async () => {
                  const res = await deleteCourseAction(id);
                  if (res?.error) setError(res.error);
                  else router.push("/admin/courses");
                });
              }}
              className="rounded-xl border border-crest-red/30 p-2 text-crest-red hover:bg-crest-red/10 transition"
              title="Delete Course"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-crest-red/30 bg-crest-red/10 p-3 text-xs text-crest-red">
          {error}
        </div>
      )}

      {/* Course Overview & Metadata */}
      <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-[#120D09] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-gold" />
            <h3 className="font-display text-lg font-bold text-parchment">
              Course Details &amp; Syllabus Overview
            </h3>
          </div>
          <span className="text-xs text-parchment/40">Step 1: Core Framework</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Title & Description */}
          <div className="space-y-4 lg:col-span-8">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Executive Governance & Systems Architecture for African Leaders"
                className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-3 text-sm font-semibold text-parchment focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                Syllabus Overview &amp; Learning Objectives *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the course curriculum, target scholar profile, core competencies gained, and overarching pedagogical thesis..."
                className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-3 text-xs sm:text-sm leading-relaxed text-parchment focus:border-gold focus:outline-none"
              />
            </div>

            {/* Instructor Details */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                  Instructor / Directorate Name
                </label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  placeholder="e.g. Prof. O. Adebayo & Fellow Board"
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                  Instructor Title / Affiliation
                </label>
                <input
                  type="text"
                  value={instructorTitle}
                  onChange={(e) => setInstructorTitle(e.target.value)}
                  placeholder="e.g. Chair of Academic Governance"
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Taxonomy, Level, Cover & Cert */}
          <div className="space-y-4 lg:col-span-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                Academic Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                  Skill Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                  Est. Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 6 Weeks"
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Course Thumbnail */}
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                Course Thumbnail / Banner
              </label>
              {coverUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverUrl} alt="Thumbnail" className="aspect-[16/9] w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverUrl("")}
                    className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white/80 hover:text-crest-red"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-black/20 p-4 text-center hover:border-gold/40 cursor-pointer transition">
                  <UploadCloud size={20} className="text-gold mb-1" />
                  <span className="text-[11px] font-semibold text-parchment">
                    {uploading ? "Uploading..." : "Upload Thumbnail"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Options Toggles */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={certificateEnabled}
                  onChange={(e) => setCertificateEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black text-gold focus:ring-gold"
                />
                <span className="text-xs text-parchment font-medium flex items-center gap-1.5">
                  <Award size={13} className="text-gold" /> Grant Certificate of Completion
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black text-gold focus:ring-gold"
                />
                <span className="text-xs text-parchment font-medium flex items-center gap-1.5">
                  <Star size={13} className="text-gold" /> Feature on Academy Homepage
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-gradient-to-r from-gold to-amber-500 px-6 py-2.5 text-xs font-bold text-midnight hover:brightness-110 shadow disabled:opacity-50 transition"
          >
            {pending ? "Saving..." : id ? "Save Course Details" : "Create Course & Start Curriculum"}
          </button>
          <span className="text-[11px] text-parchment/40">
            {id ? "Changes saved immediately" : "Creates course record"}
          </span>
        </div>
      </form>

      {/* Curriculum & Lessons Section */}
      {id && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Layers size={20} className="text-gold" />
              <div>
                <h3 className="font-display text-2xl font-bold text-parchment">
                  Curriculum Lessons &amp; Lectures ({modules.length})
                </h3>
                <p className="text-xs text-parchment/60">
                  Teachable-grade syllabus: manage video lectures, readings, free previews, and downloadable resources.
                </p>
              </div>
            </div>
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
  modules: ModuleData[];
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
            if (!window.confirm("Are you sure you want to delete this lesson?")) return;
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
  module: ModuleData;
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
  const [lessonType, setLessonType] = useState(mod.lesson_type ?? "video");
  const [videoUrl, setVideoUrl] = useState(mod.video_url ?? "");
  const [duration, setDuration] = useState(mod.duration_minutes ?? 15);
  const [isFreePreview, setIsFreePreview] = useState(mod.is_free_preview ?? false);
  const [resources, setResources] = useState<LessonResource[]>(mod.resources ?? []);
  const [preview, setPreview] = useState(false);

  // New resource inputs
  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");

  function addResource() {
    if (resTitle.trim() && resUrl.trim()) {
      setResources([...resources, { title: resTitle.trim(), url: resUrl.trim() }]);
      setResTitle("");
      setResUrl("");
    }
  }

  function removeResource(i: number) {
    setResources(resources.filter((_, idx) => idx !== i));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);
    fd.append("lesson_type", lessonType);
    fd.append("video_url", videoUrl);
    fd.append("duration_minutes", String(duration));
    if (isFreePreview) fd.append("is_free_preview", "on");
    fd.append("resources", JSON.stringify(resources));
    onSave(fd);
    setEditing(false);
  }

  const lessonTypeBadge =
    lessonType === "video" ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
        <Video size={11} /> Video Lecture
      </span>
    ) : lessonType === "reading" ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md border border-blue-400/20">
        <BookOpen size={11} /> Executive Reading
      </span>
    ) : lessonType === "workshop" ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md border border-purple-400/20">
        <Users size={11} /> Workshop
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
        <CheckSquare size={11} /> Assignment
      </span>
    );

  if (editing) {
    return (
      <form onSubmit={onSubmit} className="rounded-3xl border border-gold/50 bg-[#16100C] p-6 space-y-5 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/20 font-mono text-xs font-bold text-gold">
              {index < 10 ? `0${index}` : index}
            </span>
            <h4 className="font-display text-base font-bold text-parchment">
              Editing Lesson Curriculum
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-parchment hover:text-gold transition"
            >
              {preview ? <Edit3 size={12} /> : <Eye size={12} />}
              <span>{preview ? "Edit Mode" : "Live Preview"}</span>
            </button>
          </div>
        </div>

        {/* Lesson Title & Type */}
        <div className="grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
              Lesson Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architectural Blueprint for Mentorship Scaling"
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs sm:text-sm font-semibold text-parchment focus:border-gold focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
              Lesson Format
            </label>
            <select
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
            >
              <option value="video">Video Lecture</option>
              <option value="reading">Executive Reading</option>
              <option value="workshop">Interactive Workshop</option>
              <option value="assignment">Assignment / Project</option>
            </select>
          </div>
        </div>

        {/* Video Lecture URL & Duration & Preview */}
        <div className="grid gap-4 sm:grid-cols-12 bg-black/30 p-4 rounded-2xl border border-white/5">
          <div className="sm:col-span-7">
            <label className="mb-1 block text-xs uppercase tracking-widest text-gold font-semibold flex items-center gap-1">
              <Video size={13} /> Video Lecture Stream URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or Vimeo / Loom / MP4"
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2 text-xs text-parchment focus:border-gold focus:outline-none font-mono"
            />
            <p className="text-[10px] text-parchment/40 mt-1">
              Supports YouTube, Vimeo, Loom, Cloudflare Stream, or direct video URLs.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
              Duration (mins)
            </label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2 text-xs text-parchment focus:border-gold focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex items-center pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFreePreview}
                onChange={(e) => setIsFreePreview(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black text-gold focus:ring-gold"
              />
              <div>
                <span className="text-xs text-parchment font-semibold block">
                  Free Preview
                </span>
                <span className="text-[10px] text-parchment/40">
                  Accessible before enrolling
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Video Embed Live Preview */}
        {videoUrl && (
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-gold/80 font-semibold flex items-center gap-1">
              <PlayCircle size={13} /> Video Player Verification
            </span>
            <div className="relative aspect-video max-w-md overflow-hidden rounded-xl border border-white/15 bg-black">
              {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
                <iframe
                  src={
                    videoUrl.includes("watch?v=")
                      ? videoUrl.replace("watch?v=", "embed/")
                      : videoUrl.replace("youtu.be/", "www.youtube.com/embed/")
                  }
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoUrl.includes("vimeo.com") ? (
                <iframe
                  src={videoUrl.replace("vimeo.com/", "player.vimeo.com/video/")}
                  className="h-full w-full"
                  allowFullScreen
                />
              ) : (
                <video src={videoUrl} controls className="h-full w-full object-contain" />
              )}
            </div>
          </div>
        )}

        {/* Lecture Notes / Syllabus Content in Markdown */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs uppercase tracking-widest text-parchment/60 font-semibold">
              Lecture Notes, Transcript &amp; Syllabus Details (Markdown)
            </label>
            <span className="text-[10px] text-parchment/40">GFM enabled</span>
          </div>

          {preview ? (
            <div className="min-h-[200px] rounded-2xl border border-white/10 bg-black/40 p-5 text-xs sm:text-sm">
              <Markdown>{content || "*No lecture notes entered.*"}</Markdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-white/10 bg-[#0E0A08] p-4 font-mono text-xs leading-relaxed text-parchment focus:border-gold focus:outline-none"
              placeholder="Provide comprehensive lecture notes, key takeaways, executive prompts, and case study questions in Markdown..."
            />
          )}
        </div>

        {/* Downloadable Resources Builder */}
        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
              <FileText size={13} /> Downloadable Lesson Resources ({resources.length})
            </span>
            <span className="text-[10px] text-parchment/40">PDFs, Frameworks, Handouts</span>
          </div>

          {resources.length > 0 && (
            <div className="space-y-1.5">
              {resources.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <LinkIcon size={12} className="text-gold shrink-0" />
                    <span className="font-medium text-parchment truncate">{r.title}</span>
                    <span className="text-[10px] text-parchment/40 truncate font-mono">
                      ({r.url})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeResource(i)}
                    className="text-crest-red hover:text-white ml-2"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Resource Name (e.g. Session Slides PDF)"
              value={resTitle}
              onChange={(e) => setResTitle(e.target.value)}
              className="w-full sm:w-1/2 rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
            />
            <input
              type="url"
              placeholder="Download Link URL (https://...)"
              value={resUrl}
              onChange={(e) => setResUrl(e.target.value)}
              className="w-full sm:w-1/2 rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={addResource}
              className="w-full sm:w-auto shrink-0 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold hover:bg-gold/20"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 px-5 py-2.5 text-xs font-bold text-midnight hover:brightness-110 shadow disabled:opacity-50 transition"
          >
            <Check size={14} />
            <span>Save Lesson Changes</span>
          </button>

          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs text-parchment/70 hover:text-parchment"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#120D09] p-4 hover:border-gold/40 hover:bg-[#150F0A] transition-all group">
      <div className="flex items-center gap-4 min-w-0">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-gold group-hover:border-gold/30">
          {index < 10 ? `0${index}` : index}
        </span>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-parchment group-hover:text-gold transition">
              {mod.title}
            </p>
            {lessonTypeBadge}
            {mod.is_free_preview && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <Unlock size={9} /> Free Preview
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-parchment/50">
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-gold/60" /> {mod.duration_minutes ?? 15} mins
            </span>
            {mod.video_url && (
              <span>• Video Lecture Attached</span>
            )}
            {mod.resources && mod.resources.length > 0 && (
              <span>• {mod.resources.length} Handout{mod.resources.length > 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={isFirst || pending}
          onClick={() => onMove("up")}
          title="Move Lesson Up"
          className="rounded-lg p-1.5 text-parchment/60 hover:bg-white/10 hover:text-gold disabled:opacity-20 transition"
        >
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          disabled={isLast || pending}
          onClick={() => onMove("down")}
          title="Move Lesson Down"
          className="rounded-lg p-1.5 text-parchment/60 hover:bg-white/10 hover:text-gold disabled:opacity-20 transition"
        >
          <ChevronDown size={16} />
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-white/10 p-1.5 text-parchment/80 hover:border-gold hover:text-gold transition"
          title="Edit Curriculum Lesson"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-crest-red/30 p-1.5 text-crest-red hover:bg-crest-red hover:text-white transition"
          title="Delete Lesson"
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
  const [lessonType, setLessonType] = useState("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(15);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [isSaving, startTransition] = useTransition();

  function addResource() {
    if (resTitle.trim() && resUrl.trim()) {
      setResources([...resources, { title: resTitle.trim(), url: resUrl.trim() }]);
      setResTitle("");
      setResUrl("");
    }
  }

  function removeResource(i: number) {
    setResources(resources.filter((_, idx) => idx !== i));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;

    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);
    fd.append("lesson_type", lessonType);
    fd.append("video_url", videoUrl);
    fd.append("duration_minutes", String(duration));
    if (isFreePreview) fd.append("is_free_preview", "on");
    fd.append("resources", JSON.stringify(resources));

    startTransition(async () => {
      const res = await saveModuleAction(courseId, null, fd);
      if (res?.error) {
        alert(res.error);
      } else {
        setTitle("");
        setContent("");
        setVideoUrl("");
        setResources([]);
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (open) {
    return (
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border-2 border-dashed border-gold/40 bg-[#16100C] p-6 space-y-4 animate-fadeIn"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="font-display text-sm font-bold text-gold uppercase tracking-wider">
            + New Curriculum Lesson
          </h4>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-parchment/50 hover:text-parchment"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson title (e.g. Systemic Leadership Paradigms)"
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
            >
              <option value="video">Video Lecture</option>
              <option value="reading">Executive Reading</option>
              <option value="workshop">Interactive Workshop</option>
              <option value="assignment">Assignment / Project</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Video URL (YouTube, Vimeo, Loom, MP4)..."
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2 text-xs text-parchment focus:border-gold focus:outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="Mins"
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2 text-xs text-parchment focus:border-gold focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex items-center">
            <label className="flex items-center gap-1.5 text-xs text-parchment cursor-pointer">
              <input
                type="checkbox"
                checked={isFreePreview}
                onChange={(e) => setIsFreePreview(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-gold"
              />
              <span>Free Preview</span>
            </label>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Lecture outline, syllabus notes, or assignment prompt (Markdown enabled)..."
          className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-3 font-mono text-xs text-parchment focus:border-gold focus:outline-none"
        />

        {/* Downloadable Resources Builder */}
        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
              <FileText size={13} /> Downloadable Lesson Resources ({resources.length})
            </span>
            <span className="text-[10px] text-parchment/40">PDFs, Frameworks, Handouts</span>
          </div>

          {resources.length > 0 && (
            <div className="space-y-1.5">
              {resources.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <LinkIcon size={12} className="text-gold shrink-0" />
                    <span className="font-medium text-parchment truncate">{r.title}</span>
                    <span className="text-[10px] text-parchment/40 truncate font-mono">
                      ({r.url})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeResource(i)}
                    className="text-crest-red hover:text-white ml-2"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Resource Name (e.g. Session Slides PDF)"
              value={resTitle}
              onChange={(e) => setResTitle(e.target.value)}
              className="w-full sm:w-1/2 rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
            />
            <input
              type="url"
              placeholder="Download Link URL (https://...)"
              value={resUrl}
              onChange={(e) => setResUrl(e.target.value)}
              className="w-full sm:w-1/2 rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={addResource}
              className="w-full sm:w-auto shrink-0 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold hover:bg-gold/20"
            >
              + Add
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={isSaving || pending}
            className="rounded-xl bg-gold px-4 py-2 text-xs font-bold text-midnight hover:brightness-110 disabled:opacity-50"
          >
            {isSaving ? "Adding..." : "Add Lesson to Syllabus"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-parchment/60 hover:text-parchment"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="w-full rounded-2xl border-2 border-dashed border-white/15 bg-black/20 p-4 text-center text-xs font-semibold text-parchment/60 hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all flex items-center justify-center gap-2"
    >
      <Plus size={16} />
      <span>Add Curriculum Lesson or Video Lecture</span>
    </button>
  );
}