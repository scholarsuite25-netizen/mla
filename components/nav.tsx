import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavClient, NavLink } from "@/components/nav-client";

const publicLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Profile", href: "/profile" },
  {
    label: "About us",
    href: "/about",
    children: [
      { label: "Our Mission", href: "/about", description: "Academy vision, governance & leadership" },
      { label: "Executive Profile", href: "/profile", description: "S. B. Omotoso, FCIA — Leadership & Achievements" },
    ],
  },
  {
    label: "Services",
    href: "/courses",
    children: [
      { label: "AI & Vibe Coding", href: "/courses", description: "Applied AI literacy, agentic automation & coding" },
      { label: "Course Catalog", href: "/courses", description: "Executive leadership & career acceleration syllabi" },
      { label: "Digital Toolkits", href: "/shop", description: "Keynote notes, slides & licensed materials" },
      { label: "Downloads", href: "/dashboard/library", description: "Access purchased notes & watermarked PDFs" },
    ],
  },
  {
    label: "Community",
    href: "/forum",
    children: [
      { label: "Forum", href: "/forum", description: "Peer discussions, career scenarios & study groups" },
      { label: "Notices", href: "/notices", description: "Official bulletins, schedule alerts & memos" },
      { label: "Institutions", href: "/institutions", description: "50+ partner university hubs & networks" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact us", href: "/speaking" },
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#140F47]/95 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with Modern Biru-Style Cyan Badge */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#00A3FF] to-[#00E5FF] shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-transform group-hover:scale-105">
            <span className="font-display text-xl font-black text-[#0A0E2A] lowercase tracking-tighter">
              m
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#140F47] border-2 border-[#00E5FF]" />
          </div>
          <div className="flex items-baseline">
            <span className="font-display text-2xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              mla
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