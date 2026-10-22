import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/register-form";
import { Sparkles, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Register & Join — MLA Academy",
  description:
    "Join the Mentorship & Leadership Academy. Tailored pathways for working professionals, fresh graduates, job seekers, entrepreneurs, and campus scholars.",
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
    <div className="min-h-screen bg-[#FAFAFD] flex items-center justify-center px-4 py-14 sm:px-6">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200/90 bg-white p-7 sm:p-10 shadow-lg">
        {/* Universal Membership Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-50 px-3 py-1 text-xs font-semibold text-[#0284C7]">
          <Sparkles size={12} />
          <span>Universal Membership · Professionals, Graduates &amp; Scholars</span>
        </div>

        <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Join MLA Academy
        </h1>

        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">
          Unlock modern AI literacy, hands-on vibe coding labs, executive &amp; peer mentorship,
          and a curated digital product shop.
        </p>

        {/* Multi-Track Welcoming Banner */}
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-800">
                Tailored for every career stage
              </p>
              <p className="mt-0.5 text-slate-600">
                Whether you are a working professional, fresh graduate, job seeker, entrepreneur,
                or campus student, MLA provides direct access to dedicated mentors, tools, and cohorts.
              </p>
            </div>
          </div>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}