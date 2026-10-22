import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Briefcase,
  GraduationCap,
  Zap,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CurriculumModule {
  title: string;
  summary: string;
  duration: string;
}

interface CurriculumTrack {
  id: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  tagline: string;
  targetAudience: string;
  modules: CurriculumModule[];
}

const officialCurriculum: CurriculumTrack[] = [
  {
    id: "career-planning",
    badge: "Career Planning & Development",
    badgeColor: "border-gold/40 text-gold bg-gold/10",
    icon: Briefcase,
    title: "Executive Career Planning & Accelerated Development",
    tagline:
      "Strategic roadmap design, executive presence, high-stakes compensation negotiation, and promotional trajectory for ambitious professionals.",
    targetAudience: "Mid-career professionals, managers, team leads, and ambitious corporate executives.",
    modules: [
      {
        title: "Module 1: Career Architecture & Strategic Positioning",
        summary:
          "Audit your career capital, craft an executive personal brand, and map out 1, 3, and 5-year promotional milestones.",
        duration: "3 hours • Self-paced",
      },
      {
        title: "Module 2: Executive Presence, Influence & Political Savvy",
        summary:
          "Master cross-functional leadership, stakeholder management, C-suite communication, and managing difficult upward dynamics.",
        duration: "4 hours • Self-paced",
      },
      {
        title: "Module 3: High-Stakes Salary Negotiation & Promotion Pathways",
        summary:
          "Frameworks for packaging business impact, navigating performance appraisals, and negotiating compensation increases.",
        duration: "3 hours • Interactive Drills",
      },
      {
        title: "Module 4: High-Performance Team Management & Delegation",
        summary:
          "Transitioning from individual contributor to leader: hiring talent, setting OKRs, giving critical feedback, and coaching staff.",
        duration: "4 hours • Case Studies",
      },
    ],
  },
  {
    id: "entrepreneurship-management",
    badge: "Entrepreneurship & Management",
    badgeColor: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    icon: Zap,
    title: "Entrepreneurship, Business Setup & Scalable Management",
    tagline:
      "From idea validation to CAC registration, financial unit economics, Paystack integration, and standard operating procedures.",
    targetAudience: "Founders, business owners, self-employed creators, and aspiring entrepreneurs.",
    modules: [
      {
        title: "Module 1: Market Validation & Value Proposition Design",
        summary:
          "Conduct customer discovery interviews, test willingness-to-pay, and validate business ideas with zero marketing waste.",
        duration: "3 hours • Self-paced",
      },
      {
        title: "Module 2: Legal Setup, CAC Registration & Corporate Governance",
        summary:
          "Registering with the Corporate Affairs Commission (CAC), tax compliance (FIRS/NRS), founder agreements, and protecting IP.",
        duration: "4 hours • Practical Guide",
      },
      {
        title: "Module 3: Financial Modeling, Unit Economics & Payment Systems",
        summary:
          "Pricing strategy, cashflow management, working capital forecasting, and integrating Paystack checkout for seamless collections.",
        duration: "4 hours • Templates Included",
      },
      {
        title: "Module 4: Operational Systems, SOPs & Delegation Frameworks",
        summary:
          "Documenting standard operating procedures (SOPs), automating repetitive workflows with AI, and managing remote or in-house teams.",
        duration: "3 hours • Systems Blueprint",
      },
    ],
  },
  {
    id: "retirement-second-act",
    badge: "Retirement & Second-Act",
    badgeColor: "border-purple-500/40 text-purple-400 bg-purple-500/10",
    icon: Award,
    title: "Retirement Planning & Post-Retirement Occupation: The Second Act",
    tagline:
      "Transition from active career to purposeful legacy: wealth preservation, board advisory directorships, consulting, and second-act ventures.",
    targetAudience: "Pre-retirees, retirees, senior public/private sector directors, and senior advisors.",
    modules: [
      {
        title: "Module 1: Pension Strategy, Asset Allocation & Wealth Preservation",
        summary:
          "Auditing RSA pensions, hedging against inflation, fixed-income strategies, dividend investing, and legacy estate planning.",
        duration: "3 hours • Expert Led",
      },
      {
        title: "Module 2: Post-Retirement Occupation: Building a High-Ticket Advisory Practice",
        summary:
          "Monetize decades of specialized experience into an independent executive consulting, coaching, or training practice.",
        duration: "4 hours • Action Plan",
      },
      {
        title: "Module 3: Board Governance, Directorships & Angel Syndicates",
        summary:
          "Securing non-executive board seats, navigating board fiduciary responsibilities, and participating in early-stage angel syndicates.",
        duration: "4 hours • Executive Masterclass",
      },
      {
        title: "Module 4: Philanthropy, Non-Profit Foundations & Intergenerational Mentorship",
        summary:
          "Setting up sustainable non-profit trusts, structuring community initiatives, and mentoring the next generation of African leaders.",
        duration: "3 hours • Legacy Blueprint",
      },
    ],
  },
  {
    id: "ai-vibe-coding",
    badge: "AI Literacy & Vibe Coding",
    badgeColor: "border-gold/40 text-gold bg-gold/10",
    icon: BookOpen,
    title: "Applied AI Literacy, Prompt Architecture & Vibe Coding",
    tagline:
      "Transform ideas into production software and autonomous business tools using modern AI and vibe coding.",
    targetAudience: "All tracks: professionals, founders, students, and lifelong learners seeking high-leverage digital power.",
    modules: [
      {
        title: "Module 1: Cognitive Prompt Architecture & Context Engineering",
        summary:
          "Master multi-turn context windows, reasoning models, and crafting production prompts that eliminate hallucinations.",
        duration: "2.5 hours • Self-paced",
      },
      {
        title: "Module 2: Full-Stack Vibe Coding with Next.js & Supabase",
        summary:
          "Deploy responsive, database-backed web applications rapidly using conversational coding and modern developer agents.",
        duration: "5 hours • Hands-on Project",
      },
      {
        title: "Module 3: Autonomous Agents, RAG & Business Automation",
        summary:
          "Deploy autonomous multi-agent pipelines for research, customer lead qualification, and automated reporting.",
        duration: "4 hours • Capstone Build",
      },
    ],
  },
  {
    id: "graduate-launch",
    badge: "Graduate Launch Track",
    badgeColor: "border-red-500/40 text-red-400 bg-red-500/10",
    icon: GraduationCap,
    title: "Graduate Employability, Portfolio & Career Launch Accelerator",
    tagline:
      "Transition from tertiary graduation and NYSC into premier corporate and tech roles with verified proof-of-work.",
    targetAudience: "Fresh graduates, NYSC corps members, final-year university scholars, and entry-level job seekers.",
    modules: [
      {
        title: "Module 1: Proof-of-Work Portfolio Construction",
        summary:
          "Build and deploy live, functional digital projects that prove your capabilities to hiring managers better than any degree.",
        duration: "4 hours • Project Based",
      },
      {
        title: "Module 2: Modern Workplace Tools & Communication Fluency",
        summary:
          "Master corporate communication, asynchronous collaboration tools (Slack/Notion/Linear), and professional business etiquette.",
        duration: "3 hours • Practical Drills",
      },
      {
        title: "Module 3: ATS-Optimized CVs & Technical Interview Mastery",
        summary:
          "Beat automated applicant filters, tackle behavioral interview questions with the STAR method, and conduct mock interviews.",
        duration: "3 hours • 1-on-1 Reviews",
      },
    ],
  },
];

export default async function CoursesCatalogPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id,title,description,updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  return (
    <div className="relative min-h-screen bg-[#FAFAFD] text-slate-800">
      {/* Royal Navy Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] text-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#00D2FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-[#7C3AED]/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-[#00D2FF] mb-3">
            <Sparkles size={12} />
            <span>Curated Capability Curriculum</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Academy Curriculum &amp; Modules
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Comprehensive, career-defining curricula tailored for working professionals, entrepreneurs,
            retirees seeking second-act occupations, fresh graduates, and campus scholars. All core modules
            are free, self-paced, and paired with 1-on-1 verified mentorship.
          </p>

          {/* Quick Stats Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4 max-w-4xl">
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
              <p className="text-xl sm:text-2xl font-bold text-[#00D2FF]">5 Core</p>
              <p className="text-xs text-slate-300 mt-0.5">Career &amp; Life Tracks</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
              <p className="text-xl sm:text-2xl font-bold text-[#00D2FF]">19 Modules</p>
              <p className="text-xs text-slate-300 mt-0.5">Practical Syllabus</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
              <p className="text-xl sm:text-2xl font-bold text-emerald-300">100% Free</p>
              <p className="text-xs text-slate-300 mt-0.5">Core Access</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
              <p className="text-xl sm:text-2xl font-bold text-indigo-300">1-on-1</p>
              <p className="text-xs text-slate-300 mt-0.5">Executive Mentorship</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Dynamic Database Courses (If populated in Supabase) */}
        {courses && courses.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">Interactive LMS Courses</h2>
              <span className="text-xs font-semibold text-[#0284C7]">Directly Enrolled</span>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:border-cyan-400/60 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#0284C7] border border-cyan-200">
                      Active Enrollment
                    </span>
                    <ArrowRight size={14} className="text-[#0284C7] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="mt-3 font-display text-lg font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors">
                    {course.title}
                  </p>
                  <p className="mt-2 line-clamp-3 text-xs text-slate-600 leading-relaxed">
                    {course.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Master Syllabus Section */}
        <section className="space-y-8">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Official Academy Tracks &amp; Detailed Modules
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Explore structured modules for Career Planning, Entrepreneurship, Retirement Strategy, AI Vibe Coding, and Graduate Launch.
            </p>
          </div>

          <div className="space-y-8">
            {officialCurriculum.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.id}
                  id={track.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm transition-all hover:border-cyan-400/50 hover:shadow-md"
                >
                  {/* Track Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#120D42]">
                          <Icon size={18} />
                        </div>
                        <span className="inline-flex rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {track.badge}
                        </span>
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                        {track.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                        {track.tagline}
                      </p>
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Audience:</span> {track.targetAudience}
                      </p>
                    </div>

                    <div className="shrink-0 pt-2 md:pt-0">
                      <Link
                        href="/register"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#00D2FF] px-5 py-2.5 text-xs font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all"
                      >
                        <span>Enroll in Track</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Modules Grid */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {track.modules.map((module, mIdx) => (
                      <div
                        key={mIdx}
                        className="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50 hover:border-cyan-300"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                            <span className="font-mono text-[#0284C7] font-bold">0{mIdx + 1}</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                              <Clock size={11} /> {module.duration}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm text-slate-900">
                            {module.title}
                          </h4>
                          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                            {module.summary}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#0284C7] font-medium">
                          <CheckCircle2 size={12} />
                          <span>Curated Syllabus &amp; Practical Resources</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer Call to Action */}
        <div className="mt-14 rounded-2xl bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl">
          <div className="pointer-events-none absolute -bottom-10 right-0 h-64 w-64 rounded-full bg-[#00D2FF]/20 blur-3xl" />
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
            Ready to begin your tailored learning journey?
          </h3>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Create your free account to access syllabi, participate in masterclasses, and get paired with an executive or peer mentor.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-[#00D2FF] px-6 py-3 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-lg shadow-cyan-500/25 hover:bg-[#38BDF8] transition-all"
            >
              <span>Register Free Today</span>
              <ArrowRight size={14} className="inline ml-1.5" />
            </Link>
            <Link
              href="/mentorship/find"
              className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-white/15 transition-all"
            >
              <span>Browse Mentors</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}