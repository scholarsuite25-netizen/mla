import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Briefcase,
  GraduationCap,
  Rocket,
  Zap,
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Award,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Our Mission — MLA Leadership Academy",
  description:
    "The Mentorship and Leadership Academy unites working professionals, fresh graduates, entrepreneurs, job seekers, and campus scholars to advance AI literacy and career leadership.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800 w-full">
      {/* Royal Navy Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] text-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="pointer-events-none absolute -top-24 -left-20 h-80 w-80 rounded-full bg-[#00D2FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-80 w-80 rounded-full bg-[#7C3AED]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-[#00D2FF] uppercase tracking-wider mb-4">
                <Sparkles size={14} />
                Our Mission &amp; Charter
              </span>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight mb-4">
                Empowering Nigeria&apos;s Next Generation of AI Leaders &amp; Scholars
              </h1>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mb-8">
                The Mentorship &amp; Leadership Academy (MLA) is Nigeria&apos;s unified capability engine.
                We bridge the gap between classroom theory and real-world executive leadership through practical
                AI literacy, vibe coding, and verified 1-on-1 industry mentorship.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="rounded-lg bg-[#00D2FF] px-6 py-3 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all flex items-center gap-2"
                >
                  Join the Academy <ArrowRight size={15} />
                </Link>
                <Link
                  href="/courses"
                  className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-white/15 transition-all"
                >
                  Explore AI Curriculum
                </Link>
              </div>
            </div>

            {/* Authentic Nigerian Hero Image */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border-2 border-cyan-400/30 bg-[#161152] shadow-2xl">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/hero-biru.jpg"
                    alt="Nigerian Tech Executive and MLA Mentor"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120D42] via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#00D2FF] uppercase tracking-wider">Executive Mentorship</p>
                      <p className="text-sm font-semibold text-white">Verified Nigerian Industry Leaders</p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/20 text-[#00D2FF]">
                      <ShieldCheck size={18} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Narrative & Philosophy */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0284C7]">
              The Challenge We Solve
            </span>
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-snug">
              Democratizing Elite Career Acceleration &amp; Hands-On AI Competency
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              For too long, high-impact career guidance, modern technical competencies, and executive mentorship
              have been locked behind exclusive corporate networks or siloed within a handful of elite institutions.
              Working professionals struggle to find flexible upskilling in AI; fresh graduates find themselves
              unprepared for the modern tech stack; and self-employed founders lack the technical tools to scale.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              MLA dismantles these artificial walls. We treat career development as a lifelong continuum.
              A corporate banker in Lagos can learn agentic AI workflows alongside a recent NYSC corps member
              in Abuja, a self-employed founder in Port Harcourt, and an undergraduate scholar in Zaria — all guided
              by vetted industry mentors and verifiable proof-of-work.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-2xl font-bold text-[#120D42]">50+</span>
                <p className="text-xs text-slate-500 mt-1">Campus Hubs &amp; Tertiary Partners</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-2xl font-bold text-[#0284C7]">100%</span>
                <p className="text-xs text-slate-500 mt-1">Verifiable Proof-of-Work Portfolios</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
                <Image
                  src="/images/student-mobile.jpg"
                  alt="Nigerian scholar using mobile digital learning portal"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
                  <CheckCircle2 size={16} />
                  <span>Accessible Everywhere</span>
                </div>
                <p className="text-xs text-slate-600">
                  Optimized for mobile scholars and distributed professionals across all 36 Nigerian states.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multitrack Ecosystem (5 Dedicated Audiences) */}
      <section className="bg-white border-y border-slate-200/80 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0284C7]">
              Multitrack Ecosystem
            </span>
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-2 mb-3">
              Who the Mentorship &amp; Leadership Academy Caters For
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              A bespoke, tailored curriculum designed for your specific stage of career and professional life.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200/90 bg-[#FAFAFD] p-6 shadow-sm hover:border-cyan-400 hover:shadow-md transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#120D42] text-[#00D2FF] mb-4 shadow-sm">
                <Briefcase size={20} />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900 mb-2">Working Professionals</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Upskill in applied AI, automate repetitive workflows, and gain executive 1-on-1 mentorship to transition into senior management roles.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200/90 bg-[#FAFAFD] p-6 shadow-sm hover:border-cyan-400 hover:shadow-md transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#120D42] text-[#00D2FF] mb-4 shadow-sm">
                <GraduationCap size={20} />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900 mb-2">Fresh Graduates &amp; NYSC</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Build an unassailable portfolio of real deployed vibe-coding software tools, CV optimization, and mock interview coaching.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200/90 bg-[#FAFAFD] p-6 shadow-sm hover:border-cyan-400 hover:shadow-md transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#120D42] text-[#00D2FF] mb-4 shadow-sm">
                <Rocket size={20} />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900 mb-2">Job Seekers &amp; Switchers</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Transition into high-income tech and digital roles with proof-of-work, practical tool mastery, and direct recruiter visibility.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-slate-200/90 bg-[#FAFAFD] p-6 shadow-sm hover:border-cyan-400 hover:shadow-md transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#120D42] text-[#00D2FF] mb-4 shadow-sm">
                <Zap size={20} />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900 mb-2">Entrepreneurs &amp; Founders</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Automate business operations, deploy intelligent customer agents, and build digital software tools with minimal engineering overhead.
              </p>
            </div>

            {/* Card 5 */}
            <div className="rounded-2xl border border-slate-200/90 bg-[#FAFAFD] p-6 shadow-sm hover:border-cyan-400 hover:shadow-md transition-all sm:col-span-2 lg:col-span-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#120D42] text-[#00D2FF] mb-4 shadow-sm">
                <Building2 size={20} />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900 mb-2">Campus Scholars &amp; Independent Learners</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Participate in university hackathons, access verified academic and peer mentorship, and engage with fellows across 50+ Nigerian tertiary institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Foundational Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0284C7]">
            Core Framework
          </span>
          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-2 mb-3">
            Our Four Foundational Pillars
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Engineered to deliver measurable career progress, high confidence, and verifiable credentials.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-bold text-[#0284C7] uppercase tracking-wider block mb-2">
              Pillar 01
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-[#0284C7] mb-3">
              <BookOpen size={20} />
            </div>
            <h3 className="font-display text-sm font-bold text-slate-900 mb-2">AI Literacy &amp; Vibe Coding</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Practical curriculum teaching prompt workflows, autonomous agent coding, and full-stack software development.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-bold text-[#0284C7] uppercase tracking-wider block mb-2">
              Pillar 02
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-[#0284C7] mb-3">
              <Users size={20} />
            </div>
            <h3 className="font-display text-sm font-bold text-slate-900 mb-2">Verified 1-on-1 Mentorship</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Personalized matching with verified corporate leads, software engineers, and university faculty across Nigeria.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-bold text-[#0284C7] uppercase tracking-wider block mb-2">
              Pillar 03
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-[#0284C7] mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-display text-sm font-bold text-slate-900 mb-2">Protected Digital Toolkits</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Authoritative publications, starter codebases, and templates secured with cryptographic HMAC licensing and dynamic watermarks.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-bold text-[#0284C7] uppercase tracking-wider block mb-2">
              Pillar 04
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-[#0284C7] mb-3">
              <Award size={20} />
            </div>
            <h3 className="font-display text-sm font-bold text-slate-900 mb-2">Open Capability Network</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Local campus chapters, industry vertical hubs, and digital community cohorts that operate autonomously under MLA governance.
            </p>
          </div>
        </div>
      </section>

      {/* Royal Navy Call to Action */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] p-8 sm:p-12 text-center text-white shadow-xl">
          <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#00D2FF]/20 blur-3xl" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Join the Academy Today
          </h2>
          <p className="mx-auto max-w-xl text-xs sm:text-sm text-slate-200 leading-relaxed mb-6">
            Whether you are an established professional, a fresh graduate ready for your first big role,
            a business owner building the future, or an ambitious scholar, MLA welcomes you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-[#00D2FF] px-6 py-3 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-lg shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all"
            >
              Create Your Account Free
            </Link>
            <Link
              href="/courses"
              className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition-all"
            >
              Explore AI Curriculum
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}