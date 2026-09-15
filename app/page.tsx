import Link from "next/link";
import { getInstitutionCount, getMentorCount, getPublishedPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog-card";
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
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default async function Home() {
  const [institutions, mentors, posts] = await Promise.all([
    getInstitutionCount(),
    getMentorCount(),
    getPublishedPosts(3),
  ]);

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative border-b border-white/[0.08] pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Glows */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[550px] w-[800px] -translate-x-1/2 rounded-full bg-radial from-gold/15 via-gold/5 to-transparent blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-1/4 right-0 h-[400px] w-[500px] rounded-full bg-radial from-crest-red/10 to-transparent blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            {/* National Prestige Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-medium text-gold-light backdrop-blur-md">
              <Sparkles size={14} className="text-gold animate-pulse" />
              <span>Nigeria&apos;s Premier Higher Education Academy</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-parchment sm:text-5xl lg:text-6xl lg:leading-[1.15]">
              Lead where you study —{" "}
              <span className="text-gradient-gold">mentor anyone, anywhere.</span>
            </h1>

            <p className="mt-6 text-base leading-relaxed text-parchment/75 sm:text-lg">
              Master modern AI literacy and vibe coding, then share your expertise by mentoring
              students across Nigerian universities — all within one prestigious, unified academy.
            </p>

            {/* CTAs */}
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

            {/* Live Stats Bar */}
            <div className="mt-14 grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold/25 bg-gold/10">
                  <Building2 size={20} className="text-gold" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-parchment">{institutions}</p>
                  <p className="text-[11px] uppercase tracking-wider text-parchment/50">Institutions</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-crest-red/30 bg-crest-red/10">
                  <Users size={20} className="text-red-400" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-parchment">{mentors}</p>
                  <p className="text-[11px] uppercase tracking-wider text-parchment/50">Active Mentors</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold/25 bg-gold/10">
                  <Award size={20} className="text-gold" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-parchment">100%</p>
                  <p className="text-[11px] uppercase tracking-wider text-parchment/50">Free Access</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic 3D-Feel Academy Card Stack */}
          <div className="relative hidden lg:block" aria-hidden="true">
            {/* Background Layer Glow */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-gold/20 via-crest-red/20 to-transparent blur-2xl" />

            {/* Primary Showcase Card */}
            <div className="relative rounded-2xl border border-white/15 bg-gradient-to-b from-[#1C1510]/95 to-[#100C09]/95 p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gold uppercase tracking-wider">Featured Course</span>
                    <h3 className="text-sm font-semibold text-parchment">AI Literacy &amp; Vibe Coding</h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={10} /> Active
                </span>
              </div>

              {/* Course Progress Preview */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-parchment/70">
                  <span>Module 1: Prompt Engineering for Leaders</span>
                  <span className="text-gold font-mono">100%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-crest-red to-gold" />
                </div>
              </div>

              {/* Verified Mentor Float Badge */}
              <div className="mt-5 rounded-xl border border-gold/20 bg-black/40 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold to-amber-700 text-xs font-bold text-ink shadow-md">
                      AO
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[9px] ring-2 ring-ink">
                        ✓
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-parchment">Adeola Ogunleye</p>
                      <p className="text-[10px] text-parchment/50">Senior Fellow · UNILAG</p>
                    </div>
                  </div>
                  <span className="rounded-md border border-gold/30 bg-gold/10 px-2 py-1 text-[10px] font-medium text-gold">
                    Available
                  </span>
                </div>
              </div>

              {/* Digital Shield Feature */}
              <div className="mt-4 flex items-center justify-between text-[11px] text-parchment/50 border-t border-white/[0.06] pt-3">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-gold" />
                  Secured Device Activation
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-400" />
                  Instant Mentee Matching
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars (4 Interactive Glass Cards) */}
      <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase font-semibold tracking-widest text-gold">Four Academy Pillars</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-parchment sm:text-4xl">
            Everything you need to lead and succeed
          </h2>
          <p className="mt-3 text-sm text-parchment/65">
            Designed specifically to address academic collaboration, skills training, and peer growth across Nigeria.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Courses */}
          <Link
            href="/courses"
            className="glass-card group flex flex-col justify-between rounded-xl p-6"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-110">
                <BookOpen size={22} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-parchment group-hover:text-gold transition-colors">
                Courses CMS
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/65">
                Master AI literacy, vibe coding, and prompt workflows with modular self-paced lessons.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-gold">
              <span>View catalog</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: Mentorship */}
          <Link
            href="/mentorship/find"
            className="glass-card group flex flex-col justify-between rounded-xl p-6"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-crest-red/30 bg-crest-red/10 text-red-400 transition-transform duration-300 group-hover:scale-110">
                <Users size={22} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-parchment group-hover:text-gold transition-colors">
                1-on-1 Mentorship
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/65">
                Connect directly with verified student and faculty mentors from other universities.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-gold">
              <span>Find mentors</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3: Events */}
          <Link
            href="/events"
            className="glass-card group flex flex-col justify-between rounded-xl p-6"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-110">
                <Calendar size={22} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-parchment group-hover:text-gold transition-colors">
                Campus Events
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/65">
                RSVP for live virtual webinars, technical workshops, and local campus meetups.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-gold">
              <span>See schedule</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 4: Shop */}
          <Link
            href="/shop"
            className="glass-card group flex flex-col justify-between rounded-xl p-6"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-crest-red/30 bg-crest-red/10 text-red-400 transition-transform duration-300 group-hover:scale-110">
                <ShoppingBag size={22} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-parchment group-hover:text-gold transition-colors">
                Digital Shop
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/65">
                Purchase protected academic books and materials with Paystack and device licensing.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-gold">
              <span>Browse store</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* Latest from the Blog */}
      <section className="relative border-t border-white/[0.08] bg-[#0E0B08]/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-semibold tracking-widest text-gold">Insights &amp; Dispatches</p>
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
    </div>
  );
}