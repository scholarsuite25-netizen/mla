import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey);

const pgClient = new pg.Client({
  connectionString: process.env.POSTGRES_URL_NON_POOLING.split("?")[0],
  ssl: { rejectUnauthorized: false },
});
await pgClient.connect();

const publications = [
  {
    title: "From Tradition to Technology: Reimagining Cultural Identity in the Age of AI",
    type: "ebook",
    filePath: "C:\\Users\\Registrar\\Downloads\\TRADITION TO TECHNOLOGY BOOK\\From Tradition to Technology - Reimagining Cultural Identity in the Age of Artificial Intelligence.pdf",
    contentType: "application/pdf",
    description: "A landmark treatise exploring how indigenous African institutions, cultural philosophy, and heritage can navigate the rapid advances of generative artificial intelligence without losing cultural sovereignty and ethical grounding.",
    excerpt: "Cultural identity is not an artifact frozen in antiquity; it is a living river of human consciousness that must inform how algorithmic models interpret our heritage, languages, and future...",
  },
  {
    title: "The Resilient Nigerian Entrepreneur",
    type: "ebook",
    filePath: "C:\\Users\\Registrar\\Downloads\\The_Resilient_Nigerian_Entrepreneur_Manuscript.pdf",
    contentType: "application/pdf",
    description: "An empirical examination of entrepreneurial resilience, operational fortitude, and systemic survival strategies in volatile, uncertain, complex, and ambiguous (VUCA) emerging economies.",
    excerpt: "True entrepreneurship in the developing world is not the romantic luxury of endless venture capital; it is the discipline of resilience, resourcefulness, and unyielding perseverance against institutional friction...",
  },
  {
    title: "How to Plan a Comfortable Retirement: An Executive Guide",
    type: "ebook",
    filePath: "C:\\Users\\Registrar\\Downloads\\DOWNLAOD FOR ACTION\\How to Plan a Comfortable Retirement.pdf",
    contentType: "application/pdf",
    description: "A practical, strategic roadmap for public servants, corporate executives, and educational leaders to build post-active career wealth, health, mental wellness, and purposeful longevity.",
    excerpt: "Retirement is neither an abrupt cessation of productivity nor an invitation to obsolescence. Planned proactively, it is the golden epoch of advisory, legacy building, and financial independence...",
  },
  {
    title: "How to Study and Pass Examinations: A Step-by-Step Guide",
    type: "ebook",
    filePath: "C:\\Users\\Registrar\\Downloads\\ALL IN ONE DOWNLOAD\\Downloads\\MATERIALS FROM FLASH DISK\\HOW TO STUDY AND PASS IN EXAMINATIONS - A Step by Step Guide-1.pdf",
    contentType: "application/pdf",
    description: "A proven, pedagogical handbook designed to assist students and university scholars in mastering spaced repetition, critical comprehension, memory consolidation, and examination calmness.",
    excerpt: "Academic excellence is not an accident of innate genius; it is a systematic habit. When systematic study habits replace eleventh-hour cramming, examination fear dissolves into mastery...",
  },
  {
    title: "Practical Guide to Career Success",
    type: "monograph",
    filePath: "C:\\Users\\Registrar\\Downloads\\DOWNLAOD FOR ACTION\\Practical Guide to Career Success.docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    description: "An actionable career acceleration handbook detailing professional diplomacy, emotional intelligence, organizational politics, mentorship, and ethical advancement in modern institutions.",
    excerpt: "Competence will get you to the door of opportunity, but character, communication, and emotional resilience are the three levers that keep you inside the boardroom...",
  },
  {
    title: "Governance, Innovation and Service for Resilience (Keynote Deck)",
    type: "lecture_slides",
    filePath: "C:\\Users\\Registrar\\Downloads\\GOVERNANCE^J INNOVATION AND SERVICE for resilience.pptx",
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    description: "The complete keynote slide deck delivered by S. B. Omotoso addressing institutional leadership, registry modernization, digital service delivery, and resilient governance.",
    excerpt: "Slide Highlights: The Tripartite Pillars of Modern Registry Governance — Institutional Memory, Digital Agility, and Uncompromising Ethical Service under stress...",
  },
  {
    title: "From Tradition to Technology: Executive Keynote Slides",
    type: "lecture_slides",
    filePath: "C:\\Users\\Registrar\\Downloads\\From_Tradition_to_Technology_Slides.pptx",
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    description: "Executive presentation deck accompanying the acclaimed book, detailing AI ethics, cultural taxonomy, and educational innovation for university and corporate audiences.",
    excerpt: "Visual Frameworks: The AI Heritage Continuum, Algorithmic Sovereign Ethics, and Technological Adaptation Matrix...",
  },
  {
    title: "Maintaining Your Integrity in Difficult Times (Keynote Presentation)",
    type: "lecture_slides",
    filePath: "C:\\Users\\Registrar\\Downloads\\ALL IN ONE DOWNLOAD\\ \\MOYIN\\MOYIN 3\\Maintaining your integrity in difficult times.pptx",
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    description: "High-impact keynote presentation on ethical leadership, resisting administrative corruption, and preserving institutional credibility during organizational crises.",
    excerpt: "A compromised conscience is too high a price to pay for temporary administrative survival. Integrity remains the sole asset that outlives tenure...",
  },
  {
    title: "Academic Masterclass: How to Study (Bowen University Lecture)",
    type: "lecture_slides",
    filePath: "C:\\Users\\Registrar\\Downloads\\ALL IN ONE DOWNLOAD\\Downloads\\MATERIALS FROM FLASH DISK\\Lecture_How to Study_BowenU_031013.pptx",
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    description: "Official lecture presentation delivered at Bowen University on study methodologies, cognitive retention, and intellectual diligence for tertiary students.",
    excerpt: "Core Lecture Tenets: Managing time effectively, annotating academic literature, and synthesizing complex scholarly arguments...",
  },
  {
    title: "Executive Masterclass: AI Literacy, Vibe Coding and Web App Development",
    type: "training_manual",
    filePath: "C:\\Users\\Registrar\\Downloads\\PROPOSAL ON TBS AI LITERACY, VIBE CODING AND WEB APP DEVELOPMENT.pdf",
    contentType: "application/pdf",
    description: "Comprehensive blueprint and syllabus for training executives and developers in modern AI literacy, autonomous agentic development, and rapid vibe coding.",
    excerpt: "Vibe coding represents the democratization of software creation: bridging human conceptual design with state-of-the-art LLM architectures...",
  },
  {
    title: "AI Literacy for All: Practical Training Manual",
    type: "training_manual",
    filePath: "C:\\Users\\Registrar\\Downloads\\AI Literacy for All.docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    description: "Hands-on curriculum notes covering prompt formulation, workflow automation, ethical guidelines, and artificial intelligence productivity tools for professionals.",
    excerpt: "Practical Modules: Foundation of prompt mechanics, iterative refinement, fact-checking AI hallucination, and everyday workflow automation...",
  },
  {
    title: "Executive Prompt Engineering Handbook",
    type: "training_manual",
    filePath: "C:\\Users\\Registrar\\Downloads\\Prompt Engineering (1).docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    description: "Advanced reference guide for prompt patterns, few-shot prompting, system role engineering, and precision elicitation from modern language models.",
    excerpt: "Mastering the cognitive architecture of LLMs: Chain-of-thought, persona grounding, temperature manipulation, and deterministic constraint structuring...",
  },
  {
    title: "Registrar's Keynote Monograph: Maiden Registry Discourse",
    type: "monograph",
    filePath: "C:\\Users\\Registrar\\Downloads\\Registrar_Opening_Remarks_Maiden_Registry_Discourse.pdf",
    contentType: "application/pdf",
    description: "Official opening remarks and monograph delivered at the Maiden Registry Discourse, Chrisland University, Abeokuta on university registry administration and best practices.",
    excerpt: "The Registry is the heartbeat and institutional memory of the university; without a robust, forward-looking registry, academic excellence lacks foundation...",
  },
  {
    title: "Abeokuta AI Studio Masterclass & Creative Prompts Publication",
    type: "training_manual",
    filePath: "C:\\Users\\Registrar\\Music\\Abeokuta-AI-Studio-Prompts\\Abeokuta-AI-Studio-Prompts\\Abeokuta Approved Print final.pdf",
    contentType: "application/pdf",
    description: "Curated masterclass edition featuring approved creative prompt designs, multi-modal generative media workflows, and studio-grade AI techniques.",
    excerpt: "Approved Studio Workflows: High-fidelity image prompting, semantic tone blending, and multi-modal generative production...",
  },
];

console.log("=== SEEDING REAL PUBLICATIONS AND TRAINING MATERIALS ===");

// 1. Archive mock test items
const archivedMocks = await pgClient.query(
  "UPDATE digital_products SET status = 'draft' WHERE title LIKE 'Pub 1789%' OR title LIKE 'Draft 1789%'"
);
console.log(`Archived ${archivedMocks.rowCount} mock test items.`);

// 2. Upload and insert each publication
for (let i = 0; i < publications.length; i++) {
  const pub = publications[i];
  console.log(`\n[${i + 1}/${publications.length}] Processing: ${pub.title}`);
  
  if (!fs.existsSync(pub.filePath)) {
    console.error(`  ERROR: File does not exist: ${pub.filePath}`);
    continue;
  }

  const fileBuffer = fs.readFileSync(pub.filePath);
  const baseName = path.basename(pub.filePath);
  const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `product-files/${crypto.randomUUID()}-${safeName}`;

  console.log(`  Uploading to storage: ${storagePath} (${(fileBuffer.length / 1024).toFixed(1)} KB)...`);
  const { error: uploadError } = await admin.storage
    .from("product-files")
    .upload(storagePath, fileBuffer, {
      contentType: pub.contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error(`  Upload failed: ${uploadError.message}`);
    continue;
  }
  console.log(`  Upload successful!`);

  // Check if product with title already exists
  const existing = await pgClient.query(
    "SELECT id FROM digital_products WHERE title = $1",
    [pub.title]
  );

  if (existing.rows.length > 0) {
    const id = existing.rows[0].id;
    await pgClient.query(
      `UPDATE digital_products 
          SET file_url = $1, type = $2, description = $3, preview_excerpt_text = $4, status = 'published', updated_at = now()
        WHERE id = $5`,
      [storagePath, pub.type, pub.description, pub.excerpt, id]
    );
    console.log(`  Updated existing product record (ID: ${id})`);
  } else {
    const insertRes = await pgClient.query(
      `INSERT INTO digital_products (
         title, type, description, price, status, file_url, preview_excerpt_text, created_at, updated_at
       ) VALUES ($1, $2, $3, 0.00, 'published', $4, $5, now(), now())
       RETURNING id`,
      [pub.title, pub.type, pub.description, storagePath, pub.excerpt]
    );
    console.log(`  Inserted new product (ID: ${insertRes.rows[0].id}, Price: ₦0.00 Free, Status: published)`);
  }
}

const finalCount = await pgClient.query(
  "SELECT id, title, type, price, status, file_url FROM digital_products ORDER BY created_at DESC"
);
console.log(`\n=== FINAL PRODUCTS IN STORE (${finalCount.rows.length} Total) ===`);
console.table(finalCount.rows.map(r => ({
  title: r.title.slice(0, 45) + "...",
  type: r.type,
  price: `₦${r.price}`,
  status: r.status,
  file_url: r.file_url ? r.file_url.slice(0, 35) + "..." : "none"
})));

await pgClient.end();
