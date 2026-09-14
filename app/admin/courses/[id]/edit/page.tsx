import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";

export const dynamic = "force-dynamic";

type Module = {
  id: string;
  title: string;
  content: string;
  order_index: number;
};

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: course, error } = await admin
    .from("courses")
    .select("id,title,description,status")
    .eq("id", id)
    .single();
  if (error || !course) notFound();

  const { data: modules } = await admin
    .from("course_modules")
    .select("id,title,content,order_index")
    .eq("course_id", id)
    .order("order_index", { ascending: true });

  return (
    <div>
      <h2 className="font-display text-2xl text-parchment">Edit course</h2>
      <CourseForm
        course={{ id: course.id, title: course.title, description: course.description, status: course.status }}
        modules={(modules as Module[] | null) ?? []}
      />
    </div>
  );
}