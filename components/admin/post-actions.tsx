"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePostAction, publishPostAction, unpublishPostAction } from "@/app/admin/blog/actions";

export function PublishButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await publishPostAction(postId);
          router.refresh();
        })
      }
      className="rounded-lg bg-[#00D2FF] px-3.5 py-1.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
    >
      {pending ? "…" : "Publish"}
    </button>
  );
}

export function UnpublishButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await unpublishPostAction(postId);
          router.refresh();
        })
      }
      className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-all disabled:opacity-50 cursor-pointer"
    >
      {pending ? "…" : "Unpublish"}
    </button>
  );
}

export function DeleteButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this post? This cannot be undone.")) return;
        startTransition(async () => {
          await deletePostAction(postId);
          router.refresh();
        });
      }}
      className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50/50 transition-all disabled:opacity-50 cursor-pointer"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}