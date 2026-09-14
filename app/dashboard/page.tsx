import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, institution_id, email_notifications_enabled")
    .eq("id", user.id)
    .single();

  const { data: institution } = profile?.institution_id
    ? await supabase
        .from("institutions")
        .select("name")
        .eq("id", profile.institution_id)
        .single()
    : { data: null };

  const { count: unread } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .eq("is_read", false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-3xl text-parchment">
        Hello, {profile?.full_name?.split(" ")[0] || "there"}
      </h1>
      <p className="mt-2 text-parchment/60">
        {institution?.name ?? "No institution yet"} · {profile?.role}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <DashboardCard
          title="Notifications"
          href="/dashboard/notifications"
          note={unread ? `${unread} unread` : "All caught up"}
        />
        <DashboardCard title="My Learning" href="/dashboard/learning" note="Course progress (Phase 2)" />
        <DashboardCard title="My Requests" href="/dashboard/requests" note="Mentorship + admin requests" />
        <DashboardCard title="My Library" href="/dashboard/library" note="Licences, downloads, device activations" />
        <DashboardCard title="Settings" href="/settings" note="Profile and notification preferences" />
        {profile?.role === "super_admin" && (
          <DashboardCard title="Admin" href="/admin" note="Blog CMS, courses, shop, members" accent />
        )}
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  href,
  note,
  accent,
}: {
  title: string;
  href: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md border p-6 transition-colors hover:border-gold/60 ${
        accent ? "border-gold/40 bg-gold/5" : "border-parchment/10 bg-panel"
      }`}
    >
      <p className="font-display text-xl text-parchment">{title}</p>
      <p className="mt-1 text-sm text-parchment/60">{note}</p>
    </Link>
  );
}