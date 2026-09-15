import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Our Mission — MLA",
  description:
    "The Mentorship and Leadership Academy unites Nigerian higher institutions to advance AI literacy, vibe coding, and cross-campus mentorship.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Header */}
      <div className="border-b border-parchment/10 pb-10">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">
          <span className="inline-block h-2 w-2 rotate-45 bg-gold" aria-hidden />
          Our Mission &amp; Charter
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-parchment md:text-5xl">
          Empowering Nigerian Higher Education through AI Literacy &amp; Collaborative Leadership
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-parchment/80">
          The Mentorship and Leadership Academy (MLA) is a single, unified digital
          academy designed for students, faculty, and mentors across all Nigerian
          universities, polytechnics, and colleges of education.
        </p>
      </div>

      {/* Narrative */}
      <section className="mt-12 space-y-6 text-parchment/75 leading-relaxed">
        <h2 className="font-display text-2xl text-parchment">The Problem We Solve</h2>
        <p>
          Too often, educational initiatives in Nigeria remain locked within isolated
          campuses or trapped in outdated curricula. Students in one state have
          little access to mentors, collaborative projects, or modern technical
          competencies being spearheaded in another.
        </p>
        <p>
          MLA removes these artificial boundaries. By treating institutions as first-class
          data entities rather than siloed silos, a computer science undergraduate in
          Nsukka can learn Vibe Coding alongside an engineering student in Zaria,
          guided by an industry mentor based in Lagos.
        </p>
      </section>

      {/* Core Pillars */}
      <section className="mt-14">
        <h2 className="font-display text-2xl text-parchment">Our Four Academic Pillars</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-md border border-parchment/10 bg-panel p-6">
            <span className="font-mono text-xs text-gold uppercase tracking-wider">Pillar 01</span>
            <h3 className="mt-2 font-display text-xl text-parchment">AI Literacy &amp; Vibe Coding</h3>
            <p className="mt-2 text-sm text-parchment/70">
              Rigorous, accessible courses teaching modern artificial intelligence,
              prompt architecture, and rapid prototyping using LLM-assisted development.
            </p>
          </div>

          <div className="rounded-md border border-parchment/10 bg-panel p-6">
            <span className="font-mono text-xs text-gold uppercase tracking-wider">Pillar 02</span>
            <h3 className="mt-2 font-display text-xl text-parchment">Cross-Campus Mentorship</h3>
            <p className="mt-2 text-sm text-parchment/70">
              Structured 1-to-1 mentorship matching verified through mentor reviews
              and platform governance, fostering genuine cross-institutional exchange.
            </p>
          </div>

          <div className="rounded-md border border-parchment/10 bg-panel p-6">
            <span className="font-mono text-xs text-gold uppercase tracking-wider">Pillar 03</span>
            <h3 className="mt-2 font-display text-xl text-parchment">Protected Digital Resources</h3>
            <p className="mt-2 text-sm text-parchment/70">
              Authoritative ebooks, software toolkits, and curated publications
              distributed with cryptographically verified licenses and personalized watermarking.
            </p>
          </div>

          <div className="rounded-md border border-parchment/10 bg-panel p-6">
            <span className="font-mono text-xs text-gold uppercase tracking-wider">Pillar 04</span>
            <h3 className="mt-2 font-display text-xl text-parchment">Institutional Autonomy</h3>
            <p className="mt-2 text-sm text-parchment/70">
              Institution Admins can approve members, organize local campus workshops,
              and curate recaps while benefiting from national platform-wide reach.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-16 rounded-md border border-gold/30 bg-panel/70 p-8 text-center">
        <h2 className="font-display text-3xl text-parchment">Join the Academy</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-parchment/70">
          Whether you are a student hungry for modern tech skills, an experienced professional
          seeking to mentor the next generation, or a university administrator, MLA welcomes you.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-sm bg-crest-red px-6 py-2.5 text-sm font-medium text-white hover:bg-crest-red/90"
          >
            Create Your Account
          </Link>
          <Link
            href="/institutions"
            className="rounded-sm border border-gold/50 px-6 py-2.5 text-sm font-medium text-gold hover:bg-gold hover:text-ink"
          >
            Explore Active Institutions
          </Link>
        </div>
      </section>
    </div>
  );
}