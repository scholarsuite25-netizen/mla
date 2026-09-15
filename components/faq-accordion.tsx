"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Who can join MLA? Is it only for university students?",
    answer:
      "No. While higher institutions are one of our key learning tracks, MLA is built for everyone: working professionals upskilling in AI, fresh graduates and NYSC corps members launching their careers, job seekers transitioning into tech, self-employed entrepreneurs building digital businesses, and campus scholars. Everyone gets dedicated mentorship and practical curriculum.",
  },
  {
    question: "I work full-time. Can I learn and receive mentorship on my own schedule?",
    answer:
      "Yes. All AI Literacy, vibe coding, and leadership curriculum modules are 100% self-paced. Mentorship sessions, office hours, and masterclasses are scheduled flexibly with evening and weekend options to accommodate busy corporate work schedules.",
  },
  {
    question: "How does MLA help fresh graduates and job seekers get hired?",
    answer:
      "MLA focuses on proof-of-work rather than just theory. Through our vibe coding and AI workflows, you will build and deploy real applications, automated tools, and digital solutions that serve as an unassailable portfolio. You also connect 1-on-1 with industry mentors who review CVs and provide interview guidance.",
  },
  {
    question: "I am self-employed or run a business. How will this help me with setup and management?",
    answer:
      "Our Entrepreneurship, Business Setup & Management track covers everything from Corporate Affairs Commission (CAC) formalization, legal structures, and unit economics to Paystack payment integration and digital marketing. Founders also learn how to leverage autonomous AI agents to automate operations and manage teams effectively without massive overhead.",
  },
  {
    question: "Do you offer Retirement Planning and Post-Retirement Occupation support?",
    answer:
      "Yes. Our 'Executive Legacy & Second-Act' track is specially designed for pre-retirees and retired professionals. It covers pension optimization, wealth preservation, and structuring post-retirement occupations — including high-ticket consulting, board advisory roles, angel syndicates, and legacy enterprise creation.",
  },
  {
    question: "How is Career Planning and Professional Development integrated?",
    answer:
      "Career planning is woven into every track. Whether you are navigating your first graduate job or gunning for executive C-suite promotion, we provide structured progression roadmaps, high-stakes negotiation frameworks, CV/portfolio reviews, and 1-on-1 coaching with industry executives.",
  },
  {
    question: "How does cross-sector and cross-institution mentorship work?",
    answer:
      "You can search verified mentors across industry verticals (Fintech, Corporate Leadership, Tech, Design) as well as university faculty. Submit a request stating your objectives, and once accepted, you unlock 1-on-1 coaching, progress milestones, and collaborative channels.",
  },
  {
    question: "Are the AI Literacy & Vibe Coding courses free?",
    answer:
      "Yes. All core curriculum modules — from prompt workflows and LLM architectures to full-stack vibe coding with Next.js and autonomous agents — are completely free for registered members with verifiable completion certificates.",
  },
  {
    question: "How are digital shop tools and license keys protected?",
    answer:
      "Textbooks, starter code kits, and software tools in the MLA store are cryptographically secured with unique HMAC license keys. Downloads feature dynamic personalization watermarks and hardware activation limits to safeguard intellectual property.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/[0.08]">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="py-4 first:pt-0 last:pb-0">
            <button
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between text-left transition-colors group"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-parchment group-hover:text-gold sm:text-base">
                <HelpCircle size={16} className="text-gold shrink-0 opacity-70 group-hover:opacity-100" />
                {faq.question}
              </span>
              <div
                className={`ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 transition-transform duration-200 ${
                  isOpen ? "rotate-180 border-gold/40 text-gold" : "text-parchment/50"
                }`}
              >
                <ChevronDown size={14} />
              </div>
            </button>
            {isOpen && (
              <div className="mt-3 pl-7 pr-4 text-xs sm:text-sm leading-relaxed text-parchment/70 animate-in fade-in duration-200">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
