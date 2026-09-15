import { createAdminClient } from "@/lib/supabase/admin";
import { CoursesManager, CourseListItem } from "@/components/admin/courses-manager";

export const dynamic = "force-dynamic";

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

export default async function AdminCoursesPage() {
  const admin = createAdminClient();
  const { data: rawCourses, error } = await admin
    .from("courses")
    .select("id,title,status,updated_at,module_count:course_modules(count)")
    .order("updated_at", { ascending: false });

  if (error) {
    return <p className="text-crest-red">{error.message}</p>;
  }

  const courses: CourseListItem[] = (rawCourses || []).map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    updated_at: c.updated_at,
    module_count: getModuleCount(c.module_count),
  }));

  return <CoursesManager initialCourses={courses} />;
}