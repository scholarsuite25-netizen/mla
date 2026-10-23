"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Briefcase,
  HelpCircle,
  Code2,
  Sparkles,
  Users,
  CheckCircle2,
} from "lucide-react";
import { CVBuilder } from "@/components/careers/cv-builder";
import { JobBoard } from "@/components/careers/job-board";
import { InterviewVault } from "@/components/careers/interview-vault";

export function CareersClientHub() {
  const [activeTab, setActiveTab] = useState<"cv" | "jobs" | "interview" | "vibe">("cv");

  return (
    <div className="w-full space-y-8">
      {/* Primary Tab Bar */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("cv")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "cv"
              ? "bg-[#120D42] text-white shadow-md shadow-[#120D42]/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === "cv" ? "text-[#00D2FF]" : ""}`} />
          <span>ATS CV Builder</span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] font-semibold hidden md:inline">
            100% Free
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "jobs"
              ? "bg-[#120D42] text-white shadow-md shadow-[#120D42]/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Briefcase className={`w-4 h-4 ${activeTab === "jobs" ? "text-[#00D2FF]" : ""}`} />
          <span>Graduate Trainees & Jobs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("interview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "interview"
              ? "bg-[#120D42] text-white shadow-md shadow-[#120D42]/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <HelpCircle className={`w-4 h-4 ${activeTab === "interview" ? "text-[#00D2FF]" : ""}`} />
          <span>Interview Prep Vault (STAR)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vibe")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "vibe"
              ? "bg-[#120D42] text-white shadow-md shadow-[#120D42]/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Code2 className={`w-4 h-4 ${activeTab === "vibe" ? "text-[#00D2FF]" : ""}`} />
          <span>AI Vibe Coding & Mentorship</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "cv" && (
          <div className="animate-in fade-in duration-200">
            <CVBuilder />
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="animate-in fade-in duration-200">
            <JobBoard />
          </div>
        )}

        {activeTab === "interview" && (
          <div className="animate-in fade-in duration-200">
            <InterviewVault />
          </div>
        )}

        {activeTab === "vibe" && (
          <div className="animate-in fade-in duration-200 space-y-8">
            {/* Vibe Coding Overview Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-semibold text-[#120D42]">
                <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
                Proof-of-Work Over Mere Certificates
              </div>

              <div className="max-w-3xl space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                  Why Nigerian Employers Are Choosing &quot;Vibe Coders&quot; Over Paper Degrees
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  In today&apos;s corporate landscape, recruiters at banks, fintechs, and consulting firms are flooded with thousands of identical second-class upper CVs. What commands immediate hiring attention is <strong>proof of working solutions</strong>: live web applications, automated business workflows, and AI-assisted pipelines built during MLA training.
                </p>
              </div>

              {/* Three Pillar Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#120D42] text-[#00D2FF] flex items-center justify-center font-bold">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Build in 48 Hours</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Learn to build full-stack web applications, intake portals, and accounting tools using modern LLMs (Claude, Cursor, ChatGPT) without memorizing syntax for years.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#120D42] text-[#00D2FF] flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Verified GitHub Portfolio</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every MLA student graduates with at least two live deployed web applications that can be linked directly on their ATS CV and demonstrated live to interviewers.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#120D42] text-[#00D2FF] flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Executive Mentorship</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    1-on-1 access to corporate fellows, bank executives, and tech leads who review your code, conduct mock interviews, and recommend you for internal openings.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#120D42] hover:bg-[#1b145a] text-white font-bold text-xs shadow-md transition-all"
                >
                  <Code2 className="w-4 h-4 text-[#00D2FF]" /> Explore Applied AI & Vibe Coding Track
                </Link>
                <Link
                  href="/mentorship/find"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
                >
                  <Users className="w-4 h-4 text-[#120D42]" /> Find an Industry Mentor
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
