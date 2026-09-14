import { PhasePlaceholder } from "@/components/phase-placeholder";

export const metadata = { title: "Courses — MLA" };

export default function CoursesPage() {
  return (
    <PhasePlaceholder
      title="Course Catalog"
      description="AI Literacy and Vibe Coding modules with ordered lessons and progress tracking."
      planned="Phase 2 — course CMS, modules, and member progress."
    />
  );
}