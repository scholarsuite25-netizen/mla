import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { CourseActions } from "@/components/admin/course-actions";

export const dynamic = "force-dynamic";

type CourseRow = {
  id: string;
  title: string;
  status: string;
  updated_at: string;
  module_count: number;
};

export default async function AdminCoursesPage() {
  const admin = createAdminClient();
  const { data: courses, error } = await admin
    .from("courses")
    .select(
      "id,title,status,updated_at,module_count:course_modules(count)"
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return <p className="text-crest-red">{error.message}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-parchment">Courses</h2>
        <Link
          href="/admin/courses/new"
          className="rounded-sm bg-crest-red px-4 py-2 text-sm font-medium text-white hover:bg-crest-red/90"
        >
          New course
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {(courses as unknown as CourseRow[] | null)?.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between gap-4 rounded-md border border-parchment/10 bg-panel p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-display text-lg text-parchment">
                {course.title}
              </p>
              <p className="mt-1 text-xs text-parchment/50">
                {course.module_count} module{course.module_count === 1 ? "" : "s"} ·{" "}
                <span
                  className={
                    course.status === "published"
                      ? "text-gold"
                      : "text-parchment/40"
                  }
                >
                  {course.status}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/courses/${course.id}/edit`}
                className="rounded-sm border border-parchment/20 px-3 py-1.5 text-xs text-parchment/80 hover:border-gold/60 hover:text-gold"
              >
                Edit
              </Link>
              <CourseActions
                courseId={course.id}
                status={course.status}
              />
            </div>
          </div>
        ))}
        {(!courses || courses.length === 0) && (
          <p className="text-parchment/60">No courses yet. Create your first one.</p>
        )}
      </div>
    </div>
  );
}