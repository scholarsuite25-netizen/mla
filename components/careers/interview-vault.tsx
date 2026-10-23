"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  CheckCircle2,
  Copy,
  ChevronDown,
  BookOpen,
  Users,
  Sparkles,
  CheckSquare,
  MessageSquare,
} from "lucide-react";

type InterviewQuestion = {
  id: string;
  category: "Executive Pitch" | "STAR Behavioral" | "Nigerian Graduate Specifics" | "Salary & Closing";
  question: string;
  whatRecruitersLookFor: string;
  starFramework?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  sampleAnswer: string;
  proTip: string;
};

const VAULT_QUESTIONS: InterviewQuestion[] = [
  // Section 1: Executive Pitch
  {
    id: "q1",
    category: "Executive Pitch",
    question: "Tell me about yourself (The 60-Second Executive Pitch)",
    whatRecruitersLookFor:
      "A structured overview covering past academic training, present skill mastery, and future alignment with this specific company. Never recite your life biography.",
    sampleAnswer:
      "I am a First-Class graduate in Systems Engineering from UNILAG with a strong background in analytical problem solving and hands-on training in AI vibe coding and process automation through the Maxwell Leadership Academy. Recently, during my internship and NYSC at EcoBank, I analyzed over 12,000 daily transaction records, cutting reconciliation turnaround times by 34%. What drives me is translating complex operational bottlenecks into fast, reliable digital workflows. I'm excited about this graduate trainee role at Access Bank because of your leadership in continental digital banking innovation, and I'm eager to bring both my quantitative rigor and rapid technical execution to your team.",
    proTip:
      "Follow the 3-step formula: Past (Training & Degree) → Present (Recent tangible achievement) → Future (Why this specific company now). Keep it strictly under 90 seconds.",
  },
  {
    id: "q2",
    category: "Executive Pitch",
    question: "Why do you want to work for our organization rather than our competitors?",
    whatRecruitersLookFor:
      "Proof of genuine commercial awareness and research into their products, market share, and public initiatives, rather than a generic canned compliment.",
    sampleAnswer:
      "I've followed PwC's expansion across West African ESG advisory and tax technology automation closely. While other Big 4 firms have strong consulting wings, your recent whitepapers on Nigerian monetary policy and digital revenue mobilization demonstrate tangible thought leadership. Given my background in both financial analysis and modern web software tools, I want to start my professional career in an environment where continuous research directly shapes national institutional decisions.",
    proTip:
      "Mention at least one recent company announcement, CEO keynote, or signature product launched in the last 6 months.",
  },
  {
    id: "q3",
    category: "Executive Pitch",
    question: "Where do you see yourself in 3 to 5 years?",
    whatRecruitersLookFor:
      "Ambition balanced with realistic organizational commitment. Recruiters want to know you won't resign after 3 months, while also possessing a clear career trajectory.",
    sampleAnswer:
      "Over the next 2 to 3 years, my goal is to completely master our department's core operational protocols, earn my professional charter (such as ICAN / Project Management accreditation), and be recognized as a dependable team pillar. By year 5, I aspire to take on supervisory responsibilities for junior cohorts, lead cross-functional digital initiatives, and contribute directly to regional client engagements.",
    proTip:
      "Emphasize professional certifications and institutional depth rather than purely jumping to executive titles.",
  },
  {
    id: "q4",
    category: "Executive Pitch",
    question: "What is your greatest weakness, and how are you managing it?",
    whatRecruitersLookFor:
      "Genuine self-awareness and active remediation. Avoid fake weaknesses like 'I work too hard' or fatal flaws like 'I am always late'.",
    sampleAnswer:
      "In the past, because I enjoy deep problem-solving, I occasionally hesitated to delegate tasks when working on multi-member group projects, fearing quality drops. During my final year project, I recognized this caused bottlenecking. I proactively adopted Trello and weekly milestone check-ins, which allowed me to trust peers with sub-components while maintaining oversight. This cut our project completion time by three weeks.",
    proTip:
      "Pick an authentic technical or procedural blind spot, and spend 70% of your answer explaining the system or habit you created to overcome it.",
  },
  {
    id: "q5",
    category: "Executive Pitch",
    question: "What differentiates you from other qualified candidates with similar grades?",
    whatRecruitersLookFor:
      "Proof-of-work and proactive self-learning. What have you built or solved outside the four walls of the university classroom?",
    sampleAnswer:
      "While many applicants offer strong degree qualifications, what distinguishes me is verified proof-of-work. Beyond my academic coursework, I completed the MLA AI Vibe Coding certification where I built and deployed two live web applications from scratch, including an SME billing engine with real-time webhooks. This means I do not just understand theory; I arrive on day one with the habit of shipping production-ready solutions and navigating modern digital tools independently.",
    proTip:
      "Always pivot back to your live portfolio, internships, or leadership responsibilities during NYSC.",
  },

  // Section 2: STAR Behavioral
  {
    id: "q6",
    category: "STAR Behavioral",
    question: "Describe a time you faced a difficult conflict with a colleague or team member.",
    whatRecruitersLookFor:
      "Emotional intelligence, de-escalation skills, objective focus on project outcomes rather than personal ego.",
    starFramework: {
      situation:
        "During our 4-person university capstone thesis, one teammate consistently missed group data collection deadlines due to off-campus personal commitments, which threatened our faculty defense date.",
      task: "As team coordinator, I needed to get the data completed without alienating the member or lowering our research rigor.",
      action:
        "Instead of criticizing him publicly on our group chat, I scheduled a private 1-on-1 call to understand his constraints. I restructured our sub-tasks so he could handle asynchronous literature reviews during evening hours while the rest of us took morning field surveys.",
      result:
        "He delivered his section 48 hours ahead of the new milestone, and our panel awarded the paper an 'A' grade with commendation from the Department Head.",
    },
    sampleAnswer:
      "During our university capstone thesis, a teammate was consistently missing milestones due to off-campus commitments. Instead of escalating the issue or arguing on our group chat, I had a private 1-on-1 discussion with him to understand his constraints. We restructured our assignment workflow so he could handle asynchronous literature synthesis at night, while we covered morning field research. As a result, our team submitted 48 hours early and secured an 'A' grade with department commendation.",
    proTip:
      "Never badmouth past colleagues. Highlight private communication and restructuring workflows.",
  },
  {
    id: "q7",
    category: "STAR Behavioral",
    question: "Tell me about a time you made a significant mistake or failed at a task.",
    whatRecruitersLookFor:
      "Accountability, swift ownership without blaming others, and lessons converted into permanent systems.",
    starFramework: {
      situation:
        "During my internship at an accounting firm, I exported an unvalidated transaction report that had two duplicate customer entries, which was briefly sent to a senior partner.",
      task: "I needed to rectify the error immediately before external distribution.",
      action:
        "I immediately informed my supervisor, took full responsibility, corrected the duplicate entries within 15 minutes, and then engineered an automated Excel conditional formatting formula that flags duplicate records automatically before any export.",
      result:
        "The partner appreciated the prompt transparency, and the duplicate-check template was subsequently standardized across the entire intern pool.",
    },
    sampleAnswer:
      "During an internship, I mistakenly exported a client report containing duplicate records. As soon as I caught it, I immediately notified my direct supervisor rather than trying to conceal it. I corrected the document within 15 minutes and built an automated validation formula that prevents duplicate exports. My supervisor appreciated the prompt transparency, and that validation check was made standard protocol for all subsequent intern deliverables.",
    proTip:
      "Admit the mistake within the first 15 seconds, then spend the rest of the time showing your fast corrective action and long-term safeguard.",
  },
  {
    id: "q8",
    category: "STAR Behavioral",
    question: "Describe a situation where you had to work under intense pressure with tight deadlines.",
    whatRecruitersLookFor:
      "Calm prioritization, time-boxing techniques, and mental resilience under pressure.",
    starFramework: {
      situation:
        "During NYSC PPA audit season, our department received a surprise regulatory audit notice requiring reconciliation of 3 months of archived invoices in 48 hours.",
      task: "Review and categorize over 2,400 physical and digital records accurately.",
      action:
        "I broken the batch down into 4-hour sprints, grouped records by vendor category, and created a shared status dashboard so the 3 junior officers could see real-time completion percentages.",
      result:
        "We completed the reconciliation 4 hours before the auditors arrived, with 100% compliance and zero discrepancies noted in the audit debrief.",
    },
    sampleAnswer:
      "During our NYSC PPA audit season, we were tasked with reconciling 3 months of archived records within a 48-hour deadline. I broke down the 2,400 files into 4-hour sprints and set up a shared visual tracker for the 3 junior staff members. We completed the audit file 4 hours ahead of schedule with 100% compliance and zero discrepancy flags.",
    proTip:
      "Mention your specific organization method (e.g., Eisenhower matrix, sprint batching, visual trackers).",
  },
  {
    id: "q9",
    category: "STAR Behavioral",
    question: "Give an example of a time you showed initiative beyond your required duties.",
    whatRecruitersLookFor:
      "Self-starter mindset; seeing an inefficiency and fixing it without waiting for explicit orders.",
    starFramework: {
      situation:
        "At my previous placement, new corps members spent their first week asking senior staff repetitive questions regarding file storage paths and company templates.",
      task: "Reduce the drain on senior staff time while improving onboarding speed.",
      action:
        "On my own initiative over one weekend, I compiled a concise 6-page 'Quick-Start Onboarding Guide' with screenshots, folder paths, and software shortcuts.",
      result:
        "The HR manager officially adopted the guide, cutting new cohort onboarding questions by an estimated 60%.",
    },
    sampleAnswer:
      "Noticing that incoming interns frequently interrupted senior staff with basic file path questions, I spent a weekend drafting a concise 6-page digital onboarding manual with step-by-step screenshots and folder directories. HR officially incorporated it into the orientation kit, saving hours of senior staff time each month.",
    proTip:
      "Initiative doesn't have to be massive—small operational improvements leave huge positive impressions.",
  },

  // Section 3: Nigerian Graduate Specifics
  {
    id: "q10",
    category: "Nigerian Graduate Specifics",
    question: "You studied Chemistry / Philosophy / Agric; why apply for Banking or Tech?",
    whatRecruitersLookFor:
      "Connecting transferable skills (quantitative discipline, research, hypothesis testing, logic) to commercial business operations without sounding apologetic about your course.",
    sampleAnswer:
      "My degree in Pure & Applied Chemistry trained me in rigorous experimental methodologies, quantitative accuracy, and testing complex hypotheses under controlled constraints. Modern banking and fintech operations operate on precisely the same fundamental principles: testing transaction integrity, analyzing large data sets, and mitigating risk. Furthermore, through MLA's applied digital curriculum, I've complemented my scientific reasoning with practical financial modelling and web software literacy. My degree taught me how to think analytically; my practical tech training enables me to execute immediately.",
    proTip:
      "Never say 'there are no jobs in my field'. Always frame your degree as rigorous intellectual preparation, followed by intentional upskilling.",
  },
  {
    id: "q11",
    category: "Nigerian Graduate Specifics",
    question: "How did you spend your NYSC year? What was your key impact?",
    whatRecruitersLookFor:
      "Proof that you didn't simply 'ghost' or mark time, but actively contributed to your host community or PPA.",
    sampleAnswer:
      "During my service year in Oyo State, I served at a local government commercial high school while active in the Editorial & Digital CDS group. Beyond classroom teaching, I founded an after-school coding club where we introduced 65 senior secondary students to computer literacy and basic web principles. Simultaneously, I earned professional certifications in data analytics and vibe coding. NYSC was a period of deliberate community service and continuous technical upskilling.",
    proTip:
      "Highlight leadership roles, CDS initiatives, or quantifiable impact made at your PPA.",
  },
  {
    id: "q12",
    category: "Nigerian Graduate Specifics",
    question: "Are you willing to relocate or work in a hybrid/shift schedule across Nigeria?",
    whatRecruitersLookFor:
      "Geographical mobility and operational flexibility, which is often a strict requirement for major commercial banks and FMCG conglomerates.",
    sampleAnswer:
      "Yes, absolutely. As a young professional at the start of my corporate journey, I am fully mobile and adaptable. During my academic and NYSC years, I adapted seamlessly to different regional environments. I view regional rotation and flexible shift patterns as invaluable opportunities to understand our customer base and business operations firsthand.",
    proTip:
      "State an enthusiastic 'Yes' first before adding any personal context.",
  },

  // Section 4: Salary & Closing
  {
    id: "q13",
    category: "Salary & Closing",
    question: "What are your salary expectations for this entry-level role?",
    whatRecruitersLookFor:
      "Market realism without pricing yourself out or undervaluing yourself. Graduate trainee roles at major institutions have fixed standardized salary bands.",
    sampleAnswer:
      "Having researched the Nigerian market standard for leading corporate graduate trainee programs, I understand your organization offers a well-structured, competitive compensation and benefits framework for incoming cohorts. At this stage of my career, my primary focus is securing an environment offering world-class mentorship, professional charter sponsorship, and accelerated growth. I am confident that any offer within your established graduate compensation structure will be equitable and agreeable.",
    proTip:
      "For graduate trainee schemes, do NOT name a rigid single figure unless explicitly pressed. If pressed for a number, give a researched range (e.g. 'Between ₦250,000 and ₦350,000 net monthly, commensurate with standard industry graduate allowances').",
  },
  {
    id: "q14",
    category: "Salary & Closing",
    question: "Do you have any questions for us? (Always say YES!)",
    whatRecruitersLookFor:
      "Intellectual curiosity and seriousness. Saying 'No, you covered everything' is an immediate red flag.",
    sampleAnswer:
      "Yes, thank you! I have two brief questions: First, what distinguishes a graduate trainee who merely completes this program from one who truly accelerates into leadership within your division? Second, how does the team integrate recent AI tools or modern digital workflows into day-to-day operations?",
    proTip:
      "Never ask about closing time or vacation leave. Ask about internal performance benchmarks and innovation culture.",
  },
];

export function InterviewVault() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("q1");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    "All",
    "Executive Pitch",
    "STAR Behavioral",
    "Nigerian Graduate Specifics",
    "Salary & Closing",
  ];

  const filteredQuestions = VAULT_QUESTIONS.filter((q) => {
    const matchesCat = activeCategory === "All" || q.category === activeCategory;
    const matchesQuery =
      searchQuery.trim() === "" ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.sampleAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.proTip.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="w-full space-y-8">
      {/* Search & Categories Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. salary, conflict, tell me about yourself)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#00D2FF]"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-[#120D42]">{filteredQuestions.length}</span> curated corporate interview scripts
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-100">
          {categories.map((c) => {
            const isSelected = activeCategory === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#120D42] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5">
        {filteredQuestions.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all ${
                isExpanded
                  ? "border-[#00D2FF] shadow-md ring-1 ring-[#00D2FF]/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full text-left p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                      isExpanded
                        ? "bg-[#120D42] text-[#00D2FF]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A] leading-snug">
                      {item.question}
                    </h3>
                  </div>
                </div>

                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isExpanded ? "rotate-180 text-[#120D42]" : ""
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="px-5 pb-6 pt-1 border-t border-slate-100 space-y-4 text-xs">
                  {/* Recruiter Evaluation Insight */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-[#120D42] uppercase tracking-wider text-[10px] block mb-0.5">
                      What Recruiters Are Really Testing:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {item.whatRecruitersLookFor}
                    </p>
                  </div>

                  {/* STAR Breakdown if present */}
                  {item.starFramework && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                      <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                        <span className="font-bold text-blue-900 block text-[10px] uppercase">
                          Situation
                        </span>
                        <p className="text-blue-800 text-[11px] mt-1 leading-snug">
                          {item.starFramework.situation}
                        </p>
                      </div>
                      <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
                        <span className="font-bold text-purple-900 block text-[10px] uppercase">
                          Task
                        </span>
                        <p className="text-purple-800 text-[11px] mt-1 leading-snug">
                          {item.starFramework.task}
                        </p>
                      </div>
                      <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                        <span className="font-bold text-amber-900 block text-[10px] uppercase">
                          Action
                        </span>
                        <p className="text-amber-800 text-[11px] mt-1 leading-snug">
                          {item.starFramework.action}
                        </p>
                      </div>
                      <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-900 block text-[10px] uppercase">
                          Result
                        </span>
                        <p className="text-emerald-800 text-[11px] mt-1 leading-snug">
                          {item.starFramework.result}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Model Answer Box */}
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-100 relative group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[#120D42] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" /> Model Corporate Answer:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.sampleAnswer)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#120D42] bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        {copiedId === item.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Script
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-slate-800 text-xs sm:text-sm leading-relaxed italic bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                      &quot;{item.sampleAnswer}&quot;
                    </p>
                  </div>

                  {/* Pro Tip Callout */}
                  <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70">
                    <span className="font-bold text-amber-900 uppercase tracking-wider shrink-0">
                      Executive Pro-Tip:
                    </span>
                    <span>{item.proTip}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Two High-Value Companion Tool Cards: 48-Hour Checklist & Follow-Up Scripts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Checklist */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#120D42] mb-3">
              <CheckSquare className="w-3.5 h-3.5 text-[#00D2FF]" />
              The 48-Hour Countdown
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-3">
              Pre-Interview Readiness Checklist
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Print 3 clean hardcopies of your ATS CV generated from MLA.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Test Zoom / Google Meet audio, camera framing, and background lighting.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Prepare 2 strategic questions to ask the recruitment panel.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Review the employer&apos;s recent press releases, CEO keynotes, and product releases.</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <Link
              href="/mentorship/find"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#120D42] hover:text-[#00D2FF] transition-colors"
            >
              <Users className="w-4 h-4 text-[#00D2FF]" /> Book a 1-on-1 Mock Interview with an MLA Corporate Mentor →
            </Link>
          </div>
        </div>

        {/* Post-Interview Follow-Up Script */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 mb-3">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              Within 24 Hours Post-Interview
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-2">
              Executive Follow-Up Script (Email & WhatsApp)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Send this note within 24 hours to stand out in the recruiter&apos;s memory.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700 font-mono leading-relaxed">
              Dear [Interviewer Name / Recruitment Team],<br />
              Thank you for the opportunity to discuss the Graduate Trainee role today. I particularly appreciated learning about [Specific topic discussed, e.g. digital banking expansion]. Our conversation reinforced my enthusiasm to contribute to your team. Please let me know if you need any additional credentials.<br />
              Warm regards,<br />
              [Your Full Name] • [Phone Number]
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const script =
                  "Dear [Interviewer Name],\n\nThank you for the opportunity to discuss the Graduate Trainee position today. I thoroughly enjoyed learning more about your team's upcoming initiatives. The conversation affirmed my strong enthusiasm for joining your organization and contributing from day one.\n\nPlease let me know if you require any additional transcripts or portfolio references.\n\nWarm regards,\n[Your Full Name]\n[Phone Number]";
                navigator.clipboard.writeText(script);
                alert("Follow-up script copied to clipboard!");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Follow-Up Template
            </button>
          </div>
        </div>
      </div>

      {/* S. B. Omotoso Career Monographs Deep-Link */}
      <div className="bg-gradient-to-r from-[#120D42] to-[#161152] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30">
              <BookOpen className="w-3.5 h-3.5" /> Official Career Literature
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Master the Unwritten Rules of the Nigerian Corporate Workplace
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Authored by S. B. Omotoso, FCIA. Download comprehensive monographs including <em>From Graduate to Professional: A Guide to Workplace Excellence</em> and the <em>Life After Graduation Playbook</em> directly from the MLA digital library.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#00D2FF] hover:bg-[#38BDF8] text-[#120D42] font-bold text-xs shadow-lg transition-all"
            >
              <BookOpen className="w-4 h-4" /> Explore Digital Shop
            </Link>
            <Link
              href="/mentorship/find"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <Users className="w-4 h-4 text-[#00D2FF]" /> Corporate Mentors
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
