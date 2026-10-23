import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPathwayById } from "@/lib/pathways";
import {
  Bell,
  BookOpen,
  Send,
  Download,
  Settings,
  Shield,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Member Dashboard | MLA Academy",
  description: "Access your courses, mentorship sessions, protected toolkit, and settings.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, pathway, institution_id, email_notifications_enabled")
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

  const pathwayInfo = getPathwayById(profile?.pathway);
  const firstName = profile?.full_name?.split(" ")[0] || "Scholar";

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800 w-full py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Profile Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 border border-cyan-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0284C7]">
                <GraduationCap size={11} className="text-[#00D2FF]" />
                <span>{pathwayInfo?.label ?? "Member"}</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">
                {institution?.name ?? "Independent Track"}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Hello, {firstName}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Welcome back to your personalized learning workspace.
            </p>
          </div>

          <Link
            href="/settings"
            className="self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-cyan-300 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Settings size={14} className="text-slate-400" />
            <span>Profile &amp; Settings</span>
          </Link>
        </div>

        {/* Incomplete Pathway Banner (If user skipped onboarding) */}
        {!profile?.pathway && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-cyan-300/70 bg-gradient-to-r from-cyan-50 via-white to-blue-50/50 p-5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 shadow-sm">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Choose Your Academy Career Track
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Select your background (Corporate, Graduate, Founder, Retiree, or Student) to unlock tailored course recommendations and mentor cohorts.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/onboarding"
              className="shrink-0 rounded-xl bg-[#00D2FF] px-4 py-2.5 text-xs font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>Select Track</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Dashboard Navigation Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardCard
            icon={Bell}
            title="Notifications"
            href="/dashboard/notifications"
            note={unread ? `${unread} unread updates` : "All caught up"}
            highlight={Boolean(unread)}
          />

          <DashboardCard
            icon={BookOpen}
            title="My Learning"
            href="/dashboard/learning"
            note="Course progress & enrolled tracks"
          />

          <DashboardCard
            icon={Send}
            title="My Requests"
            href="/dashboard/requests"
            note="1-on-1 mentorship & advisory requests"
          />

          <DashboardCard
            icon={Download}
            title="My Library"
            href="/dashboard/library"
            note="Digital toolkits, notes & licenses"
          />

          <DashboardCard
            icon={Settings}
            title="Account Settings"
            href="/settings"
            note="Profile, track, and notification settings"
          />

          {profile?.role === "super_admin" && (
            <DashboardCard
              icon={Shield}
              title="Admin Portal"
              href="/admin"
              note="Full academy administration & CMS"
              accent
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  icon: Icon,
  title,
  href,
  note,
  accent,
  highlight,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  href: string;
  note: string;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all shadow-sm ${
        accent
          ? "border-cyan-300 bg-gradient-to-br from-cyan-50/60 to-blue-50/60 hover:border-cyan-400 hover:shadow-md"
          : "border-slate-200/90 bg-white hover:border-cyan-300 hover:shadow-md"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
          accent
            ? "bg-[#00D2FF] text-[#0A0E2A]"
            : highlight
            ? "bg-cyan-50 text-[#0284C7]"
            : "bg-slate-100 text-slate-600 group-hover:bg-cyan-50 group-hover:text-[#0284C7]"
        }`}
      >
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors">
            {title}
          </p>
          <ArrowRight
            size={14}
            className="text-slate-300 group-hover:text-[#0284C7] group-hover:translate-x-0.5 transition-all"
          />
        </div>
        <p className="mt-1 text-xs text-slate-500 truncate">{note}</p>
      </div>
    </Link>
  );
}