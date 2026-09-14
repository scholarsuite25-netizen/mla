import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CoursesCatalogPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id,title,description,updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl text-parchment">Course Catalog</h1>
      <p className="mt-3 max-w-2xl text-parchment/70">
        Free courses to help Nigerian higher-education students learn modern
        skills. Enroll to track your progress.
      </p>

      {!courses || courses.length === 0 ? (
        <p className="mt-10 text-parchment/50">
          No courses are available yet. Check back soon.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group rounded-md border border-parchment/10 bg-panel p-6 transition-colors hover:border-gold/60"
            >
              <p className="font-display text-xl text-parchment group-hover:text-gold">
                {course.title}
              </p>
              <p className="mt-2 line-clamp-3 text-sm text-parchment/60">
                {course.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}