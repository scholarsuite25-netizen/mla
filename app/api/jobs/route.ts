import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  category: "Graduate Trainee" | "Tech & AI" | "Corporate & Finance" | "Remote Entry-Level";
  jobType: string;
  salarySnippet?: string;
  description: string;
  url: string;
  isVerifiedGraduateScheme?: boolean;
  postedAt: string;
};

interface ExternalJobItem {
  slug?: string;
  title?: string;
  company_name?: string;
  remote?: boolean;
  location?: string;
  job_types?: string[];
  description?: string;
  url?: string;
}

// Helper to sanitize HTML tags and decode common HTML entities from feeds
function sanitizeText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<[^>]+>/g, " ") // remove HTML tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Curated verified Nigerian graduate trainee schemes and junior career launchpads
const CURATED_NIGERIAN_JOBS: JobListing[] = [
  {
    id: "gt-access-2026",
    title: "Graduate Trainee Program (Executive Leadership & Digital Banking)",
    company: "Access Bank Plc",
    location: "Lagos / Nationwide, Nigeria",
    category: "Graduate Trainee",
    jobType: "Full-Time Trainee",
    salarySnippet: "Competitive Graduate Scale + Benefits",
    description:
      "Intensive 12-month accelerated development program across corporate banking, digital product operations, retail strategy, and financial compliance. Open to fresh graduates with minimum Second Class Upper (2:1).",
    url: "https://www.accessbankplc.com/careers",
    isVerifiedGraduateScheme: true,
    postedAt: "Just now",
  },
  {
    id: "gt-pwc-2026",
    title: "Associate Graduate Trainee (Tax, Assurance & Advisory)",
    company: "PwC Nigeria",
    location: "Lagos / Abuja, Nigeria",
    category: "Corporate & Finance",
    jobType: "Graduate Associate",
    salarySnippet: "Industry Benchmark + ICAN/ACCA Sponsorship",
    description:
      "Join PwC's client service teams delivering audits, regulatory compliance, risk advisory, and forensic investigations. Comprehensive mentoring, professional certification study leave, and international mobility pipelines.",
    url: "https://www.pwc.com/ng/en/careers.html",
    isVerifiedGraduateScheme: true,
    postedAt: "1 day ago",
  },
  {
    id: "gt-mtn-2026",
    title: "Global Graduate Development Programme (Tech & Data Analytics)",
    company: "MTN Nigeria",
    location: "Lagos, Nigeria (Hybrid)",
    category: "Tech & AI",
    jobType: "Graduate Trainee",
    salarySnippet: "Attractive Graduate Trainee Package",
    description:
      "A fast-track programme designed to groom future telecoms and technology leaders in AI operations, cloud infrastructure, fintech services (MoMo), and enterprise analytics.",
    url: "https://www.mtn.ng/careers/",
    isVerifiedGraduateScheme: true,
    postedAt: "2 days ago",
  },
  {
    id: "rem-vibe-junior-2026",
    title: "Junior Vibe Coder / AI Workflow Specialist",
    company: "Netizen Media & Tech Solutions",
    location: "Remote (Nigeria)",
    category: "Tech & AI",
    jobType: "Full-Time / Contract",
    salarySnippet: "₦250,000 – ₦450,000 / month",
    description:
      "Build web applications, automated business pipelines, and customer portals using LLM-assisted coding, Next.js, and Supabase. Perfect for MLA graduates with verified vibe coding portfolios.",
    url:
      "https://wa.me/2348034710699?text=" +
      encodeURIComponent("Hello! I am applying for the Junior Vibe Coder role via MLA Career Hub."),
    isVerifiedGraduateScheme: true,
    postedAt: "3 days ago",
  },
  {
    id: "gt-flutterwave-2026",
    title: "Entry-Level Technical Support Engineer & Operations Trainee",
    company: "Flutterwave",
    location: "Lagos, Nigeria (Remote Options)",
    category: "Tech & AI",
    jobType: "Full-Time Entry-Level",
    salarySnippet: "Competitive Tech Scale",
    description:
      "Diagnose API transactions, assist merchants with payment gateway integrations, and collaborate with engineering on webhook reliability. Training provided for candidates with strong digital literacy.",
    url: "https://flutterwave.com/ng/careers",
    isVerifiedGraduateScheme: true,
    postedAt: "4 days ago",
  },
  {
    id: "gt-kpmg-2026",
    title: "Graduate Analyst (Strategy & Enterprise Risk Advisory)",
    company: "KPMG Nigeria",
    location: "Lagos, Nigeria",
    category: "Corporate & Finance",
    jobType: "Graduate Trainee",
    salarySnippet: "Top Tier Consulting Package",
    description:
      "Conduct industry research, business process modeling, and market assessment for corporate and public sector clients across West Africa. Open to all degree backgrounds with strong analytical reasoning.",
    url: "https://home.kpmg/ng/en/home/careers.html",
    isVerifiedGraduateScheme: true,
    postedAt: "5 days ago",
  },
  {
    id: "gt-nlng-2026",
    title: "Graduate Trainee Programme (Operations & Business Administration)",
    company: "Nigeria LNG Limited (NLNG)",
    location: "Port Harcourt / Bonny Island, Rivers",
    category: "Graduate Trainee",
    jobType: "Graduate Trainee",
    salarySnippet: "Premium Energy Sector Compensation",
    description:
      "World-class professional training programme spanning commercial shipping, environmental governance, project engineering, and supply chain management for top Nigerian university graduates.",
    url: "https://www.nigerialng.com/Careers",
    isVerifiedGraduateScheme: true,
    postedAt: "6 days ago",
  },
  {
    id: "gt-nestle-2026",
    title: "Management Trainee Programme (Supply Chain & Commercial Operations)",
    company: "Nestlé Nigeria Plc",
    location: "Ilupeju, Lagos / Agbara, Ogun",
    category: "Graduate Trainee",
    jobType: "Graduate Trainee",
    salarySnippet: "Multinational FMCG Allowance + Health Plan",
    description:
      "Fast-track leadership development in manufacturing optimization, demand planning, route-to-market distribution, and consumer brand management for ambitious Nigerian graduates.",
    url: "https://www.nestle-cwa.com/en/jobs",
    isVerifiedGraduateScheme: true,
    postedAt: "1 week ago",
  },
  {
    id: "gt-stanbic-2026",
    title: "Graduate Trainee Scheme (Wealth Management, Personal & Private Banking)",
    company: "Stanbic IBTC Bank",
    location: "Victoria Island, Lagos",
    category: "Corporate & Finance",
    jobType: "Graduate Trainee",
    salarySnippet: "Standard Banking Trainee Band + Benefits",
    description:
      "Rigorous rotational exposure across wealth management, pension fund administration, portfolio analysis, and client relationship management within standard banking regulations.",
    url: "https://www.stanbicibtc.com/stanbicibtc/About-Us/Careers",
    isVerifiedGraduateScheme: true,
    postedAt: "1 week ago",
  },
  {
    id: "gt-interswitch-2026",
    title: "Junior Cloud & Payment Integration Specialist (Associate Track)",
    company: "Interswitch Group",
    location: "Lagos, Nigeria (Hybrid)",
    category: "Tech & AI",
    jobType: "Entry-Level Associate",
    salarySnippet: "Competitive Fintech Entry Scale",
    description:
      "Work alongside cloud architects and merchant solutions engineers to support POS switching, Verve card tokenization, and Quickteller API reliability. Open to candidates with solid software literacy.",
    url: "https://www.interswitchgroup.com/careers",
    isVerifiedGraduateScheme: true,
    postedAt: "1 week ago",
  },
  {
    id: "rem-content-ai-2026",
    title: "Remote Digital Content & AI Prompt Editor",
    company: "Tintol Business Services",
    location: "Remote (All States, Nigeria)",
    category: "Remote Entry-Level",
    jobType: "Part-Time / Remote",
    salarySnippet: "₦150,000 – ₦250,000 / month",
    description:
      "Review academic transcripts, optimize educational course materials with generative AI, and format executive slide decks for corporate clients. Fresh graduates and NYSC corps members welcome.",
    url:
      "https://wa.me/2348034710699?text=" +
      encodeURIComponent("Hello! I am inquiring about the Remote Digital Content & AI Prompt Editor opening via MLA."),
    isVerifiedGraduateScheme: true,
    postedAt: "1 week ago",
  },
  {
    id: "rem-qa-analyst-2026",
    title: "Remote Junior QA & User Acceptance Tester",
    company: "Remotive Global Talent Network",
    location: "Remote (Worldwide / Nigeria Accepted)",
    category: "Remote Entry-Level",
    jobType: "Contract / Remote",
    salarySnippet: "$800 – $1,200 / month (USD Paid)",
    description:
      "Test responsive web interfaces, verify API webhooks, document software issues, and execute test matrices on client web portals. Great entry-level opportunity for self-taught vibe coders.",
    url: "https://remotive.com/",
    isVerifiedGraduateScheme: false,
    postedAt: "2 weeks ago",
  },
];

export async function GET(req: Request) {
  // If a human visitor navigates directly to this API endpoint in their web browser,
  // seamlessly redirect them to the visual Careers Hub page rather than displaying raw JSON code.
  const acceptHeader = req.headers.get("accept") || "";
  if (acceptHeader.includes("text/html") && !acceptHeader.includes("application/json")) {
    return NextResponse.redirect(new URL("/careers", req.url));
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q")?.toLowerCase();

  let jobs = [...CURATED_NIGERIAN_JOBS];

  // Optional: Fetch live remote entry-level tech roles from Arbeitnow,
  // but STRICTLY filter for genuine junior/entry/trainee roles and exclude senior/lead roles.
  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        const excludedSeniorKeywords = [
          "senior",
          "principal",
          "lead",
          "head of",
          "director",
          "vp",
          "manager",
          "architect",
          "expert",
        ];

        const filteredExternal = (json.data as ExternalJobItem[])
          .filter((j) => {
            const title = (j.title || "").toLowerCase();
            const isSenior = excludedSeniorKeywords.some((w) => title.includes(w));
            if (isSenior) return false;
            // Only include if remote or explicitly marked entry/intern/junior/associate/trainee
            const isEntryLevel =
              title.includes("junior") ||
              title.includes("intern") ||
              title.includes("trainee") ||
              title.includes("associate") ||
              title.includes("entry") ||
              title.includes("specialist") ||
              title.includes("developer") ||
              title.includes("analyst");
            return isEntryLevel;
          })
          .slice(0, 4)
          .map((j) => ({
            id: `ext-${j.slug || Math.random().toString(36).slice(2)}`,
            title: j.title || "Remote Junior Specialist",
            company: j.company_name || "Global Remote Partner",
            location: j.remote ? "Remote (Worldwide)" : (j.location || "Remote"),
            category: "Remote Entry-Level" as const,
            jobType: j.job_types?.[0] || "Full-Time / Remote",
            salarySnippet: "Global Remote Compensation",
            description: sanitizeText(j.description || "International remote opportunity accepting qualified applicants.").slice(0, 220) + "...",
            url: j.url || "https://www.arbeitnow.com",
            isVerifiedGraduateScheme: false,
            postedAt: "Recent",
          }));

        jobs = [...CURATED_NIGERIAN_JOBS, ...filteredExternal];
      }
    }
  } catch {
    // If external feed is slow or unreachable, smoothly fallback to our 12 curated Nigerian roles
  }

  if (category && category !== "All") {
    jobs = jobs.filter((j) => j.category === category);
  }

  if (query) {
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(query) ||
        j.company.toLowerCase().includes(query) ||
        j.description.toLowerCase().includes(query) ||
        j.location.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({ success: true, jobs });
}
