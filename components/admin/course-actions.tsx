"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCourseAction, publishCourseAction } from "@/app/admin/courses/actions";

export function CourseActions({
  courseId,
  status,
}: {
  courseId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      {status === "draft" ? (
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await publishCourseAction(courseId);
              router.refresh();
            })
          }
          className="rounded-sm bg-crest-red px-3 py-1.5 text-xs font-medium text-white hover:bg-crest-red/90 disabled:opacity-50"
        >
          {pending ? "…" : "Publish"}
        </button>
      ) : (
        <span className="text-xs text-gold">Live</span>
      )}
      <button
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Delete this course? This cannot be undone.")) return;
          startTransition(async () => {
            await deleteCourseAction(courseId);
            router.refresh();
          });
        }}
        className="rounded-sm border border-parchment/20 px-3 py-1.5 text-xs text-parchment/70 hover:border-crest-red hover:text-crest-red disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}