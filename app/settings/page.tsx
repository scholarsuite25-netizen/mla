import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";

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
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl text-parchment">Settings</h1>
      <SettingsForm
        fullName={profile?.full_name ?? ""}
        emailNotifications={profile?.email_notifications_enabled ?? true}
        institutionName={institution?.name ?? "None"}
      />
    </div>
  );
}