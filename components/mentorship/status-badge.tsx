export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string }> = {
    pending: { text: "Pending mentor", cls: "border-parchment/30 text-parchment/70" },
    accepted: { text: "Accepted — pending approval", cls: "border-gold/50 text-gold" },
    rejected: { text: "Declined", cls: "border-parchment/20 text-parchment/40" },
    approved: { text: "Approved", cls: "border-gold text-gold" },
  };
  const { text, cls } = map[status] ?? { text: status, cls: "" };
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-xs ${cls}`}
    >
      {text}
    </span>
  );
}