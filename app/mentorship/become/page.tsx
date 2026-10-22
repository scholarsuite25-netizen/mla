import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BecomeMentorForm } from "@/components/mentorship/become-form";
import { Sparkles, Award } from "lucide-react";

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
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800 w-full py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-2">
            <Sparkles size={12} />
            Faculty &amp; Industry Fellows
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Become a Verified Mentor
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Join Nigeria&apos;s premier network of executive and academic mentors. Guide ambitious scholars, review student vibe-coding projects, and unlock verified leadership credentials.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
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
      </div>
    </div>
  );
}