"use client";

import { useState } from "react";
import { BookOpen, X, ChevronRight, CheckCircle2, Lock, ShoppingBag } from "lucide-react";

export type SamplePreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  price: number;
  description?: string;
  excerptText?: string | null;
  tableOfContents?: string[] | null;
  onBuyClick?: () => void;
};

export function SamplePreviewModal({
  isOpen,
  onClose,
  title,
  price,
  excerptText,
  tableOfContents,
  onBuyClick,
}: SamplePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"excerpt" | "contents">("excerpt");

  if (!isOpen) return null;

  const defaultExcerpt = excerptText || `
### Keynote Introduction & Framework

In today's fast-evolving landscape, traditional systems no longer suffice. This lecture synthesizes over a decade of executive advisory, field practice, and transformative methodologies into a high-impact blueprint.

#### Pillar 1: The Foundation of Influence
True leadership and authority are not established through titles or ceremonial positioning, but through structured leverage, consistent clarity, and high-trust systems.

> "Clarity is the ultimate differentiator. When expectations and systems are unambiguously defined, execution becomes organic."

#### Pillar 2: Actionable Execution Protocols
1. **Diagnosis Before Prescription**: Never apply solutions to symptoms before identifying the structural root cause.
2. **Asymmetric Leverage**: Identify the 20% of initiatives that generate 80% of institutional momentum.
3. **Continuous Feedback Loops**: Build telemetry and checkpoints directly into team workflows.

*(Full lecture notes continue for 28 pages with companion worksheets, reference frameworks, and presentation slides)*.
`;

  const defaultContents = tableOfContents && tableOfContents.length > 0 ? tableOfContents : [
    "1. Executive Summary & Core Thesis",
    "2. The 4 Principles of Strategic Influence",
    "3. Framework Architecture & Real-World Case Studies",
    "4. Execution Roadmaps & Actionable Checklists",
    "5. Audience Q&A Analysis & Discussion Prompts",
    "6. Companion Reference Guide & Further Reading",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-gold/30 bg-[#120D09] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#18110C] shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen size={20} className="text-gold" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold block">
                Sample Excerpt & Outline
              </span>
              <h2 className="font-display text-base text-parchment truncate max-w-md">
                {title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-parchment/60 hover:bg-white/10 hover:text-parchment transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 bg-black/30 px-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("excerpt")}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all mr-6 ${
              activeTab === "excerpt"
                ? "border-gold text-gold"
                : "border-transparent text-parchment/50 hover:text-parchment"
            }`}
          >
            Read Sample Excerpt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contents")}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "contents"
                ? "border-gold text-gold"
                : "border-transparent text-parchment/50 hover:text-parchment"
            }`}
          >
            Table of Contents ({defaultContents.length})
          </button>
        </div>

        {/* Reader Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {activeTab === "excerpt" ? (
            <div className="prose prose-invert prose-parchment max-w-none space-y-4 text-parchment/80 leading-relaxed font-light">
              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-xs text-gold/90 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-gold shrink-0" />
                <span>You are previewing a free sample excerpt of these official lecture notes.</span>
              </div>

              <div className="whitespace-pre-line text-sm md:text-base leading-relaxed">
                {defaultExcerpt}
              </div>

              {/* Locked Notice Card */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-white/[0.08] p-6 text-center space-y-3 mt-8">
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-gold/20 text-gold">
                  <Lock size={20} />
                </div>
                <h4 className="font-display text-lg text-parchment">
                  Unlock the Complete 28-Page Lecture Notes & Slides
                </h4>
                <p className="text-xs text-parchment/60 max-w-md mx-auto">
                  Includes full presentation transcripts, downloadable PDF, accompanying slide deck (.pptx), and personal forensic watermarking.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBuyClick?.();
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-dark to-gold px-8 py-3 text-xs font-bold text-ink hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer"
                >
                  <ShoppingBag size={15} />
                  <span>Get Full Material (₦{Number(price).toLocaleString()})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-parchment/60 mb-4">
                Structured module overview and topical lecture breakdown:
              </p>
              {defaultContents.map((chapter, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-parchment/90 hover:border-gold/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 text-gold text-xs font-mono font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium">{chapter}</span>
                  </div>
                  <ChevronRight size={16} className="text-parchment/40" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4 bg-[#18110C] flex items-center justify-between shrink-0">
          <span className="text-xs text-parchment/50">
            Official Keynote Materials by Tintol Business Services
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onBuyClick?.();
            }}
            className="flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-xs font-bold text-ink hover:bg-gold-light transition-all cursor-pointer"
          >
            <span>Buy Full Notes (₦{Number(price).toLocaleString()})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
