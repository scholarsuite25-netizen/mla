import { CourseForm } from "@/components/admin/course-form";

export const metadata = { title: "New course — MLA Admin" };

export default function NewCoursePage() {
  return (
    <div>
      <h2 className="font-display text-2xl text-parchment">New course</h2>
      <CourseForm course={null} modules={[]} />
    </div>
  );
}