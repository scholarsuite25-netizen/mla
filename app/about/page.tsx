import Link from "next/link";
import type { Metadata } from "next";
import { Briefcase, GraduationCap, Rocket, Zap, Building, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About Our Mission — MLA Leadership Academy",
  description:
    "The Mentorship and Leadership Academy unites working professionals, fresh graduates, entrepreneurs, job seekers, and campus scholars to advance AI literacy and career leadership.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="border-b border-parchment/10 pb-10">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold font-semibold">
          <span className="inline-block h-2 w-2 rotate-45 bg-gold" aria-hidden />
          Our Mission &amp; Charter
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-parchment md:text-5xl font-bold">
          Empowering Professionals, Graduates, Founders &amp; Scholars through AI &amp; Mentorship
        </h1>
        <p className="mt-6 text-base sm:text-lg leading-relaxed text-parchment/80">
          The Mentorship &amp; Leadership Academy (MLA) is Nigeria&apos;s unified capability engine.
          We provide practical, modular AI literacy, hands-on vibe coding, and verified 1-on-1 mentorship
          tailored for the working class, fresh graduates, job seekers, entrepreneurs, and campus learners.
        </p>
      </div>

      {/* Narrative */}
      <section className="mt-12 space-y-6 text-parchment/75 leading-relaxed text-sm sm:text-base">
        <h2 className="font-display text-2xl text-parchment font-bold">The Challenge We Solve</h2>
        <p>
          Too often, high-impact career guidance, modern technical competencies, and executive mentorship
          are locked behind exclusive corporate networks or siloed within a handful of elite institutions.
          Working professionals struggle to find flexible upskilling in AI; fresh graduates find themselves
          unprepared for the modern tech stack; and self-employed founders lack the technical tools to scale.
        </p>
        <p>
          MLA dismantles these artificial walls. We treat career development as a lifelong continuum.
          A corporate banker in Lagos can learn agentic AI workflows alongside a recent NYSC corps member
          in Abuja, a self-employed founder in Port Harcourt, and an undergraduate engineer in Zaria — all guided
          by vetted industry mentors and verifiable proof-of-work.
        </p>
      </section>

      {/* Five Targeted Career Pathways */}
      <section className="mt-14">
        <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>Multitrack Ecosystem</span>
        </div>
        <h2 className="mt-1 font-display text-2xl text-parchment font-bold">Who MLA Caters For</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-panel p-5">
            <div className="flex items-center gap-2.5 text-gold">
              <Briefcase size={18} />
              <h3 className="font-display font-bold text-parchment">Working Professionals</h3>
            </div>
            <p className="mt-2 text-xs text-parchment/70 leading-relaxed">
              Upskill in applied AI, automate repetitive workflows, and gain executive 1-on-1 mentorship to transition into senior management.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-panel p-5">
            <div className="flex items-center gap-2.5 text-red-400">
              <GraduationCap size={18} />
              <h3 className="font-display font-bold text-parchment">Fresh Graduates &amp; NYSC</h3>
            </div>
            <p className="mt-2 text-xs text-parchment/70 leading-relaxed">
              Build an unassailable portfolio of real deployed vibe-coding software tools, CV optimization, and mock interview coaching.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-panel p-5">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <Rocket size={18} />
              <h3 className="font-display font-bold text-parchment">Job Seekers &amp; Career Switchers</h3>
            </div>
            <p className="mt-2 text-xs text-parchment/70 leading-relaxed">
              Transition into high-income tech and digital roles with proof-of-work, practical tool mastery, and direct recruiter visibility.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-panel p-5">
            <div className="flex items-center gap-2.5 text-gold">
              <Zap size={18} />
              <h3 className="font-display font-bold text-parchment">Self-Employed &amp; Entrepreneurs</h3>
            </div>
            <p className="mt-2 text-xs text-parchment/70 leading-relaxed">
              Automate business operations, deploy intelligent customer agents, and build digital software tools with minimal engineering overhead.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-panel p-5 sm:col-span-2">
            <div className="flex items-center gap-2.5 text-blue-400">
              <Building size={18} />
              <h3 className="font-display font-bold text-parchment">Campus Scholars &amp; Independent Learners</h3>
            </div>
            <p className="mt-2 text-xs text-parchment/70 leading-relaxed">
              Participate in university hackathons, access verified academic and peer mentorship, and engage with fellows across 20+ Nigerian institutions.
            </p>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="mt-14">
        <h2 className="font-display text-2xl text-parchment font-bold">Our Foundational Pillars</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-parchment/10 bg-panel p-6">
            <span className="font-mono text-xs text-gold uppercase tracking-wider font-semibold">Pillar 01</span>
            <h3 className="mt-2 font-display text-xl text-parchment font-bold">AI Literacy &amp; Vibe Coding</h3>
            <p className="mt-2 text-xs leading-relaxed text-parchment/70">
              Practical, accessible curriculum teaching prompt workflows, autonomous agent coding, and full-stack software development.
            </p>
          </div>

          <div className="rounded-xl border border-parchment/10 bg-panel p-6">
            <span className="font-mono text-xs text-gold uppercase tracking-wider font-semibold">Pillar 02</span>
            <h3 className="mt-2 font-display text-xl text-parchment font-bold">Verified 1-on-1 Mentorship</h3>
            <p className="mt-2 text-xs leading-relaxed text-parchment/70">
              Personalized matching with verified corporate leads, software engineers, and university faculty across Nigeria.
            </p>
          </div>

          <div className="rounded-xl border border-parchment/10 bg-panel p-6">
            <span className="font-mono text-xs text-gold uppercase tracking-wider font-semibold">Pillar 03</span>
            <h3 className="mt-2 font-display text-xl text-parchment font-bold">Protected Digital Toolkits</h3>
            <p className="mt-2 text-xs leading-relaxed text-parchment/70">
              Authoritative publications, starter codebases, and templates secured with cryptographic HMAC licensing and dynamic watermarks.
            </p>
          </div>

          <div className="rounded-xl border border-parchment/10 bg-panel p-6">
            <span className="font-mono text-xs text-gold uppercase tracking-wider font-semibold">Pillar 04</span>
            <h3 className="mt-2 font-display text-xl text-parchment font-bold">Open Capability Network</h3>
            <p className="mt-2 text-xs leading-relaxed text-parchment/70">
              Local campus chapters, industry vertical hubs, and digital community cohorts that operate autonomously under MLA governance.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-16 rounded-2xl border border-gold/30 bg-gradient-to-br from-[#1E1712] to-[#120E0B] p-8 sm:p-10 text-center shadow-xl">
        <h2 className="font-display text-3xl text-parchment font-bold">Join the Academy</h2>
        <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-parchment/75 leading-relaxed">
          Whether you are an established professional, a fresh graduate ready for your first big role,
          a business owner building the future, or an ambitious student, MLA welcomes you.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-crest-red px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-crest-red/90 shadow-lg shadow-crest-red/30 transition-all"
          >
            Create Your Account Free
          </Link>
          <Link
            href="/courses"
            className="rounded-lg border border-gold/50 px-6 py-3 text-xs sm:text-sm font-bold text-gold hover:bg-gold/15 transition-all"
          >
            Explore AI Curriculum
          </Link>
        </div>
      </section>
    </div>
  );
}