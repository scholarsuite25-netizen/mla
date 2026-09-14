export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rotate-45 bg-gold" aria-hidden />
        <h1 className="font-display text-5xl tracking-tight text-parchment">
          MLA
        </h1>
        <span className="h-3 w-3 rotate-45 bg-gold" aria-hidden />
      </div>
      <p className="max-w-md text-center text-parchment/80">
        Mentorship &amp; Leadership Academy — coming soon. Learn, mentor and
        lead across Nigerian higher institutions.
      </p>
    </main>
  );
}