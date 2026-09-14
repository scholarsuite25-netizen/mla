"use client";

import { useTransition } from "react";
import { markAllNotificationsReadAction } from "@/app/dashboard/actions";

type Notification = {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const [pending, startTransition] = useTransition();

  if (notifications.length === 0) {
    return (
      <p className="mt-10 text-parchment/60">
        Nothing yet — you&apos;ll see notices here when posts and courses go
        live.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <button
        onClick={() => startTransition(() => markAllNotificationsReadAction())}
        disabled={pending}
        className="mb-4 rounded-sm border border-gold/50 px-3 py-1.5 text-xs text-gold hover:bg-gold/10 disabled:opacity-50"
      >
        {pending ? "Marking…" : "Mark all as read"}
      </button>
      <ul className="space-y-3">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`rounded-md border p-4 ${
              n.is_read ? "border-parchment/10 bg-panel/50" : "border-gold/40 bg-panel"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-parchment/90">{n.message}</p>
              {!n.is_read && (
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-label="Unread" />
              )}
            </div>
            <p className="mt-2 text-xs text-parchment/40">
              {new Date(n.created_at).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}