import Link from "next/link";
import { getInstitutionCount, getMentorCount, getPublishedPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog-card";
import { InstitutionTicker } from "@/components/institution-ticker";
import { FaqAccordion } from "@/components/faq-accordion";
import {
  ArrowRight,
  GraduationCap,
  Users,
  Building2,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  ShoppingBag,
  CheckCircle2,
  Star,
  Compass,
  ArrowUpRight,
} from "lucide-react";

export default async function Home() {
  const [institutions, mentors, posts] = await Promise.all([
    getInstitutionCount(),
    getMentorCount(),
    getPublishedPosts(3),
  ]);

  return (
    <div className="relative overflow-hidden bg-[#0A0806]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Radial Lights */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-radial from-gold/15 via-gold/5 to-transparent blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-1/3 right-0 h-[450px] w-[500px] rounded-full bg-radial from-crest-red/12 to-transparent blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            {/* National Trust Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold-light backdrop-blur-md">
              <Sparkles size={14} className="text-gold animate-pulse" />
              <span>Nigeria&apos;s Premier Higher Education Academy</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-parchment sm:text-5xl lg:text-6xl lg:leading-[1.12]">
              Lead where you study —{" "}
              <span className="text-gradient-gold">mentor anyone, anywhere.</span>
            </h1>

            <p className="mt-6 text-base leading-relaxed text-parchment/75 sm:text-lg">
              Master state-of-the-art AI literacy and vibe coding, then share your skills by mentoring
              students across 20+ Nigerian universities — all within one prestigious, collaborative academy.
            </p>

            {/* Social Proof Stars */}
            <div className="mt-5 flex items-center gap-2.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-parchment/80">
                4.9/5 Rating across Nigerian Higher Institutions
              </span>
            </div>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/courses" className="btn-primary">
                <span>Browse Courses</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/mentorship/find" className="btn-secondary">
                <Users size={16} className="text-gold" />
                <span>Find a Mentor</span>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="mt-14 grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
                  <Building2 size={18} className="text-gold" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-parchment">{institutions}</p>
                  <p className="text-[11px] uppercase tracking-wider text-parchment/50">Institutions</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-crest-red/30 bg-crest-red/10">
                  <Users size={18} className="text-red-400" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-parchment">{mentors}</p>
                  <p className="text-[11px] uppercase tracking-wider text-parchment/50">Active Mentors</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
                  <Award size={18} className="text-gold" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-parchment">100%</p>
                  <p className="text-[11px] uppercase tracking-wider text-parchment/50">Free Access</p>
                </div>
              </div>
            </div>
          </div>

          {/* Real High-End Photography Hero Visual with Floating Glass Overlays */}
          <div className="relative">
            {/* Glow Aura */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-gold/25 via-crest-red/25 to-transparent blur-2xl opacity-60" />

            {/* Framed Image Container */}
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#140F0C] shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-mentor.jpg"
                alt="Nigerian student mentor reviewing AI materials in university library"
                className="aspect-[4/3] w-full object-cover brightness-[0.92] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0B08] via-transparent to-black/20" />

              {/* Floating Chip 1: Top Verified Mentor */}
              <div className="absolute top-4 left-4 rounded-xl border border-white/20 bg-black/75 px-3.5 py-2 backdrop-blur-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-semibold text-parchment">Verified Mentor Available</span>
                  <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                    98% Match
                  </span>
                </div>
              </div>

              {/* Floating Chip 2: Bottom Progress Highlight */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-gold/25 bg-black/80 p-4 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15 text-gold border border-gold/30">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-parchment">AI Literacy &amp; Vibe Coding</p>
                      <p className="text-[10px] text-parchment/60">Module 2: Autonomous Tools · Free</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={10} /> Certified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTINUOUS TICKER: TOP NIGERIAN UNIVERSITIES */}
      <InstitutionTicker />

      {/* 3. NUMBERED 4-PILLAR SOLUTIONS (Inspired by Leadify Pro Framework) */}
      <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase font-semibold tracking-widest text-gold">The MLA Architecture</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-parchment sm:text-4xl">
            Everything designed for leadership &amp; academic mastery
          </h2>
          <p className="mt-3 text-sm text-parchment/65">
            Four pillars integrated into a single unified workspace to empower you at every stage.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pillar 01 */}
          <div className="glass-card group relative flex flex-col justify-between rounded-2xl p-6 overflow-hidden">
            <span className="absolute top-3 right-4 font-display text-4xl font-bold text-white/[0.04] transition-colors group-hover:text-gold/10">
              01
            </span>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold transition-transform group-hover:scale-105">
                <BookOpen size={22} />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-parchment group-hover:text-gold transition-colors">
                AI &amp; Vibe Coding
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/65">
                Practical, modular courses covering prompt workflows, autonomous agent coding, and applied machine learning.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-parchment/70">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>Self-paced progress tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>Interactive module milestones</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>100% Free for students</span>
                </li>
              </ul>
            </div>
            <Link href="/courses" className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 text-xs font-semibold text-gold group-hover:text-gold-light">
              <span>View Curriculum</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Pillar 02 */}
          <div className="glass-card group relative flex flex-col justify-between rounded-2xl p-6 overflow-hidden">
            <span className="absolute top-3 right-4 font-display text-4xl font-bold text-white/[0.04] transition-colors group-hover:text-gold/10">
              02
            </span>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-crest-red/30 bg-crest-red/10 text-red-400 transition-transform group-hover:scale-105">
                <Users size={22} />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-parchment group-hover:text-gold transition-colors">
                1-on-1 Mentorship
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/65">
                Cross-institution mentor matching pairing undergraduate learners with senior student fellows and faculty.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-parchment/70">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>Peer &amp; faculty guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>Super Admin vetted profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>Direct request &amp; approval</span>
                </li>
              </ul>
            </div>
            <Link href="/mentorship/find" className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 text-xs font-semibold text-gold group-hover:text-gold-light">
              <span>Find Mentors</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Pillar 03 */}
          <div className="glass-card group relative flex flex-col justify-between rounded-2xl p-6 overflow-hidden">
            <span className="absolute top-3 right-4 font-display text-4xl font-bold text-white/[0.04] transition-colors group-hover:text-gold/10">
              03
            </span>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold transition-transform group-hover:scale-105">
                <Calendar size={22} />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-parchment group-hover:text-gold transition-colors">
                Masterclass Events
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/65">
                Virtual webinars and campus-scoped technical workshops with instant RSVP and recording archives.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-parchment/70">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>Platform-wide webinars</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>Campus-scoped meetups</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>Official session recaps</span>
                </li>
              </ul>
            </div>
            <Link href="/events" className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 text-xs font-semibold text-gold group-hover:text-gold-light">
              <span>See Schedule</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Pillar 04 */}
          <div className="glass-card group relative flex flex-col justify-between rounded-2xl p-6 overflow-hidden">
            <span className="absolute top-3 right-4 font-display text-4xl font-bold text-white/[0.04] transition-colors group-hover:text-gold/10">
              04
            </span>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-crest-red/30 bg-crest-red/10 text-red-400 transition-transform group-hover:scale-105">
                <ShoppingBag size={22} />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-parchment group-hover:text-gold transition-colors">
                Protected Shop
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/65">
                Curated digital textbooks, software, and tools secured by Paystack, HMAC keys, and personalized watermarking.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-parchment/70">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>Cryptographic HMAC licenses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>Hardware activation limits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-gold" />
                  <span>Paystack checkout in NGN</span>
                </li>
              </ul>
            </div>
            <Link href="/shop" className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 text-xs font-semibold text-gold group-hover:text-gold-light">
              <span>Explore Store</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. "HOW IT WORKS" 3-STEP ROADMAP (Inspired by Leadify Pro) */}
      <section className="relative border-y border-white/[0.08] bg-[#0E0B08]/80 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto">
            <p className="text-xs uppercase font-semibold tracking-widest text-gold">The Journey</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-parchment">How MLA Works for You</h2>
            <p className="mt-3 text-xs sm:text-sm text-parchment/65">
              Three simple steps to transform from a learner into an empowered campus leader.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold font-bold font-display text-lg border border-gold/30">
                1
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-parchment">
                Join Under Your Campus
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/65">
                Register with your university or polytechnic. Row-level security automatically connects you to your institution&apos;s verified peer network.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-crest-red/20 text-red-400 font-bold font-display text-lg border border-crest-red/30">
                2
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-parchment">
                Master AI &amp; Vibe Coding
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/65">
                Complete structured, interactive modules at your own pace. Gain practical coding skills and understand prompt architecture.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-xl border border-white/[0.08] bg-black/40 p-6 backdrop-blur-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold font-bold font-display text-lg border border-gold/30">
                3
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-parchment">
                Connect, Mentor &amp; Lead
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/65">
                Pair 1-on-1 with fellows across Nigeria. Attend exclusive masterclasses, share your skills, and earn leadership recognition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MENTOR & FELLOW SPOTLIGHT (Showcasing Real Photography) */}
      <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A1410] to-[#0D0A08] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl border border-gold/20 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/mentor-spotlight.jpg"
                alt="Featured Nigerian fellow and mentor in technology lab"
                className="aspect-square w-full object-cover brightness-[0.95]"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-black/80 p-3.5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-parchment">Dr. Chioma Nnamdi</p>
                    <p className="text-[10px] text-parchment/60">Senior AI Mentor · FUTA &amp; Covenant</p>
                  </div>
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Active Fellow
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                <Sparkles size={13} />
                <span>Featured Fellow Spotlight</span>
              </div>

              <h2 className="font-display text-3xl font-bold text-parchment sm:text-4xl">
                &ldquo;Mentorship transforms theoretical skills into campus leadership.&rdquo;
              </h2>

              <p className="text-sm leading-relaxed text-parchment/75">
                &ldquo;At MLA, we bridge the divide between universities. A student in Zaria can learn
                vibe coding alongside a mentor in Ibadan. That cross-pollination of ideas is what will
                power Nigeria&apos;s digital future.&rdquo;
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-parchment/80">
                  #VibeCoding
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-parchment/80">
                  #AutonomousAgents
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-parchment/80">
                  #AcademicEthics
                </span>
              </div>

              <div className="pt-2">
                <Link href="/mentorship/find" className="btn-primary">
                  <span>Connect with Mentors</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LATEST FROM THE BLOG */}
      <section className="relative border-t border-white/[0.08] bg-[#0E0B08]/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-semibold tracking-widest text-gold">Dispatches &amp; Knowledge</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-parchment">From the Academy Blog</h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-light transition-colors"
            >
              <span>Explore all articles</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-xl border border-white/[0.08] bg-panel p-8 text-center">
              <Sparkles size={24} className="mx-auto text-gold/40" />
              <p className="mt-3 text-sm text-parchment/60">
                Staff dispatches and academic articles are being curated. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (Leadify Pro Pattern) */}
      <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs uppercase font-semibold tracking-widest text-gold">Have Questions?</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-parchment">Frequently Asked Questions</h2>
          <p className="mt-3 text-xs sm:text-sm text-parchment/65">
            Everything you need to know about joining MLA, mentorship matching, and courses.
          </p>
        </div>

        <FaqAccordion />
      </section>

      {/* 8. HIGH-CONVERSION BENTO CTA BANNER (Leadify Pro Pattern) */}
      <section className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-r from-[#1E1712] via-[#2A1F18] to-[#16110D] p-8 sm:p-14 text-center shadow-[0_20px_60px_rgba(212,175,55,0.1)]">
          {/* Ambient Accent Light */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-gold/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-light">
              <Compass size={14} className="text-gold" />
              Start Your Journey Today
            </span>

            <h2 className="font-display text-3xl font-bold text-parchment sm:text-4xl lg:text-5xl leading-tight">
              Ready to lead where you study?
            </h2>

            <p className="text-sm leading-relaxed text-parchment/75 sm:text-base">
              Join thousands of students and mentors from universities across Nigeria. Build your AI portfolio,
              receive verified 1-on-1 mentorship, and accelerate your career.
            </p>

            <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
              <Link href="/register" className="btn-primary !px-7 !py-3.5 !text-sm">
                <span>Join MLA for Free</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/about" className="btn-secondary !px-7 !py-3.5 !text-sm">
                <span>Learn More</span>
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-parchment/60">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-gold" />
                No tuition or credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-gold" />
                Immediate campus onboarding
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}