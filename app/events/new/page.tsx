import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/events/event-form";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/events/new");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,institution_id")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "member";
  const canCreate = role === "super_admin" || role === "institution_admin";
  if (!canCreate) redirect("/events");

  // Institutions for Super Admin to scope an event (platform-wide default).
  const { data: institutions } = role === "super_admin"
    ? await supabase.from("institutions").select("id,name").eq("is_active", true).order("name")
    : { data: [] };

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl text-parchment">Create an event</h1>
      <EventForm
        role={role}
        institutions={
          (institutions as { id: string; name: string }[] | null) ?? []
        }
      />
    </div>
  );
}