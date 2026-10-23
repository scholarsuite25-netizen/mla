import { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { CareersClientHub } from "./client-hub";

export const metadata: Metadata = {
  title: "Career Launchpad & Employability Hub | Free ATS CV Builder & Graduate Trainee Schemes | MLA",
  description:
    "Free ATS-compliant CV builder with 1-click A4 PDF export, curated Nigerian graduate trainee feeds (Access, PwC, MTN, KPMG), and interactive STAR interview preparation scripts.",
  keywords: [
    "ATS CV builder Nigeria",
    "Free CV builder without watermark",
    "Nigerian graduate trainee 2026",
    "Access bank graduate trainee",
    "PwC associate trainee",
    "NYSC CV template",
    "STAR interview questions and answers Nigeria",
    "Maxwell Leadership Academy careers",
  ],
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-900">
      {/* Hero Banner (Biru SaaS Royal Navy) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#120D42] via-[#161152] to-[#241468] text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00D2FF_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#00D2FF]/30 text-xs font-semibold text-[#00D2FF] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            100% Free Career Infrastructure for Nigerian Youths & Job Seekers
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Launch Your Corporate & Tech Career with Verified Proof-of-Work
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Generate an ATS-compliant CV without watermarks, discover verified Nigerian graduate trainee schemes, and master corporate interviews with STAR model answers and S. B. Omotoso&apos;s executive playbooks.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#00D2FF]" /> Zero Watermarks & Subscriptions
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Zap className="w-4 h-4 text-emerald-400" /> 1-Click A4 PDF Export
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-[#00D2FF]" /> Top Nigerian Graduate Schemes
            </span>
          </div>
        </div>
      </section>

      {/* Main Interactive Hub Container (Tabs: CV Builder, Jobs, Interview, Vibe Coding) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CareersClientHub />
      </main>

      {/* Conversion Banner: Lifetime Membership for Accelerated Career Mentorship */}
      <section className="bg-white border-t border-slate-200 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-[#120D42] to-[#241468] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
            <Award className="w-96 h-96 text-[#00D2FF]" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#00D2FF] bg-[#00D2FF]/20 px-3 py-1 rounded-full border border-[#00D2FF]/30">
              <Sparkles className="w-3.5 h-3.5" /> MLA Executive Career Fast-Track
            </span>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-snug">
              Upgrade to the MLA Lifetime Pass (₦20,000 One-Off)
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Gain lifetime access to all upcoming AI Vibe Coding certification cohorts, unlimited digital downloads from our shop, priority 1-on-1 corporate mock interview sessions, and private alumni job referrals.
            </p>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-200 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D2FF] shrink-0" />
                <span>Direct access to S. B. Omotoso and executive alumni across Banking & Tech</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D2FF] shrink-0" />
                <span>Unlimited lifetime access to all digital monographs and slide decks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D2FF] shrink-0" />
                <span>Verified Certificate of Completion with public verification URL</span>
              </li>
            </ul>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00D2FF] hover:bg-[#38BDF8] text-[#120D42] font-bold text-sm shadow-lg transition-all"
              >
                Join with Lifetime Pass (₦20,000) <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/mentorship/find"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
              >
                <Users className="w-4 h-4 text-[#00D2FF]" /> Browse Mentors First
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
