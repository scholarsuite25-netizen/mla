import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavClient, NavLink } from "@/components/nav-client";

const publicLinks: NavLink[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Our Mission", href: "/about", description: "Leadership & career pillars" },
      { label: "Institutions & Hubs", href: "/institutions", description: "Universities & enterprise networks" },
    ],
  },
  {
    label: "Learn",
    href: "/courses",
    children: [
      { label: "Course Catalog", href: "/courses", description: "AI Literacy & Vibe Coding" },
      { label: "My Learning", href: "/dashboard/learning", description: "Continue your modules" },
    ],
  },
  {
    label: "Mentorship",
    href: "/mentorship/find",
    children: [
      { label: "Find a Mentor", href: "/mentorship/find", description: "1-on-1 industry & academic guidance" },
      { label: "Become a Mentor", href: "/mentorship/become", description: "Share expertise with learners" },
      { label: "My Requests", href: "/dashboard/requests", description: "Track mentorship applications" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Events", href: "/events" },
  { label: "Shop", href: "/shop" },
];

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()
    : { data: null };

  const { count: unread } = user
    ? ((await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .eq("is_read", false)) ?? { count: 0 })
    : { count: 0 };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0A0806]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo with Illuminated Crest */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gold/30 bg-gradient-to-br from-[#261D16] to-[#120E0B] shadow-inner transition-transform group-hover:scale-105 group-hover:border-gold/60">
            <span className="h-3 w-3 rotate-45 rounded-xs bg-gradient-to-br from-gold-light to-gold shadow-[0_0_10px_rgba(212,175,55,0.6)]" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-crest-red" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-parchment group-hover:text-gradient-gold">
              MLA
            </span>
            <span className="text-[10px] font-medium tracking-widest uppercase text-parchment/45">
              Academy
            </span>
          </div>
        </Link>

        <NavClient
          links={publicLinks}
          user={user ? { full_name: profile?.full_name ?? "", role: profile?.role ?? "member" } : null}
          unread={unread ?? 0}
        />
      </div>
    </header>
  );
}