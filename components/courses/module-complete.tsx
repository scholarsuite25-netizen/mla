"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleModuleAction } from "@/app/courses/actions";
import { Check } from "lucide-react";

export function ModuleCompleteButton({
  courseId,
  moduleId,
  completed,
}: {
  courseId: string;
  moduleId: string;
  completed: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await toggleModuleAction(courseId, moduleId, !completed);
          if (res?.error) alert(res.error);
          router.refresh();
        })
      }
      className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs disabled:opacity-50 ${
        completed
          ? "border-gold/60 text-gold"
          : "border-parchment/20 text-parchment/70 hover:border-gold hover:text-gold"
      }`}
    >
      <Check size={13} strokeWidth={3} />
      {completed ? "Completed" : "Mark complete"}
    </button>
  );
}