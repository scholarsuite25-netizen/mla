"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePostAction, publishPostAction } from "@/app/admin/blog/actions";

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
      className="rounded-sm bg-crest-red px-3 py-1.5 text-xs font-medium text-white hover:bg-crest-red/90 disabled:opacity-50"
    >
      {pending ? "…" : "Publish"}
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
      className="rounded-sm border border-parchment/20 px-3 py-1.5 text-xs text-parchment/70 hover:border-crest-red hover:text-crest-red disabled:opacity-50"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}