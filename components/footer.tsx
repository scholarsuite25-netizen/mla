import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewsletterForm } from "@/components/newsletter-form";
import { Building2, Mail, Sparkles, ArrowRight } from "lucide-react";

export async function Footer() {
  const supabase = await createClient();
  const { count: institutionCount } = await supabase
    .from("institutions")
    .select("id", { count: "exact", head: true });

  return (
    <footer className="border-t border-white/[0.08] bg-[#0A0806] text-parchment">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/30 bg-gradient-to-br from-[#261D16] to-[#120E0B] shadow-inner">
                <span className="h-2.5 w-2.5 rotate-45 rounded-xs bg-gold shadow-[0_0_8px_rgba(212,175,55,0.7)]" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-parchment group-hover:text-gold transition-colors">
                MLA Academy
              </span>
            </Link>

            <p className="max-w-sm text-xs leading-relaxed text-parchment/65">
              The Mentorship &amp; Leadership Academy empowers students and faculty
              across Nigerian higher institutions with modern AI literacy, hands-on
              vibe coding, cross-campus mentorship, and protected educational tools.
            </p>

            <div className="pt-1">
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold-light transition-colors"
              >
                <span>Read our founding mission</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <p className="font-display text-sm font-bold tracking-wide text-parchment uppercase">
              Explore
            </p>
            <FooterLinks
              links={[
                { label: "Course Catalog", href: "/courses" },
                { label: "Academy Blog", href: "/blog" },
                { label: "Campus Events", href: "/events" },
                { label: "Digital Shop", href: "/shop" },
              ]}
            />
          </div>

          {/* Mentorship Column */}
          <div>
            <p className="font-display text-sm font-bold tracking-wide text-parchment uppercase">
              Mentorship
            </p>
            <FooterLinks
              links={[
                { label: "Find a Mentor", href: "/mentorship/find" },
                { label: "Become a Mentor", href: "/mentorship/become" },
                { label: "Institution Directory", href: "/institutions" },
                { label: "Request Admin Access", href: "/dashboard/requests" },
              ]}
            />
          </div>

          {/* Newsletter Column */}
          <div>
            <div className="flex items-center gap-1.5 text-gold text-xs uppercase font-semibold tracking-wider">
              <Sparkles size={14} />
              <span>Newsletter</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-parchment/65">
              Receive notifications when new courses and dispatches go live. No spam.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Bar with Credibility Ticker */}
        <div className="mt-14 border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-parchment/50">
          <p>© {new Date().getFullYear()} MLA — Mentorship &amp; Leadership Academy. All rights reserved.</p>

          <div className="flex items-center gap-4">
            {institutionCount !== null && (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Building2 size={12} />
                <span>{institutionCount} Active Institutions</span>
              </span>
            )}
            <a
              href="mailto:hello@mla.org.ng"
              className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <Mail size={12} />
              <span>hello@mla.org.ng</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="mt-4 space-y-2 text-xs text-parchment/65">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="transition-colors hover:text-gold"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}