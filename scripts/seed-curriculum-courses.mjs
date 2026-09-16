import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.POSTGRES_URL_NON_POOLING;
if (!connectionString) {
  console.error("Missing POSTGRES_URL_NON_POOLING in .env.local");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: connectionString.split("?")[0],
  ssl: { rejectUnauthorized: false },
});

const coursesData = [
  {
    title: "Executive Career Planning & Accelerated Development",
    description:
      "Strategic roadmap design, executive presence, high-stakes compensation negotiation, and promotional trajectory for ambitious corporate leaders and managers.",
    category: "Career Planning & Development",
    level: "Executive",
    estimated_duration: "6 Weeks",
    instructor_name: "Dr. Adebayo Mustapha & MLA Faculty",
    instructor_title: "Executive Career Director & Senior Fellow",
    certificate_enabled: true,
    featured: true,
    cover_image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    modules: [
      {
        title: "Module 1: Career Architecture & Strategic Positioning",
        content: `### Career Capital & Promotional Trajectory

Welcome to **Module 1 of Executive Career Planning**. In this lesson, we break down the fundamental architecture of career progression in high-stakes corporate environments.

#### Key Learning Objectives:
1. **Audit Your Career Capital**: Differentiate between skills that keep you employed versus skills that get you promoted.
2. **Personal Brand Alignment**: Ensure internal perception among directors matches your external achievements.
3. **The 1-3-5 Year Milestone Blueprint**: Mapping specific revenue, operational, and organizational milestones to guarantee sponsorship.

> *"Promotions are never awarded based on past hard work alone; they are allocated based on perceived readiness to solve the organization's next existential problem."*`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 45,
        is_free_preview: true,
        resources: [
          { title: "Executive Career Audit Template (PDF)", url: "https://mla.org.ng/docs/career-audit.pdf" },
          { title: "Promotional Scorecard Matrix", url: "https://mla.org.ng/docs/promo-matrix.pdf" },
        ],
      },
      {
        title: "Module 2: Executive Presence, Influence & Stakeholder Politics",
        content: `### Cross-Functional Leadership & Influence Without Authority

In this module, senior leaders learn how to navigate upward dynamics, manage difficult board relationships, and build unbreakable coalitions across business units.

#### Core Frameworks:
- **Upward Stakeholder Mapping**: Identifying champions, neutral observers, and blockers.
- **High-Stakes Meeting Dynamics**: The *pre-meeting alignment technique* used by Fortune 500 VPs.
- **De-escalation Strategies**: Maintaining unflappable poise under boardroom scrutiny.`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 60,
        is_free_preview: false,
        resources: [
          { title: "Stakeholder Power-Interest Grid", url: "https://mla.org.ng/docs/power-grid.pdf" },
        ],
      },
      {
        title: "Module 3: High-Stakes Salary Negotiation & Compensation Pathways",
        content: `### Value Packaging & Negotiation Protocols

Master the exact language and tactical scripts to negotiate bonuses, stock options, equity tranches, and base salary bumps during annual performance reviews.`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 50,
        is_free_preview: false,
        resources: [],
      },
      {
        title: "Module 4: High-Performance Team Management & Strategic Delegation",
        content: `### Transitioning from Operator to Multiplier

True executive value comes from developing leaders under you. Learn OKR setting, psychological safety without dropping standards, and coaching mid-level managers.`,
        lesson_type: "reading",
        video_url: null,
        duration_minutes: 45,
        is_free_preview: false,
        resources: [],
      },
    ],
  },
  {
    title: "Entrepreneurship, Business Setup & Scalable Management",
    description:
      "Comprehensive business formalization in Nigeria: CAC registration, tax compliance, financial unit economics, Paystack checkout integration, and autonomous AI operations.",
    category: "Entrepreneurship & Management",
    level: "All Levels",
    estimated_duration: "8 Weeks",
    instructor_name: "Olamide Shodipo & Founder Fellows",
    instructor_title: "Director of Venture Incubation",
    certificate_enabled: true,
    featured: true,
    cover_image_url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    modules: [
      {
        title: "Module 1: Market Discovery & Willingness-To-Pay Validation",
        content: `### Validating Demand with Zero Ad Waste

Before spending money on logos, incorporation, or software, you must test whether target customers will pull out their debit cards to pay.

#### Discovery Methodology:
1. Conducting 25 problem interviews without pitching your solution.
2. Building concierge MVPs to validate customer willingness-to-pay.
3. Pricing for high gross margins from day one.`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 40,
        is_free_preview: true,
        resources: [
          { title: "Customer Discovery Interview Guide", url: "https://mla.org.ng/docs/discovery-guide.pdf" },
        ],
      },
      {
        title: "Module 2: Corporate Affairs Commission (CAC) Setup & Governance",
        content: `### Formalizing Your Legal Structure

Step-by-step guidance on registering your Private Limited Company (Ltd), issuing shares, drafting founder agreements, and filing tax IDs (TIN).`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 55,
        is_free_preview: false,
        resources: [
          { title: "Standard Founder Agreement Template", url: "https://mla.org.ng/docs/founder-agreement.pdf" },
        ],
      },
      {
        title: "Module 3: Unit Economics, Working Capital & Paystack Integration",
        content: `### Cashflow Management & Payment Collection

Understanding customer acquisition cost (CAC), lifetime value (LTV), contribution margins, and configuring Paystack for automated payment settlements.`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 60,
        is_free_preview: false,
        resources: [],
      },
    ],
  },
  {
    title: "Applied AI Literacy, Prompt Engineering & Vibe Coding",
    description:
      "Transform into an AI-augmented professional. Master context windows, LLM agents, vibe coding for rapid software creation, and automated business workflows.",
    category: "Technology & AI",
    level: "Beginner to Pro",
    estimated_duration: "4 Weeks",
    instructor_name: "MLA Technical Leadership",
    instructor_title: "Chief AI Architect & Fellow",
    certificate_enabled: true,
    featured: true,
    cover_image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    modules: [
      {
        title: "Module 1: Foundations of Modern AI & System Prompting",
        content: `### Understanding Large Language Models

Demystifying tokenization, temperature, system prompts, and multi-turn reasoning to achieve 10x output speed in research, writing, and analysis.`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 35,
        is_free_preview: true,
        resources: [
          { title: "Universal Prompt Engineering Cheatsheet", url: "https://mla.org.ng/docs/prompt-cheatsheet.pdf" },
        ],
      },
      {
        title: "Module 2: Vibe Coding — Building Real Web Apps Without Boilerplate",
        content: `### From Natural Language to Production Code

Learn how modern developers use AI tools to generate React components, database schemas, and Tailwind styles in minutes.`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 55,
        is_free_preview: false,
        resources: [],
      },
      {
        title: "Module 3: Autonomous Agents & Automated Business Pipelines",
        content: `### Multi-Agent Workflows & Tool Calling

Setting up autonomous agent loops that perform background research, file processing, and webhook triggers with zero manual intervention.`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 50,
        is_free_preview: false,
        resources: [],
      },
    ],
  },
  {
    title: "Retirement Planning & Second-Act Consulting",
    description:
      "Structured transition for seasoned executives: pension optimization, wealth preservation, high-ticket consulting, and board directorships.",
    category: "Second-Act & Advisory",
    level: "Advanced",
    estimated_duration: "4 Weeks",
    instructor_name: "Engr. Babatunde Adeleke",
    instructor_title: "Senior Advisory Fellow & Board Director",
    certificate_enabled: true,
    featured: false,
    cover_image_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80",
    modules: [
      {
        title: "Module 1: Capital Preservation & Pension Strategy",
        content: `### Safeguarding Wealth in Volatile Markets

De-risking your investment portfolio, inflation hedging, and structuring guaranteed annuity income streams for peace of mind.`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 45,
        is_free_preview: true,
        resources: [
          { title: "Retirement Cashflow Planner (Excel/PDF)", url: "https://mla.org.ng/docs/retirement-planner.pdf" },
        ],
      },
      {
        title: "Module 2: Packaging Decades of Executive Wisdom into High-Ticket Retainers",
        content: `### From Employee to Independent Advisor

How to package your executive background into strategic advisory packages that SMEs and institutions eagerly pay millions annually to access.`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 60,
        is_free_preview: false,
        resources: [],
      },
    ],
  },
  {
    title: "Graduate Career Planning & Job-Search Accelerator",
    description:
      "Early-career mastery for fresh graduates & NYSC: ATS-optimized CV design, proof-of-work portfolio building, mock interviews, and alumni networking.",
    category: "Graduate & Early Career",
    level: "Foundational",
    estimated_duration: "4 Weeks",
    instructor_name: "Fatima Balogun & Career Coaches",
    instructor_title: "Head of Graduate Placement",
    certificate_enabled: true,
    featured: false,
    cover_image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    modules: [
      {
        title: "Module 1: ATS-Compliant CV Architecture & LinkedIn Makeover",
        content: `### Getting Past the Automated Gatekeepers

How Fortune 500 and African corporate recruiters scan CVs, and how to write bullet points that highlight quantified business impact even as a fresh graduate.`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 40,
        is_free_preview: true,
        resources: [
          { title: "ATS CV Template (Word / PDF)", url: "https://mla.org.ng/docs/ats-template.pdf" },
        ],
      },
      {
        title: "Module 2: Proof-of-Work Portfolios & Real Deployed Projects",
        content: `### Standing Out Beyond Certificates

Building real deployed projects and case studies using vibe coding to prove your capability to employers before the first interview.`,
        lesson_type: "video",
        video_url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        duration_minutes: 50,
        is_free_preview: false,
        resources: [],
      },
    ],
  },
];

async function seed() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    // 1. Clean up old test courses named 'RLS Published Course' or 'RLS Draft Course'
    await client.query("delete from public.courses where title in ('RLS Published Course', 'RLS Draft Course')");
    console.log("Cleaned up old RLS test courses.");

    for (const c of coursesData) {
      // Check if course with this title exists
      const { rows: existing } = await client.query(
        "select id from public.courses where title = $1 limit 1",
        [c.title]
      );

      let courseId;
      if (existing.length > 0) {
        courseId = existing[0].id;
        await client.query(
          `update public.courses set
            description = $1,
            category = $2,
            level = $3,
            estimated_duration = $4,
            instructor_name = $5,
            instructor_title = $6,
            certificate_enabled = $7,
            featured = $8,
            cover_image_url = $9,
            status = 'published',
            updated_at = now()
           where id = $10`,
          [
            c.description,
            c.category,
            c.level,
            c.estimated_duration,
            c.instructor_name,
            c.instructor_title,
            c.certificate_enabled,
            c.featured,
            c.cover_image_url,
            courseId,
          ]
        );
        console.log(`Updated course: ${c.title}`);
      } else {
        const { rows: inserted } = await client.query(
          `insert into public.courses (
            title, description, category, level, estimated_duration,
            instructor_name, instructor_title, certificate_enabled, featured,
            cover_image_url, status
          ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'published')
          returning id`,
          [
            c.title,
            c.description,
            c.category,
            c.level,
            c.estimated_duration,
            c.instructor_name,
            c.instructor_title,
            c.certificate_enabled,
            c.featured,
            c.cover_image_url,
          ]
        );
        courseId = inserted[0].id;
        console.log(`Created course: ${c.title}`);
      }

      // Delete existing modules for this course to ensure clean syllabus sync
      await client.query("delete from public.course_modules where course_id = $1", [courseId]);

      // Insert fresh modules
      for (let i = 0; i < c.modules.length; i++) {
        const m = c.modules[i];
        await client.query(
          `insert into public.course_modules (
            course_id, title, content, order_index, lesson_type,
            video_url, duration_minutes, is_free_preview, resources
          ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            courseId,
            m.title,
            m.content,
            i,
            m.lesson_type,
            m.video_url,
            m.duration_minutes,
            m.is_free_preview,
            JSON.stringify(m.resources),
          ]
        );
      }
      console.log(`  -> Inserted ${c.modules.length} lessons for ${c.title}`);
    }

    console.log("All 5 official Academy Curriculum courses seeded successfully!");
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
