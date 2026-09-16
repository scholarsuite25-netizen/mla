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
          if (res?.error) {
            if (res.error.includes("sign in")) {
              router.push(`/login?next=/courses/${courseId}`);
              return;
            }
            alert(res.error);
            return;
          }
          router.refresh();
        })
      }
      className="w-full rounded-xl bg-gradient-to-r from-crest-red to-amber-700 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-60 transition"
    >
      {pending ? "Enrolling…" : "Enroll to track progress"}
    </button>
  );
}