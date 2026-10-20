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
    <div className="min-h-screen bg-ink w-full">
      {/* Top Banner */}
      <div className="w-full bg-[#18110C] py-2.5 px-4 text-center border-b border-white/5">
        <p className="text-xs sm:text-sm text-parchment/80 font-medium flex items-center justify-center gap-2">
          <Mic size={15} className="text-gold" />
          <span>Official Speaking &amp; Keynote Portal for S. B. Omotoso, FCIA</span>
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16 space-y-16">
        {/* Executive Hero with Photograph */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#120D09] via-[#0E0A07] to-black border border-gold/20 p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gold">
                <Sparkles size={14} /> Keynote Speaker · Institution Builder · Executive Advisor
              </span>

              <div className="space-y-2">
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-parchment leading-[1.1]">
                  S. B. Omotoso
                </h1>
                <p className="font-mono text-sm sm:text-base text-gold tracking-wide">
                  FCIA │ MILR │ MSc. │ MNIM
                </p>
                <p className="text-sm sm:text-base text-parchment/80 font-medium pt-1">
                  Twice Appointed University Registrar • AI Literacy &amp; Vibe Coding Pioneer
                </p>
              </div>

              <p className="text-base sm:text-lg text-parchment/70 font-light leading-relaxed max-w-2xl">
                Delivering content-rich, practice-validated keynotes on institutional governance, enterprise AI adoption, and strategic leadership. Equipping executive audiences with pragmatic blueprints born from over three decades of university take-offs and corporate consultancy.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#booking"
                  className="rounded-full bg-gradient-to-r from-gold-dark to-gold px-8 py-4 font-bold text-ink shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] transition-all flex items-center gap-2 text-sm"
                >
                  <Mic size={17} />
                  <span>Request Speaking Availability</span>
                  <ArrowRight size={18} />
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#25D366] px-6 py-4 font-bold text-white shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:bg-[#1EBE5D] transition-all flex items-center gap-2 text-sm"
                >
                  <MessageCircle size={18} />
                  <span>Instant WhatsApp Inquiry</span>
                </a>

                <Link
                  href="/profile"
                  className="rounded-full bg-white/5 border border-white/10 px-6 py-4 font-semibold text-parchment hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                >
                  <span>View Full Executive CV</span>
                </Link>
              </div>
            </div>

            {/* Right: Speaker Photograph */}
            <div className="flex justify-center">
              <div className="relative aspect-[4/5] w-full max-w-[300px] rounded-3xl overflow-hidden border-2 border-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.25)] bg-[#1A140F]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/speaker-omotoso.jpg"
                  alt="S. B. Omotoso"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 text-center">
                  <p className="font-display font-bold text-sm text-parchment">
                    S. B. Omotoso
                  </p>
                  <p className="text-[10px] text-gold font-mono uppercase tracking-wider">
                    Official Speaker Profile
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Speaker Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#140F0B] p-5 text-center">
            <p className="font-display text-3xl font-bold text-gold">5 Universities</p>
            <p className="text-xs text-parchment/60 mt-1">Licensing &amp; Administrative Take-Off</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#140F0B] p-5 text-center">
            <p className="font-display text-3xl font-bold text-gold">2x Registrar</p>
            <p className="text-xs text-parchment/60 mt-1">Chief Administrative Officer</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#140F0B] p-5 text-center">
            <p className="font-display text-3xl font-bold text-gold">30+ Years</p>
            <p className="text-xs text-parchment/60 mt-1">Executive Leadership &amp; Advisory</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#140F0B] p-5 text-center">
            <p className="font-display text-3xl font-bold text-gold">FCIA · MNIM</p>
            <p className="text-xs text-parchment/60 mt-1">Chartered Administration Fellow</p>
          </div>
        </div>

        {/* Signature Keynote Topics */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                Curated Presentations
              </span>
              <h2 className="font-display text-3xl text-parchment mt-1">
                Signature Keynote Topics
              </h2>
            </div>
            <p className="text-xs text-parchment/50 max-w-xs">
              Every presentation is customized with companion lecture notes, presentation slides, and actionable checklists for your attendees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topics.map((topic, i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-[#140F0B] p-6 sm:p-8 flex flex-col justify-between hover:border-gold/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all group"
              >
                <div className="space-y-4">
                  <span className="inline-block rounded-full bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
                    {topic.tag}
                  </span>
                  <h3 className="font-display text-xl text-parchment group-hover:text-gold transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-parchment/65 font-light leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-parchment/40 font-semibold mb-2">
                    Key Outcomes:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.outcomes.map((o, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-white/5 px-2.5 py-1 text-[11px] text-parchment/80 font-medium"
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
        <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-[#16100B] to-[#100C08] p-8 sm:p-12 space-y-6">
          <h3 className="font-display text-2xl text-parchment flex items-center gap-2">
            <Award size={24} className="text-gold" />
            <span>The Executive Speaker Standard: What Event Planners Receive</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            <div className="space-y-2">
              <CheckCircle2 size={18} className="text-gold" />
              <h4 className="font-bold text-sm text-parchment">Pre-Event Alignment</h4>
              <p className="text-xs text-parchment/60 leading-relaxed">
                A dedicated discovery briefing to align key presentation themes directly with your committee&apos;s objectives.
              </p>
            </div>

            <div className="space-y-2">
              <CheckCircle2 size={18} className="text-gold" />
              <h4 className="font-bold text-sm text-parchment">Custom Presentation Slides</h4>
              <p className="text-xs text-parchment/60 leading-relaxed">
                Bespoke high-contrast slide deck (.pptx) formatted for flawless projection and AV tech compatibility.
              </p>
            </div>

            <div className="space-y-2">
              <CheckCircle2 size={18} className="text-gold" />
              <h4 className="font-bold text-sm text-parchment">Attendee Lecture Bundles</h4>
              <p className="text-xs text-parchment/60 leading-relaxed">
                Companion lecture notes, frameworks, and scannable QR download codes for all attendees.
              </p>
            </div>

            <div className="space-y-2">
              <CheckCircle2 size={18} className="text-gold" />
              <h4 className="font-bold text-sm text-parchment">Interactive Q&amp;A</h4>
              <p className="text-xs text-parchment/60 leading-relaxed">
                High-engagement audience interaction, executive roundtables, and VIP photo sessions included.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form Section */}
        <div id="booking" className="scroll-mt-24 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              Direct Speaking Inquiry
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-parchment">
              Invite S. B. Omotoso to Speak
            </h2>
            <p className="text-xs sm:text-sm text-parchment/60">
              Submit your event details below or connect immediately via WhatsApp for expedited scheduling.
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-[#120D09] p-6 sm:p-10 shadow-2xl">
            <SpeakingBookingForm />
          </div>
        </div>
      </div>
    </div>
  );
}
