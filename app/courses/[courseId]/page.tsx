import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/components/markdown";
import { EnrollButton } from "@/components/courses/enroll-button";
import { ModuleCompleteButton } from "@/components/courses/module-complete";
import {
  BookOpen,
  Clock,
  Award,
  Video,
  FileText,
  Unlock,
  Lock,
  CheckCircle2,
  Users,
  ChevronRight,
  Download,
  CheckSquare,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select(
      "id,title,description,status,cover_image_url,category,level,estimated_duration,instructor_name,instructor_title,certificate_enabled,featured"
    )
    .eq("id", courseId)
    .maybeSingle();

  if (!course || course.status !== "published") notFound();

  const { data: modules } = await supabase
    .from("course_modules")
    .select(
      "id,title,content,order_index,lesson_type,video_url,duration_minutes,is_free_preview,resources"
    )
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let enrolled = false;
  let completedModuleIds = new Set<string>();

  if (user) {
    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", course.id)
      .eq("profile_id", user.id)
      .maybeSingle();

    enrolled = !!enrollment;

    if (enrolled && modules?.length) {
      const { data: progress } = await supabase
        .from("course_module_progress")
        .select("course_module_id")
        .eq("profile_id", user.id)
        .in(
          "course_module_id",
          modules.map((m) => m.id)
        );

      completedModuleIds = new Set(
        progress?.map((p) => String(p.course_module_id)) ?? []
      );
    }
  }

  const done = completedModuleIds.size;
  const total = modules?.length ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const totalDuration = (modules || []).reduce(
    (acc, m) => acc + (m.duration_minutes || 15),
    0
  );

  return (
    <div className="min-h-screen bg-[#0E0A08] text-parchment selection:bg-gold/30 selection:text-white">
      {/* Course Hero Banner */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#18110B] to-[#0E0A08] py-12 sm:py-16">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-parchment/50">
            <Link href="/" className="hover:text-gold transition">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link href="/courses" className="hover:text-gold transition">
              Curriculum
            </Link>
            <ChevronRight size={12} />
            <span className="text-gold/80">{course.category || "Executive Leadership"}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-12 items-center">
            {/* Left Hero Details */}
            <div className="space-y-4 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-0.5 text-xs font-bold text-gold">
                  {course.category || "Leadership"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-parchment/70 font-medium">
                  {course.level || "Intermediate"}
                </span>
                {course.certificate_enabled && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                    <Award size={12} /> Certificate Track
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl font-bold leading-tight text-parchment sm:text-4xl lg:text-5xl">
                {course.title}
              </h1>

              <p className="text-sm leading-relaxed text-parchment/70 sm:text-base">
                {course.description}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-parchment/60 pt-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gold" />
                  <span>{course.estimated_duration || "4 Weeks"} ({totalDuration} mins instruction)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <BookOpen size={14} className="text-gold" />
                  <span>{total} Curriculum Modules</span>
                </div>
              </div>

              {/* Instructor Box */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 border border-gold/30 text-gold font-display font-bold">
                  M
                </div>
                <div>
                  <span className="text-xs font-semibold text-parchment block">
                    {course.instructor_name || "MLA Faculty & Mentors"}
                  </span>
                  <span className="text-[11px] text-parchment/50">
                    {course.instructor_title || "Executive Leadership Fellow"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Card / Thumbnail & Action */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-white/15 bg-[#140E0A] p-6 shadow-2xl space-y-6">
                {course.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.cover_image_url}
                    alt={course.title}
                    className="aspect-video w-full rounded-2xl object-cover border border-white/10 shadow-md"
                  />
                ) : (
                  <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-[#2D1F13] to-[#120D09] flex items-center justify-center border border-white/10">
                    <BookOpen size={40} className="text-gold/40" />
                  </div>
                )}

                {/* Enrollment Card State */}
                {enrolled ? (
                  <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-parchment">
                        Learning Progress
                      </span>
                      <span className="text-xs font-bold text-gold">{pct}%</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-black/60">
                      <div
                        className="h-full bg-gradient-to-r from-gold to-amber-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <p className="text-xs text-parchment/70">
                      {done} of {total} curriculum modules completed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user ? (
                      <div className="w-full">
                        <EnrollButton courseId={course.id} />
                      </div>
                    ) : (
                      <Link
                        href="/register"
                        className="block w-full text-center rounded-xl bg-gradient-to-r from-crest-red to-amber-700 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110 transition"
                      >
                        Create Account to Enroll Free
                      </Link>
                    )}
                    <p className="text-center text-[11px] text-parchment/40">
                      Includes lifetime syllabus access &amp; completion certification.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Syllabus & Classroom Modules */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-parchment sm:text-3xl">
              Course Syllabus &amp; Video Modules
            </h2>
            <p className="text-xs text-parchment/60 mt-0.5">
              Work through the structured curriculum in sequential order.
            </p>
          </div>
          <span className="text-xs text-gold font-mono font-semibold">
            {total} Lessons
          </span>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          {modules && modules.length > 0 ? (
            modules.map((mod, i) => {
              const modDone = completedModuleIds.has(mod.id);
              const canAccess = enrolled || mod.is_free_preview;

              return (
                <article
                  key={mod.id}
                  className={`overflow-hidden rounded-3xl border transition-all ${
                    modDone
                      ? "border-emerald-500/30 bg-[#121611]/80"
                      : "border-white/10 bg-[#140E0A]/90 hover:border-gold/30"
                  }`}
                >
                  {/* Module Header */}
                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                            modDone
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-white/5 text-gold border border-white/10"
                          }`}
                        >
                          {modDone ? (
                            <CheckCircle2 size={16} />
                          ) : i + 1 < 10 ? (
                            `0${i + 1}`
                          ) : (
                            i + 1
                          )}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gold/80">
                              Module {i + 1}
                            </span>
                            {mod.lesson_type === "video" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                <Video size={10} /> Video Lecture
                              </span>
                            ) : mod.lesson_type === "reading" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                                <BookOpen size={10} /> Executive Reading
                              </span>
                            ) : mod.lesson_type === "workshop" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">
                                <Users size={10} /> Workshop
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                                <CheckSquare size={10} /> Assignment
                              </span>
                            )}

                            {mod.is_free_preview && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                                <Unlock size={9} /> Free Preview
                              </span>
                            )}
                          </div>

                          <h3 className="font-display text-lg sm:text-xl font-bold text-parchment mt-0.5">
                            {mod.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-xs text-parchment/50 flex items-center gap-1">
                          <Clock size={12} className="text-gold/60" />
                          {mod.duration_minutes || 15} mins
                        </span>

                        {enrolled && (
                          <ModuleCompleteButton
                            courseId={course.id}
                            moduleId={mod.id}
                            completed={modDone}
                          />
                        )}
                      </div>
                    </div>

                    {/* Video Player (If lesson has video and student has access) */}
                    {canAccess && mod.video_url && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-white/15 bg-black shadow-xl">
                        <div className="relative aspect-video w-full">
                          {mod.video_url.includes("youtube.com") ||
                          mod.video_url.includes("youtu.be") ? (
                            <iframe
                              src={
                                mod.video_url.includes("watch?v=")
                                  ? mod.video_url.replace("watch?v=", "embed/")
                                  : mod.video_url.replace("youtu.be/", "www.youtube.com/embed/")
                              }
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : mod.video_url.includes("vimeo.com") ? (
                            <iframe
                              src={mod.video_url.replace(
                                "vimeo.com/",
                                "player.vimeo.com/video/"
                              )}
                              className="h-full w-full"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={mod.video_url}
                              controls
                              className="h-full w-full object-contain"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Lesson Syllabus Content */}
                    {canAccess ? (
                      mod.content && (
                        <div className="mt-4 border-t border-white/5 pt-4 text-xs sm:text-sm leading-relaxed text-parchment/85">
                          <Markdown>{mod.content}</Markdown>
                        </div>
                      )
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center text-xs text-parchment/50 flex items-center justify-center gap-2">
                        <Lock size={14} className="text-gold" />
                        <span>
                          Enroll in this course to unlock this lesson&apos;s full lecture and curriculum notes.
                        </span>
                      </div>
                    )}

                    {/* Downloadable Handouts / Resources */}
                    {canAccess &&
                      mod.resources &&
                      (mod.resources as { title: string; url: string }[]).length > 0 && (
                        <div className="mt-4 border-t border-white/5 pt-3 space-y-2">
                          <span className="text-[11px] uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
                            <FileText size={12} /> Downloadable Materials:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(mod.resources as { title: string; url: string }[]).map(
                              (res, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-parchment hover:border-gold hover:text-gold transition"
                                >
                                  <Download size={12} className="text-gold" />
                                  <span>{res.title}</span>
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#120D09] p-12 text-center text-xs text-parchment/50">
              No modules published for this curriculum yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}