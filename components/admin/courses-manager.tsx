"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, ExternalLink, BookOpen, Layers } from "lucide-react";
import { CourseActions } from "@/components/admin/course-actions";

export interface CourseListItem {
  id: string;
  title: string;
  status: string;
  updated_at: string;
  module_count: number;
}

export function CoursesManager({ initialCourses }: { initialCourses: CourseListItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const filteredCourses = initialCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const publishedCount = initialCourses.filter((c) => c.status === "published").length;
  const draftCount = initialCourses.filter((c) => c.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-parchment sm:text-3xl">Courses &amp; LMS</h2>
          <p className="mt-1 text-xs text-parchment/60">
            Teachable-grade curriculum builder: manage syllabi, lessons, video lectures, and publishing.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-crest-red to-amber-700 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Course</span>
        </Link>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#120D09] p-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            All ({initialCourses.length})
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === "published"
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === "draft"
                ? "bg-gold/20 text-gold border border-gold/40"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-parchment placeholder:text-parchment/40 focus:border-gold/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#140F0B] p-5 shadow-md hover:border-gold/30 transition-all"
          >
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    course.status === "published"
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-white/10 bg-white/5 text-parchment/50"
                  }`}
                >
                  {course.status}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-parchment/70 font-medium">
                  <Layers size={11} className="text-gold" />
                  {course.module_count} module{course.module_count === 1 ? "" : "s"}
                </span>
              </div>

              <h3 className="font-display text-base sm:text-lg font-bold text-parchment truncate">
                {course.title}
              </h3>

              <div className="flex items-center gap-4 text-[11px] text-parchment/50">
                <span>Last updated: {new Date(course.updated_at).toLocaleDateString()}</span>
                {course.status === "published" && (
                  <Link
                    href={`/courses/${course.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-gold hover:underline"
                  >
                    <ExternalLink size={11} />
                    <span>View as Student</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
              <Link
                href={`/admin/courses/${course.id}/edit`}
                className="rounded-lg border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-parchment hover:border-gold/60 hover:text-gold transition-colors"
              >
                Curriculum Builder
              </Link>
              <CourseActions courseId={course.id} status={course.status} />
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-panel p-12 text-center">
            <BookOpen size={28} className="mx-auto text-parchment/30 mb-2" />
            <p className="text-sm text-parchment/60">
              {search ? "No courses match your search query." : "No courses created yet. Build your first course."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
