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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#120D42] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-400">
              <BookOpen size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">
                Sample Excerpt & Outline
              </span>
              <h2 className="font-sans font-bold text-base text-white truncate max-w-md">
                {title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("excerpt")}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all mr-6 ${
              activeTab === "excerpt"
                ? "border-cyan-500 text-[#120D42]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Read Sample Excerpt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contents")}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "contents"
                ? "border-cyan-500 text-[#120D42]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Table of Contents ({defaultContents.length})
          </button>
        </div>

        {/* Reader Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-white">
          {activeTab === "excerpt" ? (
            <div className="max-w-none space-y-4 text-slate-700 leading-relaxed font-normal">
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 text-xs font-medium text-slate-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-cyan-600 shrink-0" />
                <span>You are previewing a free sample excerpt of these official keynote lecture notes.</span>
              </div>

              <div className="whitespace-pre-line text-sm md:text-base leading-relaxed bg-slate-50 border border-slate-100 rounded-2xl p-6 font-mono text-slate-800">
                {defaultExcerpt}
              </div>

              {/* Locked Notice Card */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-cyan-50/30 p-6 text-center space-y-3 mt-8">
                <div className="flex h-11 w-11 mx-auto items-center justify-center rounded-2xl bg-[#120D42] text-cyan-400 shadow-md">
                  <Lock size={20} />
                </div>
                <h4 className="font-bold text-lg text-slate-900">
                  Unlock the Complete 28-Page Lecture Notes & Slides
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Includes full presentation transcripts, downloadable PDF, accompanying slide deck (.pptx), and personal forensic watermarking.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBuyClick?.();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#120D42] hover:bg-[#1b145a] px-8 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <ShoppingBag size={15} className="text-cyan-300" />
                  <span>Get Full Material (₦{Number(price).toLocaleString()})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 mb-4">
                Structured module overview and topical lecture breakdown:
              </p>
              {defaultContents.map((chapter, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-800 hover:border-cyan-200 hover:bg-cyan-50/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 text-[#120D42] text-xs font-bold shadow-xs">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{chapter}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Official Keynote Materials by Tintol Business Services
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onBuyClick?.();
            }}
            className="flex items-center gap-2 rounded-xl bg-[#00D2FF] hover:bg-[#38BDF8] px-6 py-2.5 text-xs font-bold text-[#120D42] shadow-sm transition-all cursor-pointer"
          >
            <span>Buy Full Notes (₦{Number(price).toLocaleString()})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
