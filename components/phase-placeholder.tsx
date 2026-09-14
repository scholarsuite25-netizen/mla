import Link from "next/link";

export function PhasePlaceholder({
  title,
  description,
  planned,
}: {
  title: string;
  description: string;
  planned: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Phase roadmap</p>
      <h1 className="mt-4 font-display text-4xl text-parchment">{title}</h1>
      <p className="mt-4 text-parchment/70">{description}</p>
      <p className="mt-8 rounded-sm border border-parchment/10 bg-panel px-4 py-3 text-sm text-parchment/60">
        Planned: <span className="text-gold">{planned}</span>
      </p>
      <Link href="/" className="mt-8 inline-block text-sm text-gold hover:underline">
        ← Back home
      </Link>
    </div>
  );
}