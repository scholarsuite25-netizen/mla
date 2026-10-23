import Link from "next/link";
import {
  Mic,
  Sparkles,
  Award,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { SpeakingBookingForm } from "@/components/speaking/booking-form";

export const metadata = {
  title: "Invite S. B. Omotoso for Speaking Engagements | Keynotes & Executive Advisory",
  description:
    "Official keynote and speaking invitation portal for S. B. Omotoso, FCIA, MILR, MSc., MNIM. Twice appointed University Registrar, institution builder across 5 universities, and pioneer in AI literacy & Vibe Coding.",
};

const topics = [
  {
    title: "Institutional Governance, Crisis Leadership & Regulatory Take-Off",
    tag: "Higher Education / Enterprise Summit",
    summary:
      "Drawing from hands-on leadership across 5 university take-offs, NUC licensing, and steering Dominion University through an uninterrupted 100% online academic year during COVID-19. Focuses on institutional resilience, regulatory compliance, and cost leadership through direct delivery.",
    outcomes: ["Governance Architectures", "Crisis Continuity", "Regulatory (NUC) Compliance"],
  },
  {
    title: "AI Literacy, Vibe Coding & Enterprise Digital Transformation",
    tag: "Corporate Tech Summit / Keynote",
    summary:
      "A pragmatic keynote by an active practitioner and educator in AI-assisted development. Explores how non-technical founders, universities, and corporate executives can deploy production-grade software and train workforce pipelines in generative AI.",
    outcomes: ["Agentic AI Workflows", "Vibe Coding Pipelines", "Workforce Upskilling"],
  },
  {
    title: "Strategic Career Success, Financial Stewardship & Comfortable Retirement",
    tag: "Annual General Meeting / Professional Retreat",
    summary:
      "Synthesizing principles from the published book 'Guide to Career Success and Comfortable Retirement'. Addresses long-term personal capacity building, institutional stewardship, ethical governance, and strategic wealth preservation.",
    outcomes: ["Career Blueprints", "Fiduciary Stewardship", "Post-Service Transition"],
  },
];

export default function SpeakingPage() {
  const whatsappUrl =
    "https://wa.me/2348034710699?text=" +
    encodeURIComponent(
      "Hello S. B. Omotoso! We are inquiring about your availability for a Speaking / Keynote Engagement on behalf of [Organization]. Here are our preliminary details:"
    );

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800 w-full">
      {/* Top Banner */}
      <div className="w-full bg-[#120D42] py-2 px-4 text-center border-b border-white/10 text-white">
        <p className="text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
          <Mic size={14} className="text-[#00D2FF]" />
          <span>Official Speaking &amp; Keynote Portal for S. B. Omotoso, FCIA</span>
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14 space-y-12">
        {/* Executive Hero with Photograph */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] text-white p-8 sm:p-12 shadow-xl">
          <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#00D2FF]/20 blur-3xl" />
          <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-[#7C3AED]/25 blur-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#00D2FF]">
                <Sparkles size={12} /> Keynote Speaker · Institution Builder · Executive Advisor
              </span>

              <div className="space-y-1">
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white font-bold tracking-tight leading-tight">
                  S. B. Omotoso
                </h1>
                <p className="font-mono text-xs sm:text-sm text-[#00D2FF] tracking-wide font-semibold">
                  FCIA │ MILR │ MSc. │ MNIM
                </p>
                <p className="text-xs sm:text-sm text-slate-300 font-medium pt-0.5">
                  Twice Appointed University Registrar • AI Literacy &amp; Vibe Coding Pioneer
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                Delivering content-rich, practice-validated keynotes on institutional governance, enterprise AI adoption, and strategic leadership. Equipping executive audiences with pragmatic blueprints born from over three decades of university take-offs and corporate consultancy.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#booking"
                  className="rounded-lg bg-[#00D2FF] px-6 py-2.5 font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <Mic size={15} />
                  <span>Request Speaking Availability</span>
                  <ArrowRight size={15} />
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[#25D366] px-5 py-2.5 font-bold text-white shadow-md hover:bg-[#1EBE5D] transition-all flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <MessageCircle size={15} />
                  <span>Instant WhatsApp Inquiry</span>
                </a>

                <Link
                  href="/profile"
                  className="rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 font-semibold text-white hover:bg-white/15 transition-all flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <span>View Full Executive CV</span>
                </Link>
              </div>
            </div>

            {/* Right: Speaker Photograph */}
            <div className="flex justify-center">
              <div className="relative aspect-[4/5] w-full max-w-[280px] rounded-2xl overflow-hidden border-2 border-cyan-400/30 shadow-xl bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/speaker-omotoso.jpg"
                  alt="S. B. Omotoso"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 text-center">
                  <p className="font-display font-bold text-xs text-white">
                    S. B. Omotoso
                  </p>
                  <p className="text-[10px] text-[#00D2FF] font-mono uppercase tracking-wider">
                    Official Speaker Profile
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Speaker Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-sm">
            <p className="font-display text-2xl font-bold text-[#0284C7]">5 Universities</p>
            <p className="text-xs text-slate-500 mt-0.5">Licensing &amp; Administrative Take-Off</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-sm">
            <p className="font-display text-2xl font-bold text-[#0284C7]">2x Registrar</p>
            <p className="text-xs text-slate-500 mt-0.5">Chief Administrative Officer</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-sm">
            <p className="font-display text-2xl font-bold text-[#0284C7]">30+ Years</p>
            <p className="text-xs text-slate-500 mt-0.5">Executive Leadership &amp; Advisory</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-sm">
            <p className="font-display text-2xl font-bold text-[#0284C7]">FCIA · MNIM</p>
            <p className="text-xs text-slate-500 mt-0.5">Chartered Administration Fellow</p>
          </div>
        </div>

        {/* Signature Keynote Topics */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">
                Curated Presentations
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                Signature Keynote Topics
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xs">
              Every presentation is customized with companion lecture notes, presentation slides, and actionable checklists for your attendees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topics.map((topic, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between hover:border-cyan-400/60 hover:shadow-md transition-all shadow-sm group"
              >
                <div className="space-y-3">
                  <span className="inline-block rounded-full bg-cyan-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0284C7] border border-cyan-200">
                    {topic.tag}
                  </span>
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Key Outcomes:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.outcomes.map((o, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 font-medium"
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What Event Planners Receive Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 space-y-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award size={20} className="text-[#0284C7]" />
            <span>The Executive Speaker Standard: What Event Planners Receive</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-1">
            <div className="space-y-1.5">
              <CheckCircle2 size={16} className="text-[#0284C7]" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Pre-Event Alignment</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                A dedicated discovery briefing to align key presentation themes directly with your committee&apos;s objectives.
              </p>
            </div>

            <div className="space-y-1.5">
              <CheckCircle2 size={16} className="text-[#0284C7]" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Custom Presentation Slides</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bespoke high-contrast slide deck (.pptx) formatted for flawless projection and AV tech compatibility.
              </p>
            </div>

            <div className="space-y-1.5">
              <CheckCircle2 size={16} className="text-[#0284C7]" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Attendee Lecture Bundles</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Companion lecture notes, frameworks, and scannable QR download codes for all attendees.
              </p>
            </div>

            <div className="space-y-1.5">
              <CheckCircle2 size={16} className="text-[#0284C7]" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Interactive Q&amp;A</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                High-engagement audience interaction, executive roundtables, and VIP photo sessions included.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form Section */}
        <div id="booking" className="scroll-mt-24 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
              Official Speaking Inquiries &amp; Keynote Bookings
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Invite S. B. Omotoso to Speak
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Connect directly via WhatsApp for instant scheduling checks, or submit your comprehensive event brief below.
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-lg">
            <SpeakingBookingForm />
          </div>
        </div>
      </div>
    </div>
  );
}
