import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const metadata = {
  title: "S. B. Omotoso, FCIA | Chief Executive, Institution Builder & Digital Transformation Leader",
  description:
    "Official executive profile of S. B. Omotoso, FCIA, MILR, MSc., MNIM. Twice appointed University Registrar, institution builder across 5 universities, and pioneer in AI literacy & Vibe Coding.",
};

const competencies = [
  "Organisational Leadership & Governance",
  "Strategy & Institutional Growth",
  "Regulatory & Government Relations (NUC)",
  "Financial Stewardship & Cost Leadership",
  "Human Capital & Performance Management",
  "Digital Transformation & AI Adoption",
  "Crisis Leadership & Business Continuity",
  "Entrepreneurship & New Ventures",
  "Stakeholder & Public Relations",
];

const institutions = [
  {
    role: "Registrar (Chief Administrative Officer)",
    institution: "Chrisland University, Abeokuta",
    period: "April 2022 – Present",
    highlights: [
      "Provides institution-wide leadership across Registry operations, academic planning, ICT governance, and regulatory compliance.",
      "Champions university-wide AI literacy, digital transformation, and campus technology adoption.",
      "Designed the University's degree certificate in partnership with the Nigeria Security Printing and Minting Office; established the OPAC and Digital Library.",
      "Teaches AI Literacy, Vibe Coding and Engineering, and Web Application Development under the Entrepreneurship Programme.",
    ],
  },
  {
    role: "ICT & Registry Consultant (Part-Time)",
    institution: "Atiba University, Oyo",
    period: "2020 – March 2022",
    highlights: [
      "Reported directly to the Vice-Chancellor on library systems, admission platforms, and NUC accreditation.",
      "Participated in resource verification exercises for 18 academic programmes.",
      "Facilitated the donation of 3,500 library volumes and assisted in establishing the Alumni Association.",
    ],
  },
  {
    role: "Registrar (Chief Administrative Officer)",
    institution: "Dominion University, Ibadan",
    period: "2019 – 2020",
    highlights: [
      "Pioneered the Registry Department from inception, establishing the administrative governance architecture, statutory committees, and staff policies.",
      "Oversaw the successful maiden matriculation ceremony and established the University's official records registry.",
    ],
  },
  {
    role: "Deputy Registrar / Senior Administrator",
    institution: "Bowen University, Iwo",
    period: "2002 – 2018",
    highlights: [
      "Served across Council Affairs, Academic Affairs, and Student Affairs over 16 foundational years.",
      "Recipient of the Vice-Chancellor's Commendation Award (2013) and 10-Year Meritorious Service Award (2012).",
    ],
  },
];

const education = [
  {
    degree: "Master of Science (MSc.) in Industrial Relations & Personnel Management",
    institution: "University of Ibadan, Nigeria",
  },
  {
    degree: "Master of Industrial & Labour Relations (MILR)",
    institution: "University of Ibadan, Nigeria",
  },
  {
    degree: "Bachelor of Arts (Hons.)",
    institution: "University of Ilorin, Nigeria",
  },
];

const memberships = [
  "Fellow, Chartered Institute of Administration — FCIA (2024)",
  "Full Member, Nigerian Institute of Management — MNIM (1993–date)",
  "Association of Registrars of Nigerian Universities (ARNU)",
  "Association of Registrars of Nigerian Private Universities (ARNUM, 2019–date)",
  "Chartered Institute of Personnel Management (CIPMN Educators, 2019–date)",
  "Association of Nigerian University Professional Administrators (ANUPA)",
];

export default function ProfilePage() {
  const whatsappUrl =
    "https://wa.me/2348034710699?text=" +
    encodeURIComponent(
      "Hello S. B. Omotoso! I reviewed your executive profile and would like to inquire about a Speaking / Keynote Engagement or Institutional Advisory."
    );

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800 w-full">
      {/* Royal Navy Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] text-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#00D2FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-[#7C3AED]/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-center">
            {/* Left Column: Intro */}
            <div className="space-y-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-[#00D2FF] uppercase tracking-wider">
                <ShieldCheck size={14} /> Executive Leadership Profile
              </span>

              <div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  S. B. Omotoso
                </h1>
                <p className="font-mono text-sm sm:text-base text-cyan-300 font-semibold mt-1">
                  FCIA │ MILR │ MSc. │ MNIM
                </p>
                <p className="text-xs sm:text-sm text-slate-300 font-medium pt-1">
                  Chief Executive • Institution Builder • Digital Transformation Leader
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                A seasoned chief administrator, institution-builder, and technology-forward executive with over three decades of leadership across higher education, enterprise consultancy, and public service. Twice appointed University Registrar and central contributor to the licensing, accreditation, and operational take-off of five Nigerian universities.
              </p>

              {/* Direct Contact Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#00D2FF]" /> Abeokuta, Nigeria
                </span>
                <a
                  href="mailto:sbomotoso@gmail.com"
                  className="flex items-center gap-1.5 hover:text-[#00D2FF] transition-colors"
                >
                  <Mail size={14} className="text-[#00D2FF]" /> sbomotoso@gmail.com
                </a>
                <a
                  href="tel:08034710699"
                  className="flex items-center gap-1.5 hover:text-[#00D2FF] transition-colors"
                >
                  <Phone size={14} className="text-[#00D2FF]" /> 08034710699 / 08054950445
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  href="/speaking#booking"
                  className="rounded-lg bg-[#00D2FF] px-5 py-3 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all flex items-center gap-2"
                >
                  <Mic size={15} />
                  <span>Invite for Speaking</span>
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-emerald-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition-all flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  <span>Connect on WhatsApp</span>
                </a>

                <Link
                  href="/shop"
                  className="rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-white/15 transition-all flex items-center gap-2"
                >
                  <BookOpen size={15} className="text-[#00D2FF]" />
                  <span>Publications &amp; Notes</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Headshot Photo */}
            <div className="flex justify-center">
              <div className="relative aspect-[4/5] w-full max-w-[280px] rounded-2xl overflow-hidden border-2 border-cyan-400/40 shadow-2xl bg-[#161152]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/speaker-omotoso.jpg"
                  alt="S. B. Omotoso, FCIA"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#120D42] via-[#120D42]/80 to-transparent p-3 text-center">
                  <p className="font-display font-bold text-sm text-white">
                    S. B. Omotoso
                  </p>
                  <p className="text-[10px] text-cyan-300 font-mono">
                    FCIA │ MILR │ MSc. │ MNIM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 space-y-14">
        {/* Executive Core Competencies */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0284C7]">
              Leadership Capabilities
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Executive Core Competencies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {competencies.map((comp, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm hover:border-cyan-400/60 transition-all"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0284C7]">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">{comp}</span>
              </div>
            ))}
          </div>
        </section>

        {/* The Executive Differentiator Card */}
        <section className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-[#120D42] to-[#1A145E] p-8 sm:p-10 text-white space-y-6 shadow-xl">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-widest">
            <Zap size={16} />
            <span>The Rare Executive Differentiator</span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
            Technology &amp; Innovation from the Very Top of the Organisation
          </h3>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
            Unlike traditional chief executives who delegate technology decisions, S. B. Omotoso combines deep governance, regulatory relations, and financial stewardship with the personal capacity to lead digital transformation, architect enterprise software, and pioneer AI adoption firsthand.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-300">Practice-Validated Mastery</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Technical expertise proven through production systems in live institutional use, university-level technology teaching, and sustained executive mentorship.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-300">AI-Assisted Vibe Coding</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Practitioner and educator in AI-assisted software development (&apos;Vibe Coding&apos;); author of structured curricula enabling non-programmers to build production digital systems.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-300">Enterprise Platforms Built</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Independently designed and deployed institutional web applications including the Academic Virtual Library (AVL), MedAssist, ResearchEval Pro, and Smart Library platform.
              </p>
            </div>
          </div>
        </section>

        {/* Career & University Leadership Highlights */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0284C7]">
              Executive Career
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Institution-Builder Across Five Universities
            </h2>
          </div>

          <div className="space-y-5">
            {institutions.map((inst, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-cyan-400/60 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                      {inst.role}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#0284C7] font-semibold mt-0.5">
                      {inst.institution}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-mono text-slate-600 self-start sm:self-auto">
                    {inst.period}
                  </span>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {inst.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#0284C7] mt-1 shrink-0">▪</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education & Qualifications */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#0284C7]">
              <GraduationCap size={20} />
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                Education &amp; Qualifications
              </h3>
            </div>

            <div className="space-y-3">
              {education.map((edu, i) => (
                <div key={i} className="border-b border-slate-100 pb-2.5 last:border-none">
                  <p className="font-bold text-xs sm:text-sm text-slate-900">{edu.degree}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-[#0284C7]">
              <Award size={20} />
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                Governance &amp; Fellowships
              </h3>
            </div>

            <div className="space-y-2.5">
              {memberships.map((mem, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-[#0284C7] mt-0.5">▪</span>
                  <span>{mem}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Bar */}
        <section className="rounded-2xl bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] p-8 sm:p-10 text-center text-white space-y-5 shadow-xl">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Invite S. B. Omotoso for Your Next Event
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto leading-relaxed">
            Available for university matriculation/convocation addresses, corporate executive retreats, AI digital transformation masterclasses, and board advisory.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/speaking#booking"
              className="rounded-lg bg-[#00D2FF] px-6 py-3 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all flex items-center gap-2"
            >
              <Mic size={16} />
              <span>Submit Speaking Invitation</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition-all flex items-center gap-2"
            >
              <MessageCircle size={16} />
              <span>Connect on WhatsApp</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
