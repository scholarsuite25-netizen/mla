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
    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {/* Header Banner */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-3">
          <Sparkles size={12} />
          <span>Curated Capability Curriculum</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-parchment sm:text-5xl">
          Academy Curriculum &amp; Modules
        </h1>
        <p className="mt-4 text-base text-parchment/70 leading-relaxed">
          Comprehensive, career-defining curricula tailored for working professionals, entrepreneurs,
          retirees seeking second-act occupations, fresh graduates, and campus scholars. All core modules
          are free, self-paced, and paired with 1-on-1 verified mentorship.
        </p>
      </div>

      {/* Quick Stats Banner */}
      <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-[#140F0B] p-5 sm:grid-cols-4">
        <div>
          <p className="text-2xl font-bold text-gold">5 Core</p>
          <p className="text-xs text-parchment/60">Career &amp; Life Tracks</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gold">19 Modules</p>
          <p className="text-xs text-parchment/60">Practical Syllabus</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-emerald-400">100% Free</p>
          <p className="text-xs text-parchment/60">Core Access</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-400">1-on-1</p>
          <p className="text-xs text-parchment/60">Executive Mentorship</p>
        </div>
      </div>

      {/* Dynamic Database Courses (If populated in Supabase) */}
      {courses && courses.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-parchment">Interactive LMS Courses</h2>
            <span className="text-xs text-gold">Directly Enrolled</span>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group rounded-2xl border border-white/10 bg-panel p-6 transition-all hover:border-gold/60 hover:bg-[#16110D]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold text-gold border border-gold/20">
                    Active Enrollment
                  </span>
                  <ArrowRight size={14} className="text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="mt-3 font-display text-xl font-bold text-parchment group-hover:text-gold transition-colors">
                  {course.title}
                </p>
                <p className="mt-2 line-clamp-3 text-xs text-parchment/65 leading-relaxed">
                  {course.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Master Syllabus Section */}
      <section className="mt-16 space-y-12">
        <div>
          <h2 className="font-display text-2xl font-bold text-parchment sm:text-3xl">
            Official Academy Tracks &amp; Detailed Modules
          </h2>
          <p className="mt-2 text-sm text-parchment/65">
            Explore the structured modules for Career Planning, Entrepreneurship, Retirement Strategy, AI Vibe Coding, and Graduate Launch.
          </p>
        </div>

        <div className="space-y-10">
          {officialCurriculum.map((track) => {
            const Icon = track.icon;
            return (
              <div
                key={track.id}
                id={track.id}
                className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#18120D] to-[#0E0A08] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all hover:border-gold/30"
              >
                {/* Track Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gold">
                        <Icon size={18} />
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${track.badgeColor}`}>
                        {track.badge}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-parchment sm:text-3xl">
                      {track.title}
                    </h3>
                    <p className="text-sm text-parchment/75 leading-relaxed max-w-3xl">
                      {track.tagline}
                    </p>
                    <p className="text-xs text-parchment/50">
                      <span className="font-semibold text-parchment/70">Audience:</span> {track.targetAudience}
                    </p>
                  </div>

                  <div className="shrink-0 pt-2 md:pt-0">
                    <Link
                      href="/register"
                      className="btn-primary !py-2.5 !px-5 !text-xs whitespace-nowrap"
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
                      className="flex flex-col justify-between rounded-xl border border-white/5 bg-black/40 p-4 transition-colors hover:border-white/15"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-parchment/50 mb-2">
                          <span className="font-mono text-gold/80 font-bold">0{mIdx + 1}</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-parchment/60">
                            <Clock size={11} /> {module.duration}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-parchment">
                          {module.title}
                        </h4>
                        <p className="mt-2 text-xs text-parchment/65 leading-relaxed">
                          {module.summary}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-gold font-medium">
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
      <div className="mt-16 rounded-3xl border border-gold/30 bg-gradient-to-r from-[#201812] to-[#120D0A] p-8 sm:p-12 text-center">
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-parchment">
          Ready to begin your tailored learning journey?
        </h3>
        <p className="mt-3 text-sm text-parchment/70 max-w-xl mx-auto">
          Create your free account to access syllabi, participate in masterclasses, and get paired with an executive or peer mentor.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="btn-primary !px-7 !py-3">
            <span>Register Free Today</span>
            <ArrowRight size={15} />
          </Link>
          <Link href="/mentorship/find" className="btn-secondary !px-7 !py-3">
            <span>Browse Mentors</span>
          </Link>
        </div>
      </div>
    </div>
  );
}