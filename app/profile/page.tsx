import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  ShieldCheck,
  Sparkles,
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
    period: "November 2019 – October 2020",
    highlights: [
      "Established the Registry from inception, recruited take-off academic and administrative staff, and structured units.",
      "Deployed campus-wide 40Mbps networking and fully operational LMS.",
      "Crisis Leadership: Led the University through two complete semesters delivered entirely online during the 2020 COVID-19 lockdown without disruption to a single student.",
    ],
  },
  {
    role: "Deputy Registrar & Ag. Director, ICT",
    institution: "Edwin Clark University, Kiagbodo, Delta State",
    period: "June 2014 – October 2019",
    highlights: [
      "Sole administrative officer during the pre-take-off phase (2014–2015); built the Registry, admissions, labs, and libraries contributing to operational licensing on 7 May 2015.",
      "Concurrently directed HR, Senate/Exams, Admissions, and Public Relations.",
      "Deployed ICT infrastructure supporting full NUC accreditation of all presented programmes in 2018.",
    ],
  },
  {
    role: "Principal Assistant Registrar (Multiple Portfolios)",
    institution: "Bowen University, Iwo, Osun State",
    period: "May 2002 – June 2014",
    highlights: [
      "Foundation Staff and Pioneer Public Relations Officer; established the PR Unit and Vice-Chancellor's Office ahead of university opening.",
      "Served successively as PRO/PA to the VC, HR Officer, Student Affairs Officer, and Academic Planning Officer over 12 years.",
      "Honoured with the 10-Year Meritorious Service Award (2012) and Vice-Chancellor's Commendation Award (2013).",
    ],
  },
];

const education = [
  { degree: "MSc, Social Work (Social Welfare Option)", institution: "LAUTECH, Ogbomoso (2011)" },
  { degree: "B.A. English", institution: "Ambrose Alli University, Ekpoma (2007)" },
  { degree: "Master in Industrial & Labour Relations (MILR)", institution: "University of Ibadan (1999)" },
  { degree: "PGD, Mass Communication", institution: "The Polytechnic, Ibadan (1997)" },
  { degree: "HND, Secretarial Administration", institution: "The Polytechnic, Ibadan (1990)" },
  { degree: "Huawei Certified Associate (HCIA)", institution: "Routing & Switching, Huawei Academy (2019)" },
];

const memberships = [
  "Fellow, Chartered Institute of Administration — FCIA (2024)",
  "Full Member, Nigerian Institute of Management — MNIM (1993–date; General Secretary 1996–2000, 2nd Vice-Chairman 2000–2002, NIM Ibadan)",
  "Association of Registrars of Nigerian Universities (ARNU)",
  "Association of Registrars of Nigerian Private Universities (ARNUM, 2019–date)",
  "Chartered Institute of Personnel Management (CIPMN Human Resources Educators, 2019–date)",
  "Association of Nigerian University Professional Administrators (ANUPA — Chairman, Bowen University Branch, 2006–2009)",
];

export default function ProfilePage() {
  const whatsappUrl =
    "https://wa.me/2348034710699?text=" +
    encodeURIComponent(
      "Hello S. B. Omotoso! I reviewed your executive profile and would like to inquire about a Speaking / Keynote Engagement or Institutional Advisory."
    );

  return (
    <div className="min-h-screen bg-ink w-full">
      {/* Top Banner */}
      <div className="w-full bg-[#18110C] py-2.5 px-4 text-center border-b border-white/5">
        <p className="text-xs sm:text-sm text-parchment/80 font-medium flex items-center justify-center gap-2">
          <Sparkles size={14} className="text-gold" />
          <span>Executive Profile &amp; Leadership Portfolio of S. B. Omotoso</span>
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16 space-y-16">
        {/* Executive Hero Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#120D09] via-[#0E0A07] to-black border border-gold/20 p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-center">
            {/* Left Column: Intro */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold">
                  <ShieldCheck size={14} /> Executive Leadership Profile
                </span>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-parchment leading-tight">
                  S. B. Omotoso
                </h1>
                <p className="font-mono text-sm sm:text-base text-gold tracking-wide">
                  FCIA │ MILR │ MSc. │ MNIM
                </p>
                <p className="text-sm sm:text-base text-parchment/80 font-medium pt-1">
                  Chief Executive • Institution Builder • Digital Transformation Leader
                </p>
              </div>

              <p className="text-sm sm:text-base text-parchment/70 font-light leading-relaxed">
                A seasoned chief administrator, institution-builder, and technology-forward executive with over three decades of leadership across higher education, enterprise consultancy, and public service. Twice appointed University Registrar and central contributor to the licensing, accreditation, and operational take-off of five Nigerian universities.
              </p>

              {/* Direct Contact Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-parchment/70 pt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-gold" /> Abeokuta, Nigeria
                </span>
                <a
                  href="mailto:sbomotoso@gmail.com"
                  className="flex items-center gap-1.5 hover:text-gold transition-colors"
                >
                  <Mail size={15} className="text-gold" /> sbomotoso@gmail.com
                </a>
                <a
                  href="tel:08034710699"
                  className="flex items-center gap-1.5 hover:text-gold transition-colors"
                >
                  <Phone size={15} className="text-gold" /> 08034710699 / 08054950445
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/speaking#booking"
                  className="rounded-full bg-gradient-to-r from-gold-dark to-gold px-8 py-3.5 font-bold text-ink shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center gap-2 text-sm"
                >
                  <Mic size={16} />
                  <span>Invite for Speaking Engagement</span>
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#25D366] px-6 py-3.5 font-bold text-white shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:bg-[#1EBE5D] transition-all flex items-center gap-2 text-sm"
                >
                  <MessageCircle size={18} />
                  <span>Enquire on WhatsApp</span>
                </a>

                <Link
                  href="/shop"
                  className="rounded-full bg-white/5 border border-white/10 px-6 py-3.5 font-semibold text-parchment hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                >
                  <BookOpen size={16} className="text-gold" />
                  <span>Lecture Notes &amp; Books</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Headshot Photo */}
            <div className="flex justify-center">
              <div className="relative aspect-[4/5] w-full max-w-[320px] rounded-3xl overflow-hidden border-2 border-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.2)] bg-[#1A140F]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/speaker-omotoso.jpg"
                  alt="S. B. Omotoso, FCIA"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 text-center">
                  <p className="font-display font-bold text-sm text-parchment">
                    S. B. Omotoso
                  </p>
                  <p className="text-[11px] text-gold font-mono">
                    FCIA │ MILR │ MSc. │ MNIM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Core Competencies */}
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              Leadership Capabilities
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-parchment mt-1">
              Executive Core Competencies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {competencies.map((comp, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#140F0B] p-4 hover:border-gold/30 transition-all"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-sm font-medium text-parchment/90">{comp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The Executive Differentiator Card */}
        <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-[#16100B] to-[#120D09] p-8 sm:p-12 space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 text-gold text-xs font-bold uppercase tracking-widest">
            <Zap size={16} />
            <span>The Rare Executive Differentiator</span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl text-parchment">
            Technology &amp; Innovation from the Very Top of the Organisation
          </h3>

          <p className="text-sm sm:text-base text-parchment/80 font-light leading-relaxed">
            Unlike traditional chief executives who delegate technology decisions, S. B. Omotoso combines deep governance, regulatory relations, and financial stewardship with the personal capacity to lead digital transformation, architect enterprise software, and pioneer AI adoption firsthand.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
              <h4 className="font-bold text-sm text-gold">Practice-Validated Mastery</h4>
              <p className="text-xs text-parchment/65 leading-relaxed">
                Technical expertise proven through production systems in live institutional use, university-level technology teaching, and sustained executive mentorship.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
              <h4 className="font-bold text-sm text-gold">AI-Assisted Development Leader</h4>
              <p className="text-xs text-parchment/65 leading-relaxed">
                Practitioner and educator in AI-assisted software development (&apos;Vibe Coding&apos;); author of structured curricula enabling non-programmers to build production digital systems.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
              <h4 className="font-bold text-sm text-gold">Enterprise Platforms Built</h4>
              <p className="text-xs text-parchment/65 leading-relaxed">
                Independently designed and deployed institutional web applications including the Academic Virtual Library (AVL), MedAssist, ResearchEval Pro, and Smart Library platform.
              </p>
            </div>
          </div>
        </div>

        {/* Career & University Leadership Highlights */}
        <div className="space-y-8">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              Executive Career
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-parchment mt-1">
              Institution-Builder Across Five Universities
            </h2>
          </div>

          <div className="space-y-6">
            {institutions.map((inst, i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-[#120D09] p-6 sm:p-8 space-y-4 hover:border-gold/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-parchment">
                      {inst.role}
                    </h3>
                    <p className="text-sm text-gold font-medium mt-0.5">
                      {inst.institution}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-mono text-parchment/60 self-start sm:self-auto">
                    {inst.period}
                  </span>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm text-parchment/75 leading-relaxed">
                  {inst.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-gold mt-1">◆</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Publications & Knowledge Products */}
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              Authored Works
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-parchment mt-1">
              Selected Publications &amp; Knowledge Products
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-white/10 bg-[#140F0B] p-6 sm:p-8 space-y-4">
              <span className="rounded-full bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase text-gold">
                Published Book
              </span>
              <h3 className="font-display text-xl text-parchment">
                Guide to Career Success and Comfortable Retirement
              </h3>
              <p className="text-xs text-parchment/60 font-mono">
                Tintol Business Services, Ibadan (2012)
              </p>
              <p className="text-xs text-parchment/75 leading-relaxed font-light">
                A seminal guide addressing strategic personal development, workplace performance, ethical governance, and comfortable post-service transition.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-gold hover:underline pt-2"
              >
                <span>Available in Digital Store</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#140F0B] p-6 sm:p-8 space-y-4">
              <span className="rounded-full bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase text-gold">
                Technical Publication (2026)
              </span>
              <h3 className="font-display text-xl text-parchment">
                Vibe Coding: The Complete Pipeline
              </h3>
              <p className="text-xs text-parchment/60 font-mono">
                Scholar Suite Practice (2026)
              </p>
              <p className="text-xs text-parchment/75 leading-relaxed font-light">
                A comprehensive methodology curriculum teaching professionals and non-technical founders how to build production software utilizing advanced AI agentic coding pipelines.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-gold hover:underline pt-2"
              >
                <span>Available in Digital Store</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Education & Professional Qualifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Qualifications */}
          <div className="rounded-3xl border border-white/10 bg-[#120D09] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 text-gold">
              <GraduationCap size={22} />
              <h3 className="font-display text-xl text-parchment font-bold">
                Education &amp; Qualifications
              </h3>
            </div>

            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i} className="border-b border-white/5 pb-3 last:border-none">
                  <p className="font-semibold text-sm text-parchment">{edu.degree}</p>
                  <p className="text-xs text-parchment/50 mt-0.5">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Memberships */}
          <div className="rounded-3xl border border-white/10 bg-[#120D09] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 text-gold">
              <Award size={22} />
              <h3 className="font-display text-xl text-parchment font-bold">
                Governance &amp; Fellowships
              </h3>
            </div>

            <div className="space-y-3">
              {memberships.map((mem, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-parchment/80">
                  <span className="text-gold mt-0.5">◆</span>
                  <span>{mem}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5 space-y-1">
              <p className="text-xs text-gold font-bold">Notable Honours:</p>
              <p className="text-xs text-parchment/65">
                • 1997 NIM Best Young Manager of the Year <br />
                • NYSC State Merit Award, Katsina (1991) <br />
                • Vice-Chancellor&apos;s Commendation Award (2013) &amp; 10-Year Meritorious Service Award (2012), Bowen University
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA Bar */}
        <div className="rounded-3xl border border-gold/30 bg-gradient-to-r from-gold/10 via-black to-gold/10 p-8 sm:p-12 text-center space-y-6">
          <h3 className="font-display text-3xl text-parchment">
            Invite S. B. Omotoso for Your Next Event
          </h3>
          <p className="text-sm text-parchment/70 max-w-xl mx-auto leading-relaxed">
            Available for university matriculation/convocation addresses, corporate executive retreats, AI digital transformation masterclasses, and board advisory.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/speaking#booking"
              className="rounded-full bg-gradient-to-r from-gold-dark to-gold px-8 py-3.5 font-bold text-ink shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center gap-2 text-sm"
            >
              <Mic size={16} />
              <span>Submit Speaking Invitation</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#25D366] px-6 py-3.5 font-bold text-white shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:bg-[#1EBE5D] transition-all flex items-center gap-2 text-sm"
            >
              <MessageCircle size={18} />
              <span>Connect on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
