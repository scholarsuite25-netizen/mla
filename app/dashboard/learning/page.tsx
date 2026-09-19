import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type EnrollmentCourse = {
  id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  category: string | null;
  module_count: { count: number }[] | { count: number } | number | null;
};

function getModuleCount(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0]?.count === "number") {
    return raw[0].count;
  }
  if (raw && typeof raw === "object" && "count" in raw && typeof (raw as { count: unknown }).count === "number") {
    return (raw as { count: number }).count;
  }
  return 0;
}

export default async function LearningPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select(
      "course_id, enrolled_at, courses(id, title, description, cover_image_url, category, module_count:course_modules(count))"
    )
    .eq("profile_id", user.id)
    .order("enrolled_at", { ascending: false });

  const doneByCourse = new Map<string, number>();
  if (enrollments?.length) {
    const { data: progress } = await supabase
      .from("course_module_progress")
      .select("course_module_id, course_modules(course_id)")
      .eq("profile_id", user.id);
    for (const p of progress ?? []) {
      const cmRaw = p.course_modules as unknown;
      const courseId = Array.isArray(cmRaw)
        ? (cmRaw[0] as { course_id?: string } | undefined)?.course_id
        : (cmRaw as { course_id?: string } | null)?.course_id;
      if (courseId) doneByCourse.set(courseId, (doneByCourse.get(courseId) ?? 0) + 1);
    }
  }

  const totalCourses = enrollments?.length || 0;
  const completedCourses = enrollments?.filter((enr) => {
    const course = enr.courses as unknown as EnrollmentCourse | null;
    if (!course) return false;
    const total = getModuleCount(course.module_count);
    const done = doneByCourse.get(course.id) ?? 0;
    return total > 0 && done === total;
  }).length || 0;

  const totalModules = enrollments?.reduce((acc, enr) => {
    const course = enr.courses as unknown as EnrollmentCourse | null;
    return acc + (course ? getModuleCount(course.module_count) : 0);
  }, 0) || 0;

  const totalDoneModules = Array.from(doneByCourse.values()).reduce((a, b) => a + b, 0);
  const overallProgress = totalModules > 0 ? Math.round((totalDoneModules / totalModules) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl text-parchment">My Learning</h1>
        <p className="text-parchment/60">
          Your enrolled courses and progress across the academy curriculum.
        </p>
      </div>

      {/* Real progress metrics */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-parchment/10 bg-panel p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold text-parchment">
              {totalCourses}
            </p>
          </div>
          <p className="mt-3 text-sm text-parchment/60">Courses enrolled</p>
        </div>

        <div className="rounded-2xl border border-parchment/10 bg-panel p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold text-parchment">
              {completedCourses}
              <span className="ml-1 text-base font-medium text-parchment/60">/ {totalCourses}</span>
            </p>
          </div>
          <p className="mt-3 text-sm text-parchment/60">Courses completed</p>
        </div>

        <div className="rounded-2xl border border-parchment/10 bg-panel p-6">
          <p className="text-sm text-parchment/60">Overall progress</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="font-display text-2xl font-bold text-parchment">{overallProgress}%</p>
            <p className="text-xs text-parchment/50">
              {totalDoneModules} / {totalModules} modules
            </p>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Enrolled courses */}
      <div className="mt-12 flex items-center justify-between">
        <h2 className="font-display text-2xl text-parchment">Your Courses</h2>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-light"
        >
          Browse catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-parchment/20 p-12 text-center">
          <p className="text-parchment/60">You have not enrolled in any courses yet.</p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-md bg-crest-red px-6 py-2 font-medium text-white hover:bg-crest-red/90"
          >
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enr) => {
            const course = enr.courses as unknown as EnrollmentCourse | null;
            if (!course) return null;
            const total = getModuleCount(course.module_count);
            const done = doneByCourse.get(course.id) ?? 0;
            const pct = total ? Math.round((done / total) * 100) : 0;

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-parchment/10 bg-panel transition-all hover:-translate-y-0.5 hover:border-gold/50"
              >
                <div className="relative aspect-video w-full bg-ink">
                  {course.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gold/5">
                      <BookOpen className="h-12 w-12 text-gold/40" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-black/40">
                    <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {course.category && (
                    <span className="mb-2 w-fit rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold">
                      {course.category}
                    </span>
                  )}
                  <h3 className="font-display text-lg font-semibold text-parchment line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm text-parchment/60 line-clamp-2">
                    {course.description}
                  </p>
                  <p className="mt-auto pt-3 text-xs text-parchment/50">
                    {total > 0 ? `${done} of ${total} modules complete` : "No modules yet"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}