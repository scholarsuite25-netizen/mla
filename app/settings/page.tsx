import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800 w-full py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#0284C7] mb-3">
            <Settings size={20} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Manage your personal profile, notification preferences, and institution affiliation.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
          <SettingsForm
            fullName={profile?.full_name ?? ""}
            emailNotifications={profile?.email_notifications_enabled ?? true}
            institutionName={institution?.name ?? "None"}
          />
        </div>
      </div>
    </div>
  );
}