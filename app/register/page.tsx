import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/register-form";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Join MLA Academy | Fast Member Registration",
  description:
    "Join the Mentorship & Leadership Academy. Fast sign up for working professionals, fresh graduates, job seekers, entrepreneurs, and scholars.",
};

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFD] flex items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-10 shadow-[0_20px_50px_rgba(18,13,66,0.06)]">
        {/* Universal Membership Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-50 px-3 py-1 text-xs font-semibold text-[#0284C7]">
          <Sparkles size={12} className="text-[#00D2FF]" />
          <span>Universal Membership</span>
        </div>

        <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create Your Member Account
        </h1>

        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">
          Join Nigeria&apos;s premier academy for applied AI literacy, executive mentorship, and career acceleration.
        </p>

        {/* 3-Field Clean Register Form */}
        <RegisterForm />
      </div>
    </div>
  );
}