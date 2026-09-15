import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewsletterForm } from "@/components/newsletter-form";
import {
  Building2,
  Mail,
  Sparkles,
  ArrowRight,
  Phone,
  MessageCircle,
  Users,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

export async function Footer() {
  const supabase = await createClient();
  const { count: institutionCount } = await supabase
    .from("institutions")
    .select("id", { count: "exact", head: true });

  const phoneNumber = "2348034710699";
  const formattedPhone = "+234 803 471 0699";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    "Hello MLA Academy, I would like to inquire about courses, mentorship, and membership."
  )}`;

  return (
    <footer className="relative mt-20 border-t-2 border-gold/40 bg-gradient-to-b from-[#140E0A] via-[#0D0A08] to-[#070504] text-parchment overflow-hidden">
      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-3/4 max-w-4xl bg-gradient-to-r from-transparent via-gold to-transparent opacity-80 shadow-[0_0_25px_rgba(212,175,55,0.9)]" />

      {/* Decorative Radial Lighting */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-gold/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-crest-red/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8">
        {/* UPPER CALLOUT: Non-Tertiary Membership & Helpline Cards */}
        <div className="mb-14 grid gap-6 lg:grid-cols-3">
          {/* Card 1: Inclusive Multitrack Pathway Notice */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-[#1C140E] to-[#120D09] p-6 shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 h-36 w-36 rounded-full bg-gold/10 blur-2xl" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-gold shadow-inner">
                <Users size={26} />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Inclusive Multitrack Academy
                </div>
                <h4 className="mt-2 font-display text-lg font-bold text-parchment">
                  Tailored for professionals, graduates, founders &amp; scholars
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-parchment/70">
                  Whether you are in the corporate working class, a fresh graduate or NYSC fellow, a job seeker
                  switching to tech, a self-employed founder, or a campus student — MLA provides dedicated
                  learning tracks, 1-on-1 mentorship, and vibe coding capabilities.
                </p>
              </div>
              <div className="shrink-0 pt-2 sm:pt-0">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-ink shadow-[0_4px_15px_rgba(212,175,55,0.3)] transition-all hover:bg-gold-light hover:scale-105"
                >
                  <span>Explore Your Track</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: 24/7 Helpline & Concierge (Click-to-Call & WhatsApp) */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#16100B] p-6 shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
                  Direct Support Concierge
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="mt-1.5 text-xs text-parchment/70">
                Need immediate help with enrollment, payments, or mentor matching?
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-center transition-all hover:border-emerald-400 hover:bg-emerald-900/50 hover:scale-[1.02]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                  <MessageCircle size={16} />
                </div>
                <span className="text-xs font-bold text-emerald-400">WhatsApp</span>
                <span className="text-[10px] text-parchment/60">Chat live</span>
              </a>

              {/* Direct Call Button */}
              <a
                href={`tel:+${phoneNumber}`}
                className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gold/30 bg-amber-950/40 p-3 text-center transition-all hover:border-gold hover:bg-amber-900/50 hover:scale-[1.02]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-ink shadow-[0_0_12px_rgba(212,175,55,0.5)]">
                  <Phone size={15} />
                </div>
                <span className="text-xs font-bold text-gold">Call Helpline</span>
                <span className="text-[10px] font-mono text-parchment/70">{formattedPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* MAIN COLUMNS GRID */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-br from-[#2D2118] to-[#120D09] shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                <span className="h-3 w-3 rotate-45 rounded-xs bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
              </div>
              <div>
                <span className="font-display text-xl font-bold tracking-tight text-parchment group-hover:text-gold transition-colors">
                  MLA Academy
                </span>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gold/80">
                  Mentorship &amp; Leadership Academy
                </p>
              </div>
            </Link>

            <p className="max-w-sm text-xs leading-relaxed text-parchment/65">
              Empowering working professionals, fresh graduates, job seekers, entrepreneurs, and
              campus scholars across Nigeria with applied AI literacy, vibe coding capabilities, verified
              industry mentorship, and protected digital toolkits.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-parchment/80">
                <ShieldCheck size={12} className="text-gold" />
                <span>Verified Mentorship</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-parchment/80">
                <GraduationCap size={12} className="text-crest-red" />
                <span>Corporate, Graduate &amp; Campus Tracks</span>
              </span>
            </div>
          </div>

          {/* Academics Column */}
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-gold">
              Academics &amp; Tech
            </p>
            <FooterLinks
              links={[
                { label: "Course Catalog", href: "/courses" },
                { label: "AI & Vibe Coding", href: "/courses" },
                { label: "Academy Blog & Dispatches", href: "/blog" },
                { label: "Campus Events & Hackathons", href: "/events" },
                { label: "Digital Learning Shop", href: "/shop" },
              ]}
            />
          </div>

          {/* Mentorship & Network Column */}
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-gold">
              Mentorship Network
            </p>
            <FooterLinks
              links={[
                { label: "Find a Mentor", href: "/mentorship/find" },
                { label: "Become a Verified Mentor", href: "/mentorship/become" },
                { label: "Institutions Directory", href: "/institutions" },
                { label: "Independent Scholar Track", href: "/register" },
                { label: "Faculty & Campus Access", href: "/dashboard/requests" },
              ]}
            />
          </div>

          {/* Newsletter Column */}
          <div>
            <div className="flex items-center gap-1.5 text-gold text-xs uppercase font-bold tracking-wider">
              <Sparkles size={14} />
              <span>Academy Dispatch</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-parchment/65">
              Subscribe to get notified when new AI workshops, scholarships, and course materials go live.
            </p>
            <div className="mt-3">
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* BOTTOM ACCREDITATION & LEGAL BAR */}
        <div className="mt-14 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-parchment/50">
          <p>© {new Date().getFullYear()} MLA — Mentorship &amp; Leadership Academy. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4">
            {institutionCount !== null && (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Building2 size={12} />
                <span>{institutionCount} Partner Institutions &amp; Networks</span>
              </span>
            )}

            <a
              href={`tel:+${phoneNumber}`}
              className="inline-flex items-center gap-1.5 text-parchment/70 hover:text-gold transition-colors font-mono"
            >
              <Phone size={12} className="text-gold" />
              <span>{formattedPhone}</span>
            </a>

            <a
              href="mailto:enquiries@mla.org.ng"
              className="inline-flex items-center gap-1.5 text-parchment/70 hover:text-gold transition-colors"
            >
              <Mail size={12} />
              <span>enquiries@mla.org.ng</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="mt-4 space-y-2.5 text-xs text-parchment/65">
      {links.map((link) => (
        <li key={link.href + link.label}>
          <Link
            href={link.href}
            className="transition-colors hover:text-gold flex items-center gap-1.5 group"
          >
            <span className="h-1 w-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors" />
            <span>{link.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}