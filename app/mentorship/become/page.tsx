import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BecomeMentorForm } from "@/components/mentorship/become-form";

export const dynamic = "force-dynamic";

export default async function BecomeMentorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mentorship/become");

  const { data: mentor } = await supabase
    .from("mentor_profiles")
    .select("bio, availability, is_active, expertise_tags")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <p className="text-xs uppercase tracking-widest text-gold">Mentorship</p>
      <h1 className="mt-2 font-display text-4xl text-parchment">Become a Mentor</h1>
      <p className="mt-3 text-parchment/70">
        Add yourself to the public mentor directory. Students from any
        institution can request you; you accept, then MLA gives final approval.
      </p>

      <BecomeMentorForm
        current={
          mentor
            ? {
                bio: mentor.bio,
                availability: mentor.availability ?? "",
                tags: mentor.expertise_tags ?? [],
                isActive: mentor.is_active ?? true,
              }
            : null
        }
      />
    </div>
  );
}