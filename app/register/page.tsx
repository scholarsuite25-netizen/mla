import { RegisterForm } from "@/components/register-form";
import { Sparkles, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Register & Join — MLA Academy",
  description:
    "Join the Mentorship & Leadership Academy. Tailored pathways for working professionals, fresh graduates, job seekers, entrepreneurs, and campus scholars.",
};

export default function RegisterPage() {
  return (
    <div className="relative mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {/* Decorative ambient background */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-b from-[#18120D] to-[#0F0B08] p-8 sm:p-10 shadow-2xl backdrop-blur-md">
        {/* Universal Membership Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
          <Sparkles size={13} />
          <span>Universal Membership · Professionals, Graduates &amp; Scholars</span>
        </div>

        <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight text-parchment">
          Join MLA Academy
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-parchment/70">
          Unlock modern AI literacy, hands-on vibe coding labs, executive &amp; peer mentorship,
          and a curated digital product shop.
        </p>

        {/* Multi-Track Welcoming Banner */}
        <div className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-950/30 p-3.5 text-xs text-parchment/80">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300">
                Tailored for every career stage
              </p>
              <p className="mt-0.5 text-parchment/70">
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