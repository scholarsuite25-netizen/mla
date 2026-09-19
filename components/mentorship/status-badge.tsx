export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string }> = {
    pending: { text: "Pending Review", cls: "border-parchment/30 text-parchment/70 bg-white/5" },
    accepted: { text: "Accepted (Pending Admin Approval)", cls: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
    rejected: { text: "Declined", cls: "border-rose-500/30 text-rose-400 bg-rose-500/10" },
    cancelled: { text: "Withdrawn", cls: "border-stone-500/40 text-stone-400 bg-stone-500/10" },
    approved: { text: "Active Match (Approved)", cls: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-semibold" },
    ended: { text: "Ended", cls: "border-white/20 text-parchment/50 bg-white/5" },
  };
  const { text, cls } = map[status] ?? { text: status, cls: "border-parchment/20 text-parchment/60" };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cls}`}
    >
      {text}
    </span>
  );
}