import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Markdown } from "@/components/markdown";
import { EnrollButton } from "@/components/courses/enroll-button";
import { ModuleCompleteButton } from "@/components/courses/module-complete";

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
    .select("id,title,description,status")
    .eq("id", courseId)
    .maybeSingle();
  if (!course || course.status !== "published") notFound();

  const { data: modules } = await supabase
    .from("course_modules")
    .select("id,title,content,order_index")
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
      completedModuleIds = new Set(progress?.map((p) => String(p.course_module_id)) ?? []);
    }
  }

  const done = completedModuleIds.size;
  const total = modules?.length ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs uppercase tracking-widest text-gold">Course</p>
      <h1 className="mt-2 font-display text-4xl text-parchment">{course.title}</h1>
      <p className="mt-4 text-parchment/70">{course.description}</p>

      {enrolled ? (
        <div className="mt-6 rounded-md border border-gold/40 bg-panel p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-parchment">{done} of {total} modules complete</p>
            <p className="text-sm font-medium text-gold">{pct}%</p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink">
            <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : (
        <div className="mt-6">
          {user ? (
            <EnrollButton courseId={course.id} />
          ) : (
            <Link
              href="/register"
              className="inline-block rounded-sm bg-crest-red px-6 py-2.5 text-sm font-medium text-white hover:bg-crest-red/90"
            >
              Create a free account to enroll
            </Link>
          )}
        </div>
      )}

      <div className="mt-10 space-y-6">
        {modules?.length ? (
          modules.map((mod, i) => {
            const modDone = completedModuleIds.has(mod.id);
            return (
              <article
                key={mod.id}
                className="rounded-md border border-parchment/10 bg-panel p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl text-parchment">
                    <span className="mr-2 text-xs text-gold">Module {i + 1}</span>
                    {mod.title}
                  </h2>
                  {enrolled && (
                    <ModuleCompleteButton
                      courseId={course.id}
                      moduleId={mod.id}
                      completed={modDone}
                    />
                  )}
                </div>
                <div className="mt-4">
                  <Markdown>{mod.content}</Markdown>
                </div>
              </article>
            );
          })
        ) : (
          <p className="text-parchment/50">This course has no modules yet.</p>
        )}
      </div>
    </div>
  );
}