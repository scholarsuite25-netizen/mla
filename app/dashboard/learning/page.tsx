import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EnrollmentCourse = {
  id: string;
  title: string;
  description: string;
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
      "course_id, enrolled_at, courses(id, title, description, module_count:course_modules(count))"
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
      const courseRef = p.course_modules as unknown as
        | { course_id: string }[]
        | null;
      const courseId = courseRef?.[0]?.course_id ?? null;
      if (courseId) doneByCourse.set(courseId, (doneByCourse.get(courseId) ?? 0) + 1);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl text-parchment">My Learning</h1>

      {!enrollments || enrollments.length === 0 ? (
        <p className="mt-8 text-parchment/60">
          You have not enrolled in any courses yet.{" "}
          <Link href="/courses" className="text-gold hover:underline">
            Browse the catalog →
          </Link>
        </p>
      ) : (
        <div className="mt-8 space-y-4">
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
                className="block rounded-md border border-parchment/10 bg-panel p-5 transition-colors hover:border-gold/60"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-display text-lg text-parchment">{course.title}</p>
                  <p className="shrink-0 text-sm font-medium text-gold">{pct}%</p>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-parchment/60">
                  {course.description}
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink">
                  <div
                    className="h-full bg-gold transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-parchment/50">
                  {done} of {total} modules complete
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}