import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/dashboard/onboarding-form";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Complete Your Profile | MLA Academy",
  description: "Select your learning pathway, career track, and institution affiliation.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, pathway")
    .eq("id", user.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] || "Scholar";

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800 w-full py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header Banner */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0284C7] mb-3">
            <Sparkles size={12} className="text-[#00D2FF]" />
            <span>Welcome to the Academy</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Welcome, {firstName}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
            Let&apos;s personalize your experience. Choose your career track and affiliate institution so we can recommend the right masterclasses, AI tools, and mentors.
          </p>
        </div>

        {/* Onboarding Form */}
        <OnboardingForm />
      </div>
    </div>
  );
}
