import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavClient, NavLink } from "@/components/nav-client";

const publicLinks: NavLink[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Our Mission", href: "/about" },
      { label: "Institutions", href: "/institutions" },
    ],
  },
  {
    label: "Learn",
    href: "/courses",
    children: [
      { label: "Course Catalog", href: "/courses" },
      { label: "My Learning", href: "/dashboard/learning" },
    ],
  },
  {
    label: "Mentorship",
    href: "/mentorship/find",
    children: [
      { label: "Find a Mentor", href: "/mentorship/find" },
      { label: "Become a Mentor", href: "/mentorship/become" },
      { label: "My Requests", href: "/dashboard/requests" },
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
    <header className="sticky top-0 z-50 border-b border-parchment/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl text-parchment">
          <span className="inline-block h-2.5 w-2.5 rotate-45 bg-gold" aria-hidden />
          MLA
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