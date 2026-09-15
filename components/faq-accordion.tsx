"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How does cross-institution mentorship work?",
    answer:
      "Once you register under your university or polytechnic, you can browse verified student leaders and faculty mentors from any participating Nigerian institution. Submit a request detailing your goals, and once approved, you gain direct 1-to-1 mentorship channels.",
  },
  {
    question: "Are the AI Literacy & Vibe Coding courses completely free?",
    answer:
      "Yes. All core curriculum modules — including AI Literacy, prompt workflows, vibe coding with Next.js, and autonomous tools — are completely free for registered members with automated progress tracking.",
  },
  {
    question: "How does my higher institution get officially recognized?",
    answer:
      "When registering, type your institution name. If it's already active, you join immediately. If new, it is provisioned instantly on the platform. Student leaders or faculty members can then request Institution Admin rights to oversee their campus hub.",
  },
  {
    question: "How are digital shop materials and license keys protected?",
    answer:
      "Digital textbooks and software in the MLA shop are cryptographically signed with unique HMAC license keys. Downloaded PDFs are personalized with dynamic watermarks containing your name and email, with hardware activation limits enforced.",
  },
  {
    question: "Can I be both a learner and a mentor?",
    answer:
      "Absolutely. Many fellows study advanced AI modules while simultaneously mentoring junior students in their campus or across neighboring institutions in areas where they excel.",
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
              <div className={`ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 transition-transform duration-200 ${isOpen ? "rotate-180 border-gold/40 text-gold" : "text-parchment/50"}`}>
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
