import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewsletterForm } from "@/components/newsletter-form";

export async function Footer() {
  const supabase = await createClient();
  const { count: institutionCount } = await supabase
    .from("institutions")
    .select("id", { count: "exact", head: true });

  return (
    <footer className="border-t border-parchment/10 bg-panel">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl text-parchment">About MLA</p>
          <p className="mt-3 max-w-sm text-sm text-parchment/70">
            Mentorship &amp; Leadership Academy — helping students across
            Nigerian higher institutions learn modern skills, learn with
            mentors, and lead.
          </p>
          <Link href="/about" className="mt-4 inline-block text-sm text-gold hover:underline">
            Read our mission →
          </Link>
        </div>

        <div>
          <p className="font-display text-lg text-parchment">Explore</p>
          <FooterLinks
            links={[
              { label: "Courses", href: "/courses" },
              { label: "Blog", href: "/blog" },
              { label: "Events", href: "/events" },
              { label: "Shop", href: "/shop" },
            ]}
          />
        </div>

        <div>
          <p className="font-display text-lg text-parchment">Mentorship</p>
          <FooterLinks
            links={[
              { label: "Find a Mentor", href: "/mentorship/find" },
              { label: "Become a Mentor", href: "/mentorship/become" },
            ]}
          />
        </div>

        <div>
          <p className="font-display text-lg text-parchment">For Institutions</p>
          <FooterLinks
            links={[
              { label: "Join MLA", href: "/register" },
              { label: "Request Institution Admin", href: "/dashboard/requests" },
            ]}
          />
        </div>

        <div className="lg:col-span-2">
          <p className="font-display text-lg text-parchment">Newsletter</p>
          <p className="mt-3 text-sm text-parchment/70">
            Occasional notes when new courses and posts go live. No spam.
          </p>
          <NewsletterForm />
        </div>

        <div>
          <p className="font-display text-lg text-parchment">Contact</p>
          <p className="mt-3 text-sm text-parchment/70">hello@mla.org.ng</p>
          <div className="mt-3 flex gap-3 text-sm text-parchment/70">
            <a href="#" className="hover:text-gold">X</a>
            <a href="#" className="hover:text-gold">Instagram</a>
            <a href="#" className="hover:text-gold">LinkedIn</a>
          </div>
        </div>
      </div>

      <div className="border-t border-parchment/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-parchment/50 sm:flex-row">
          <p>© {new Date().getFullYear()} MLA — Mentorship &amp; Leadership Academy.</p>
          {institutionCount !== null && (
            <p>{institutionCount} institution{institutionCount === 1 ? "" : "s"} active on the platform</p>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="mt-3 space-y-2 text-sm text-parchment/70">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="hover:text-gold">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}