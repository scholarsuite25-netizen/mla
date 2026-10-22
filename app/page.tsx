import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getInstitutionCount, getPublishedPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog-card";
import { InstitutionTicker } from "@/components/institution-ticker";
import { FaqAccordion } from "@/components/faq-accordion";
import {
  ArrowRight,
  GraduationCap,
  Sparkles,
  Award,
  CheckCircle2,
  Briefcase,
  Rocket,
  Zap,
  Building,
  Code2,
  Cloud,
  ShieldCheck,
  Check,
  Laptop,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const [{ data: { user } }, institutions, posts] = await Promise.all([
    supabase.auth.getUser(),
    getInstitutionCount(),
    getPublishedPosts(3),
  ]);

  return (
    <div className="relative overflow-hidden bg-[#FAFAFD] text-slate-800">
      {/* =========================================================================
          1. HERO SECTION (VIBRANT ROYAL INK/INDIGO GRADIENT MATCHING THE REFERENCE)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120D42] via-[#1A1359] to-[#2B1B8A] pt-12 pb-36 sm:pt-20 sm:pb-44 text-white">
        {/* Subtle Tech Circuit Background Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 0.75px, transparent 0.75px), radial-gradient(#818cf8 0.75px, #120D42 0.75px)`,
            backgroundSize: `32px 32px`,
            backgroundPosition: `0 0, 16px 16px`,
          }}
          aria-hidden
        />

        {/* Ambient Glow Orbs */}
        <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#00D2FF]/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-10 h-96 w-96 rounded-full bg-[#7C3AED]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            {/* Left Content Column */}
            <div className="z-10">
              {/* Upper Subtitle Pill / Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>WELCOME TO MLA</span>
              </div>

              {/* Bold Primary Display Headline */}
              <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl leading-[1.2]">
                We solve business &amp; career problems with technology.
              </h1>

              {/* Supporting Copy */}
              <p className="mt-4 text-sm leading-relaxed text-indigo-100/85 sm:text-base max-w-xl">
                Our performance is your success. Our passion is innovation. Our verified mentorship, applied AI literacy, and vibe coding are unmatched. We get you more.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={user ? "/dashboard" : "/register"}
                  className="rounded-lg bg-[#00D2FF] px-8 py-3.5 text-sm font-bold text-[#0A0E2A] shadow-xl shadow-cyan-500/25 transition-all hover:bg-[#38BDF8] hover:scale-105 active:scale-95"
                >
                  Get Started
                </Link>
                <Link
                  href="/courses"
                  className="rounded-lg border border-white/35 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
                >
                  View Case Study
                </Link>
              </div>

              {/* Micro Perks Row */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-indigo-200/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                  <span>Free core curriculum on all tracks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                  <span>Verified 1-on-1 industry mentors</span>
                </div>
              </div>
            </div>

            {/* Right Graphic Column (Exact Reference Style with Laptop Portrait & Graphic Shapes) */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Floating Geometric Pill Shapes Matching the Reference Design */}
              <div
                className="absolute -top-10 -right-6 h-28 w-80 rotate-[-35deg] rounded-full bg-gradient-to-r from-indigo-500/35 to-blue-400/20 blur-xs -z-0 pointer-events-none"
                aria-hidden
              />
              <div
                className="absolute top-24 -right-12 h-20 w-36 rotate-[-35deg] rounded-full bg-gradient-to-r from-purple-500/30 to-indigo-500/20 blur-xs -z-0 pointer-events-none"
                aria-hidden
              />
              <div
                className="absolute -bottom-8 -left-8 h-24 w-64 rotate-[-35deg] rounded-full bg-cyan-400/15 blur-sm -z-0 pointer-events-none"
                aria-hidden
              />

              {/* Small Graphic Floating Dots & Accents */}
              <div className="absolute top-10 right-2 h-3.5 w-3.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
              <div className="absolute top-2 left-6 text-2xl font-light text-pink-400 select-none">+</div>
              <div className="absolute bottom-16 right-0 text-xl font-light text-cyan-300 select-none">+</div>

              {/* Main Photo Cutout / Frame */}
              <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/5 shadow-[0_30px_70px_rgba(10,8,40,0.6)] backdrop-blur-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero-biru.jpg"
                  alt="Friendly modern tech professional holding laptop"
                  className="aspect-[3/4] w-full object-cover object-top"
                />

                {/* Subtle Bottom Light Vignette */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#140F47]/60 via-transparent to-transparent" />

                {/* Floating Micro Badge */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-[#161152]/90 p-3.5 backdrop-blur-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                        <Laptop size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Applied AI &amp; Vibe Coding</p>
                        <p className="text-[10px] text-cyan-200/80">Self-paced &amp; mentor-guided</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-cyan-400/20 px-2.5 py-1 text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
                      Live Cohort
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. 3 OVERLAPPING FLOATING SERVICE CARDS (MATCHING THE REFERENCE)
         ========================================================================= */}
      <section className="relative z-20 mx-auto -mt-20 max-w-7xl px-4 sm:-mt-28 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Software & AI Services */}
          <div className="card-biru p-8 text-center flex flex-col items-center justify-between">
            <div className="flex flex-col items-center">
              {/* Badge Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#181259] text-white shadow-md mb-6">
                <Code2 size={24} />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                Software Services
              </h3>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-500 max-w-xs">
                Applied AI literacy, autonomous agent workflows, and vibe coding. Build real production systems without prior syntax hurdles.
              </p>
            </div>
            <div className="mt-6">
              <Link href="/courses" className="btn-royal">
                Learn more
              </Link>
            </div>
          </div>

          {/* Card 2: Cloud & Enterprise Services */}
          <div className="card-biru p-7 text-center flex flex-col items-center justify-between">
            <div className="flex flex-col items-center">
              {/* Badge Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 shadow-sm mb-5">
                <Cloud size={22} />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                Cloud Services
              </h3>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-500 max-w-xs">
                Comprehensive business formalization: CAC setup, unit economics, automated Paystack integration, and team operating systems.
              </p>
            </div>
            <div className="mt-6">
              <Link href="/shop" className="btn-royal">
                Learn more
              </Link>
            </div>
          </div>

          {/* Card 3: Security & Mentorship Services */}
          <div className="card-biru p-7 text-center flex flex-col items-center justify-between">
            <div className="flex flex-col items-center">
              {/* Badge Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm mb-5">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                Security services
              </h3>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-500 max-w-xs">
                Verified 1-on-1 industry mentorship and institutional governance across 50+ Nigerian higher institutions and top companies.
              </p>
            </div>
            <div className="mt-6">
              <Link href="/mentorship/find" className="btn-royal">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SOCIAL PROOF / LOGO BAR ("Join our 30,000 happy customers")
         ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-base sm:text-lg font-bold text-slate-800">
          Join our 30,000 happy customers
        </h2>

        {/* Clean Logo Row */}
        <div className="mt-8 grid grid-cols-2 items-center justify-center gap-8 md:grid-cols-6 opacity-70 grayscale transition-all hover:grayscale-0">
          <div className="flex items-center justify-center font-display font-black tracking-widest text-slate-700 text-base">
            UNILAG
          </div>
          <div className="flex items-center justify-center font-display font-bold tracking-wider text-slate-700 text-sm">
            UI · IBADAN
          </div>
          <div className="flex items-center justify-center font-display font-extrabold tracking-widest text-slate-700 text-base">
            ABU ZARIA
          </div>
          <div className="flex items-center justify-center font-display font-black tracking-wider text-slate-700 text-sm">
            COVENANT
          </div>
          <div className="flex items-center justify-center font-display font-bold tracking-widest text-slate-700 text-base">
            FINTECH
          </div>
          <div className="flex items-center justify-center font-display font-black tracking-wider text-slate-700 text-sm">
            OAU IFE
          </div>
        </div>

        {/* Dynamic Continuous Marquee Ticker */}
        <div className="mt-8">
          <InstitutionTicker />
        </div>
      </section>

      {/* =========================================================================
          4. SPLIT FEATURE SECTION ("Let us do the work, so you can focus on what matters.")
         ========================================================================= */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-3">
          {/* Left Column: Heading & Description */}
          <div className="space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
              Let us do the work, so you can focus on what matters.
            </h2>
            <p className="text-sm leading-relaxed text-slate-500">
              Accelerate your career transition, business formalization, and applied AI workflows. We handle the curriculum design, 1-on-1 matching, and verified credentialing.
            </p>
            <div className="pt-2">
              <Link href="/courses" className="btn-royal">
                Learn more
              </Link>
            </div>
          </div>

          {/* Center Column: Professional Image with Tech Watermark */}
          <div className="relative flex justify-center">
            {/* Subtle Circuit Background Watermark */}
            <div
              className="pointer-events-none absolute -inset-4 opacity-15"
              style={{
                backgroundImage: `radial-gradient(#0284c7 1px, transparent 1px)`,
                backgroundSize: `24px 24px`,
              }}
              aria-hidden
            />
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/student-mobile.jpg"
                alt="Student smiling using smartphone"
                className="aspect-[3/4] w-full object-cover object-top"
              />
            </div>
          </div>

          {/* Right Column: 3 Stacked Cards (Card 2 is the Active Blue Gradient Highlight) */}
          <div className="space-y-4">
            {/* Card 1: Remote & Campus Cohorts */}
            <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 border border-cyan-200">
                <Check size={14} className="stroke-[3]" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-slate-900">
                  Remote Home Office
                </h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Flexible weekly live sessions, mentor reviews, and recorded modules accessible from any device.
                </p>
              </div>
            </div>

            {/* Card 2: Active Highlighted Royal Blue Gradient Card */}
            <div className="flex items-start gap-4 rounded-xl bg-gradient-to-r from-[#181259] to-[#0284C7] p-5 text-white shadow-xl">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white border border-white/30">
                <Check size={14} className="stroke-[3]" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-white">
                  Virtual Workstation
                </h4>
                <p className="mt-1 text-xs text-indigo-100/90 leading-relaxed">
                  Build real production-ready web apps and automated agents using plain natural language and vibe coding.
                </p>
              </div>
            </div>

            {/* Card 3: Terminal Server / Protected Toolkits */}
            <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 border border-cyan-200">
                <Check size={14} className="stroke-[3]" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-slate-900">
                  Terminal Server
                </h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Instant access to watermarked executive slides, legal business templates, and curriculum notes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CAREER TRACKS GRID (INCLUSIVE PATHWAYS WITH MODERN ELEVATED STYLING)
         ========================================================================= */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-700 mb-3">
            <Sparkles size={13} className="text-cyan-600" />
            <span>Inclusive Multitrack Academy</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Tailored for every stage of your career
          </h2>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            Whether you are climbing the corporate ladder, launching after graduation, switching fields, scaling an enterprise, or studying on campus — MLA delivers tailored tools and mentorship.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Corporate Track */}
          <div className="card-biru p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 mb-4">
                <Briefcase size={20} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Corporate Track</span>
              <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                Career Planning &amp; Professionals
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Strategic career planning, executive presence, high-stakes negotiation, and AI workflow automation to accelerate your trajectory into C-suite and senior management.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Executive roadmaps &amp; promotion planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>1-on-1 industry mentor matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Flexible evening &amp; weekend pacing</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href={user ? "/courses#career-planning" : "/register"} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900">
                <span>{user ? "Access Corporate Track" : "Join Corporate Track"}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Card 2: Fresh Graduates & NYSC */}
          <div className="card-biru p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 mb-4">
                <GraduationCap size={20} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600">Launch Track</span>
              <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                Fresh Graduates &amp; NYSC
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Early-career planning and corporate readiness. Build proof-of-work with vibe coding, master ATS-optimized CVs, and receive direct mock interview coaching.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Hands-on proof-of-work projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Mentor-led CV &amp; interview coaching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Cross-institution peer networking</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href={user ? "/courses#graduate-planning" : "/register"} className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-900">
                <span>{user ? "Access Graduate Track" : "Join Graduate Track"}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Card 3: Entrepreneurs & Founders */}
          <div className="card-biru p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 mb-4">
                <Zap size={20} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Enterprise Track</span>
              <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                Entrepreneurship &amp; Business Setup
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Comprehensive business formalization: CAC registration, unit economics, Paystack checkout integration, operating procedures (SOPs), and autonomous AI agent operations.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>CAC setup, governance &amp; legal structure</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Unit economics, pricing &amp; Paystack setup</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Autonomous AI agents &amp; team management</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href={user ? "/courses#entrepreneurship-management" : "/register"} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900">
                <span>{user ? "Access Founder Track" : "Join Founder Track"}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Card 4: Second-Act Track */}
          <div className="card-biru p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200 mb-4">
                <Award size={20} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Second-Act Track</span>
              <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                Retirement Planning &amp; Legacy
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Structured transition for senior leaders: pension optimization, wealth preservation, advisory and high-ticket consulting, and second-act venture building.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Structured retirement &amp; legacy planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>High-ticket consulting &amp; advisory practice</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Guided second-act venture building</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href={user ? "/courses#retirement-planning" : "/register"} className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900">
                <span>{user ? "Access Second-Act Track" : "Join Second-Act Track"}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Card 5: Transition Track */}
          <div className="card-biru p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4">
                <Rocket size={20} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Transition Track</span>
              <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                Job Seekers &amp; Switchers
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Transition smoothly into high-demand AI and tech roles without a computer science degree. Master modern tools that companies are actively hiring for.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>High-income practical skill acquisition</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>1-on-1 career transition coaching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Remote job and freelance positioning</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href={user ? "/courses#career-planning" : "/register"} className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900">
                <span>{user ? "Access Transition Track" : "Join Career Switch Track"}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Card 6: Campus Scholars */}
          <div className="card-biru p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-200 mb-4">
                <Building size={20} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Campus Track</span>
              <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                Campus Scholars (Students)
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Excel in academic coursework, build cross-campus peer networks across {institutions} institutions, and graduate with a verifiable technical edge.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Cross-campus scholar networks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Mentor &amp; fellow guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                  <span>Campus meetups &amp; masterclasses</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href={user ? "/courses#ai-vibe-coding" : "/register"} className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900">
                <span>{user ? "Access Student Track" : "Join Campus Track"}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. LATEST DISPATCHES / BLOG SECTION
         ========================================================================= */}
      {posts && posts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">Dispatches &amp; Insights</p>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-900">
                Latest from the Academy
              </h2>
            </div>
            <Link href="/blog" className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900">
              <span>View all dispatches</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          7. FAQ ACCORDION SECTION
         ========================================================================= */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-200/80">
        <div className="text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Everything you need to know about tracks, mentorship matching, and curriculum access.
          </p>
        </div>
        <div className="mt-8">
          <FaqAccordion />
        </div>
      </section>

      {/* =========================================================================
          8. CALL TO ACTION BANNER (ROYAL INK/INDIGO GRADIENT)
         ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#140F47] via-[#1A1359] to-[#2B1B8A] px-8 py-12 text-center text-white shadow-2xl sm:px-16">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to accelerate your career &amp; business?
            </h2>
            <p className="mt-3 text-sm text-indigo-100/80">
              Join thousands of working professionals, ambitious graduates, and campus scholars nationwide. Free access to core courses today.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-[#00D2FF] px-7 py-3 text-sm font-bold text-[#0A0E2A] shadow-xl shadow-cyan-500/30 transition-all hover:bg-[#38BDF8] hover:scale-105 active:scale-95"
              >
                Get Started Free
              </Link>
              <Link
                href="/courses"
                className="rounded-lg border border-white/35 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
              >
                Browse Syllabus
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}