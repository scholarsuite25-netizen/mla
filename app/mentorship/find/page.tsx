import { PhasePlaceholder } from "@/components/phase-placeholder";

export const metadata = { title: "Find a Mentor — MLA" };

export default function FindMentorPage() {
  return (
    <PhasePlaceholder
      title="Find a Mentor"
      description="Browse mentors across institutions and send a matching request."
      planned="Phase 3 — mentor directory, requests, and Super Admin approval."
    />
  );
}