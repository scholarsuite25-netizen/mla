import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: course, error } = await admin
    .from("courses")
    .select(
      "id,title,description,status,cover_image_url,category,level,estimated_duration,instructor_name,instructor_title,certificate_enabled,featured"
    )
    .eq("id", id)
    .single();
  if (error || !course) notFound();

  const { data: modules } = await admin
    .from("course_modules")
    .select(
      "id,title,content,order_index,lesson_type,video_url,duration_minutes,is_free_preview,resources"
    )
    .eq("course_id", id)
    .order("order_index", { ascending: true });

  return (
    <div>
      <CourseForm course={course} modules={modules ?? []} />
    </div>
  );
}