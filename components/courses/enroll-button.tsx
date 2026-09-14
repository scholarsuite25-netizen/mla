"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { enrollAction } from "@/app/courses/actions";

export function EnrollButton({ courseId }: { courseId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await enrollAction(courseId);
          if (res?.error) alert(res.error);
          router.refresh();
        })
      }
      className="rounded-sm bg-crest-red px-6 py-2.5 text-sm font-medium text-white hover:bg-crest-red/90 disabled:opacity-60"
    >
      {pending ? "Enrolling…" : "Enroll to track progress"}
    </button>
  );
}