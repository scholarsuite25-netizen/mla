"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  User,
  Printer,
  ChevronRight,
} from "lucide-react";

export type ResumeData = {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    year: string;
    grade?: string;
    honors?: string;
  }>;
  nysc: {
    completed: boolean;
    stateOfService: string;
    year: string;
    ppa: string;
    cdsContribution: string;
  };
  experience: Array<{
    id: string;
    company: string;
    role: string;
    location: string;
    duration: string;
    achievements: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    techStack: string;
    link: string;
    description: string;
  }>;
  skills: string[];
  certifications: string[];
};

const SAMPLE_RESUME: ResumeData = {
  fullName: "Oluwaseun Babatunde Adeyemi",
  professionalTitle: "Graduate Trainee & Junior AI Solutions Specialist",
  email: "oluwaseun.adeyemi@example.com",
  phone: "+234 803 123 4567",
  location: "Lagos, Nigeria",
  linkedin: "linkedin.com/in/oluwaseun-adeyemi",
  portfolio: "adeyemi-solutions.vercel.app",
  summary:
    "Ambitious, high-achieving First-Class graduate and MLA Vibe Coding certified developer with rigorous foundations in digital problem-solving, financial systems, and modern AI automation. Skilled in translating operational business challenges into clean web applications and data pipelines. Proven cross-functional leadership during NYSC and academic research.",
  education: [
    {
      id: "edu-1",
      institution: "University of Lagos (UNILAG)",
      degree: "B.Sc. Systems Engineering & Economics",
      year: "2020 – 2024",
      grade: "First Class Honours (CGPA: 4.82 / 5.0)",
      honors: "Dean's List (2021-2024), Best Graduating Research Thesis",
    },
  ],
  nysc: {
    completed: true,
    stateOfService: "Lagos State",
    year: "2025",
    ppa: "Digital Financial Services Operations, EcoBank Nigeria Plc",
    cdsContribution:
      "President, Financial Literacy & Tech CDS: Facilitated digital banking and basic Python literacy training for 450+ public secondary school students.",
  },
  experience: [
    {
      id: "exp-1",
      company: "EcoBank Nigeria Plc (NYSC PPA)",
      role: "Digital Banking Operations Trainee",
      location: "Victoria Island, Lagos",
      duration: "Feb 2025 – Present",
      achievements: [
        "Analyzed 12,000+ daily POS transaction logs using Excel and automated Python scripts, reducing reconciliation turnaround time by 34%.",
        "Assisted senior compliance associates in auditing anti-money laundering (AML) reports across 18 regional branch clusters.",
        "Authored an internal operations quick-reference guide adopted by 25+ incoming intern cohorts.",
      ],
    },
    {
      id: "exp-2",
      company: "Netizen Media & Tech Solutions",
      role: "Business Systems & AI Intern",
      location: "Lagos (Hybrid)",
      duration: "May 2023 – Oct 2023",
      achievements: [
        "Collaborated with project leads to prototype customer intake portals using Next.js and Supabase.",
        "Implemented automated WhatsApp and SMS lead notification workflows, increasing qualified client bookings by 22%.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "SME Invoice & Inventory Ledger (MLA Vibe Coding Capstone)",
      techStack: "Next.js, TypeScript, TailwindCSS, Supabase Auth",
      link: "https://github.com/oluwaseun/sme-ledger",
      description:
        "Engineered a lightweight multi-currency billing portal for Nigerian merchants, featuring automated PDF invoice generation and Paystack webhook verification.",
    },
    {
      id: "proj-2",
      name: "Campus Study Group Matcher",
      techStack: "React, Firebase, Tailwind",
      link: "https://campus-mate-ng.vercel.app",
      description:
        "Built a peer matching application connecting 1,200+ undergraduate engineering students based on semester exam modules and study timetables.",
    },
  ],
  skills: [
    "AI Agentic Automation & Prompting",
    "Next.js & React",
    "SQL & Supabase",
    "Financial Data Analysis (Excel / PowerBI)",
    "API Integrations (Paystack / Webhooks)",
    "Technical Writing & Documentation",
    "Executive Stakeholder Communication",
  ],
  certifications: [
    "MLA Certified AI Vibe Coder (Distinction)",
    "Google Data Analytics Professional Certificate",
    "Bloomberg Market Concepts (BMC)",
  ],
};

const EMPTY_RESUME: ResumeData = {
  fullName: "",
  professionalTitle: "",
  email: "",
  phone: "",
  location: "Lagos, Nigeria",
  linkedin: "",
  portfolio: "",
  summary: "",
  education: [
    {
      id: "1",
      institution: "",
      degree: "",
      year: "",
      grade: "",
      honors: "",
    },
  ],
  nysc: {
    completed: true,
    stateOfService: "",
    year: "",
    ppa: "",
    cdsContribution: "",
  },
  experience: [
    {
      id: "1",
      company: "",
      role: "",
      location: "",
      duration: "",
      achievements: [""],
    },
  ],
  projects: [],
  skills: [],
  certifications: [],
};

type TemplateType = "corporate" | "tech" | "graduate";

export function CVBuilder() {
  const [data, setData] = useState<ResumeData>(SAMPLE_RESUME);
  const [template, setTemplate] = useState<TemplateType>("corporate");
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [activeStep, setActiveStep] = useState<"basics" | "education" | "experience" | "projects" | "skills">("basics");

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mla_ats_resume_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fullName) setData(parsed);
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const handleSaveDraft = () => {
    try {
      localStorage.setItem("mla_ats_resume_data", JSON.stringify(data));
      setSavedMessage("Draft saved in browser!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch {
      setSavedMessage("Unable to save locally");
    }
  };

  const handleLoadSample = () => {
    setData(SAMPLE_RESUME);
    setSavedMessage("Loaded verified sample profile!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleClear = () => {
    if (confirm("Reset the CV builder and start from a clean slate?")) {
      setData(EMPTY_RESUME);
      localStorage.removeItem("mla_ats_resume_data");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Add/Remove Helpers
  const addEducation = () => {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Math.random().toString(),
          institution: "",
          degree: "",
          year: "",
          grade: "",
        },
      ],
    }));
  };

  const removeEducation = (id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Math.random().toString(),
          company: "",
          role: "",
          location: "",
          duration: "",
          achievements: [""],
        },
      ],
    }));
  };

  const removeExperience = (id: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  const addAchievement = (expId: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === expId ? { ...e, achievements: [...e.achievements, ""] } : e
      ),
    }));
  };

  const updateAchievement = (expId: string, idx: number, val: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => {
        if (e.id === expId) {
          const updated = [...e.achievements];
          updated[idx] = val;
          return { ...e, achievements: updated };
        }
        return e;
      }),
    }));
  };

  const removeAchievement = (expId: string, idx: number) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => {
        if (e.id === expId) {
          return {
            ...e,
            achievements: e.achievements.filter((_, i) => i !== idx),
          };
        }
        return e;
      }),
    }));
  };

  const addProject = () => {
    setData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: Math.random().toString(),
          name: "",
          techStack: "",
          link: "",
          description: "",
        },
      ],
    }));
  };

  const removeProject = (id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (!data.skills.includes(skillInput.trim())) {
      setData((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
    }
    setSkillInput("");
  };

  const removeSkill = (s: string) => {
    setData((prev) => ({ ...prev, skills: prev.skills.filter((x) => x !== s) }));
  };

  const addCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInput.trim()) return;
    if (!data.certifications.includes(certInput.trim())) {
      setData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, certInput.trim()],
      }));
    }
    setCertInput("");
  };

  const removeCert = (c: string) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((x) => x !== c),
    }));
  };

  return (
    <div className="w-full">
      {/* Print-specific style injection to guarantee clean A4 output without URL headers or page clutter */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-ats-cv,
          #printable-ats-cv * {
            visibility: visible !important;
          }
          #printable-ats-cv {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px 32px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: #0f172a !important;
          }
          @page {
            size: A4;
            margin: 12mm 15mm;
          }
        }
      `}</style>

      {/* Control Toolbar */}
      <div className="bg-[#120D42] text-white rounded-2xl p-4 sm:p-6 mb-8 shadow-xl border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] mb-2 border border-[#00D2FF]/30">
              <Sparkles className="w-3.5 h-3.5" />
              100% Free • ATS Compliant • No Watermark
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Interactive ATS CV Builder & Exporter
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Formatted specifically for Nigerian recruitment systems (Access, PwC, MTN, KPMG, NLNG) and global ATS parsers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-[#00D2FF]" />
              Load Sample CV
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-[#00D2FF] hover:bg-[#38BDF8] text-[#120D42] shadow-lg shadow-[#00D2FF]/20 transition-all transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Download ATS PDF (A4)
            </button>
          </div>
        </div>

        {savedMessage && (
          <div className="mt-3 text-xs text-emerald-300 font-medium animate-pulse flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> {savedMessage}
          </div>
        )}

        {/* Layout Template Switcher */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold text-slate-300 tracking-wider">
              ATS Layout:
            </span>
            <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setTemplate("corporate")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  template === "corporate"
                    ? "bg-[#00D2FF] text-[#120D42] shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Corporate / Banking Standard
              </button>
              <button
                type="button"
                onClick={() => setTemplate("tech")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  template === "tech"
                    ? "bg-[#00D2FF] text-[#120D42] shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Tech & Vibe Coder
              </button>
              <button
                type="button"
                onClick={() => setTemplate("graduate")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  template === "graduate"
                    ? "bg-[#00D2FF] text-[#120D42] shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Entry-Level / NYSC Priority
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-300 hover:text-red-200 transition-colors underline"
          >
            Clear Form
          </button>
        </div>
      </div>

      {/* Main Grid: Form Editor (Left) & Real-time ATS Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
          {/* Step Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-5 border-b border-slate-100">
            {[
              { id: "basics", label: "Contact", icon: User },
              { id: "education", label: "Education & NYSC", icon: GraduationCap },
              { id: "experience", label: "Experience", icon: Briefcase },
              { id: "projects", label: "Projects / Code", icon: Code2 },
              { id: "skills", label: "Skills", icon: Award },
            ].map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() =>
                    setActiveStep(
                      step.id as
                        | "basics"
                        | "education"
                        | "experience"
                        | "projects"
                        | "skills"
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#120D42] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {step.label}
                </button>
              );
            })}
          </div>

          {/* Form Step 1: Basics */}
          {activeStep === "basics" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#120D42] uppercase tracking-wider">
                1. Personal Details & Headline
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (Include Middle Name if Desired)
                </label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  placeholder="e.g. Babatunde Adeyemi"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#00D2FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Role / Professional Title
                </label>
                <input
                  type="text"
                  value={data.professionalTitle}
                  onChange={(e) => setData({ ...data, professionalTitle: e.target.value })}
                  placeholder="e.g. Graduate Trainee | Junior Business Systems Analyst"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#00D2FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="name@gmail.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    placeholder="+234 803 000 0000"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location (City, State)
                  </label>
                  <input
                    type="text"
                    value={data.location}
                    onChange={(e) => setData({ ...data, location: e.target.value })}
                    placeholder="Lagos, Nigeria"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LinkedIn / Portfolio URL
                  </label>
                  <input
                    type="text"
                    value={data.linkedin}
                    onChange={(e) => setData({ ...data, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Professional Summary (3–4 Sentences)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setData({
                        ...data,
                        summary:
                          "Driven, results-oriented graduate with strong analytical acumen, academic honors, and practical training in modern digital workflows. Demonstrated ability to execute complex assignments, coordinate cross-functional teams, and adapt rapidly to corporate standards. Seeking to contribute immediate value in a fast-paced graduate trainee environment.",
                      })
                    }
                    className="text-[11px] text-[#00D2FF] hover:underline font-semibold"
                  >
                    Use Recommended Starter
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={data.summary}
                  onChange={(e) => setData({ ...data, summary: e.target.value })}
                  placeholder="Summarize your degree, key achievement, and value proposition..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#00D2FF]"
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveStep("education")}
                className="w-full py-2.5 rounded-xl bg-[#120D42] text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#1b145a] transition-all"
              >
                Next: Education & NYSC <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form Step 2: Education & NYSC */}
          {activeStep === "education" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#120D42] uppercase tracking-wider">
                  2. Academic Qualifications
                </h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="inline-flex items-center gap-1 text-xs text-[#00D2FF] font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Degree
                </button>
              </div>

              {data.education.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 relative"
                >
                  {data.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      University / Institution
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...data.education];
                        updated[idx].institution = e.target.value;
                        setData({ ...data, education: updated });
                      }}
                      placeholder="e.g. University of Lagos (UNILAG)"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Degree & Course
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...data.education];
                          updated[idx].degree = e.target.value;
                          setData({ ...data, education: updated });
                        }}
                        placeholder="e.g. B.Sc. Accounting"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Years (e.g. 2020 – 2024)
                      </label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => {
                          const updated = [...data.education];
                          updated[idx].year = e.target.value;
                          setData({ ...data, education: updated });
                        }}
                        placeholder="2020 – 2024"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Class of Degree / Grade (Crucial for Graduate Trainee filtering)
                    </label>
                    <input
                      type="text"
                      value={edu.grade || ""}
                      onChange={(e) => {
                        const updated = [...data.education];
                        updated[idx].grade = e.target.value;
                        setData({ ...data, education: updated });
                      }}
                      placeholder="e.g. First Class Honours (4.82 / 5.0) or Second Class Upper (2:1)"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Academic Honors / Thesis Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={edu.honors || ""}
                      onChange={(e) => {
                        const updated = [...data.education];
                        updated[idx].honors = e.target.value;
                        setData({ ...data, education: updated });
                      }}
                      placeholder="e.g. Dean's Honour Roll, Faculty Valedictorian"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ))}

              {/* Nigerian National Youth Service Corps (NYSC) Section */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#120D42] uppercase tracking-wider">
                      NYSC Service Status (Nigeria Specific)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Top banks & corporations mandate clear NYSC documentation.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.nysc.completed}
                      onChange={(e) =>
                        setData({
                          ...data,
                          nysc: { ...data.nysc, completed: e.target.checked },
                        })
                      }
                      className="rounded text-[#00D2FF] focus:ring-[#00D2FF]"
                    />
                    <span>Completed / In Service</span>
                  </label>
                </div>

                {data.nysc.completed && (
                  <div className="p-3 rounded-xl bg-cyan-50/50 border border-cyan-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          State of Deployment
                        </label>
                        <input
                          type="text"
                          value={data.nysc.stateOfService}
                          onChange={(e) =>
                            setData({
                              ...data,
                              nysc: { ...data.nysc, stateOfService: e.target.value },
                            })
                          }
                          placeholder="e.g. Lagos State"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Service Year (Batch)
                        </label>
                        <input
                          type="text"
                          value={data.nysc.year}
                          onChange={(e) =>
                            setData({
                              ...data,
                              nysc: { ...data.nysc, year: e.target.value },
                            })
                          }
                          placeholder="e.g. 2024 / 2025 Batch A"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Primary Place of Assignment (PPA)
                      </label>
                      <input
                        type="text"
                        value={data.nysc.ppa}
                        onChange={(e) =>
                          setData({
                            ...data,
                            nysc: { ...data.nysc, ppa: e.target.value },
                          })
                        }
                        placeholder="e.g. Operations Assistant, EcoBank Nigeria Plc"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        CDS Project or Community Leadership
                      </label>
                      <input
                        type="text"
                        value={data.nysc.cdsContribution}
                        onChange={(e) =>
                          setData({
                            ...data,
                            nysc: { ...data.nysc, cdsContribution: e.target.value },
                          })
                        }
                        placeholder="e.g. Spearheaded financial literacy sessions for 350+ community youths"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep("basics")}
                  className="w-1/3 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep("experience")}
                  className="w-2/3 py-2 rounded-xl bg-[#120D42] text-white font-semibold text-xs flex items-center justify-center gap-1 hover:bg-[#1b145a]"
                >
                  Next: Experience <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Form Step 3: Work Experience with STAR bullets */}
          {activeStep === "experience" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#120D42] uppercase tracking-wider">
                    3. Work Experience & Internships
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Use STAR formula: Action Verb + Context + Quantifiable Metric.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="inline-flex items-center gap-1 text-xs text-[#00D2FF] font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Role
                </button>
              </div>

              {data.experience.map((exp, expIdx) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 relative"
                >
                  {data.experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Company / Firm
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...data.experience];
                          updated[expIdx].company = e.target.value;
                          setData({ ...data, experience: updated });
                        }}
                        placeholder="e.g. PwC Nigeria"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...data.experience];
                          updated[expIdx].role = e.target.value;
                          setData({ ...data, experience: updated });
                        }}
                        placeholder="e.g. Graduate Tax Associate"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => {
                          const updated = [...data.experience];
                          updated[expIdx].location = e.target.value;
                          setData({ ...data, experience: updated });
                        }}
                        placeholder="e.g. Lagos, Nigeria"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => {
                          const updated = [...data.experience];
                          updated[expIdx].duration = e.target.value;
                          setData({ ...data, experience: updated });
                        }}
                        placeholder="e.g. Jan 2024 – Present"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Key Quantifiable Achievements (STAR Bullet Points):
                    </label>
                    {exp.achievements.map((ach, achIdx) => (
                      <div key={achIdx} className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-xs">•</span>
                        <input
                          type="text"
                          value={ach}
                          onChange={(e) => updateAchievement(exp.id, achIdx, e.target.value)}
                          placeholder="e.g. Automated reconciliation of 400+ weekly invoices, reducing errors by 25%"
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 bg-white"
                        />
                        {exp.achievements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAchievement(exp.id, achIdx)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addAchievement(exp.id)}
                      className="text-[11px] text-[#00D2FF] font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <Plus className="w-3 h-3" /> Add Achievement Bullet
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep("education")}
                  className="w-1/3 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep("projects")}
                  className="w-2/3 py-2 rounded-xl bg-[#120D42] text-white font-semibold text-xs flex items-center justify-center gap-1 hover:bg-[#1b145a]"
                >
                  Next: Projects & Code <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Form Step 4: Projects & Vibe Coding Proof-of-Work */}
          {activeStep === "projects" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#120D42] uppercase tracking-wider">
                    4. Vibe Coding Projects & Proof-of-Work
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Crucial differentiator: live prototypes prove practical ability over mere certificates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addProject}
                  className="inline-flex items-center gap-1 text-xs text-[#00D2FF] font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              {data.projects.map((proj, pIdx) => (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => {
                          const updated = [...data.projects];
                          updated[pIdx].name = e.target.value;
                          setData({ ...data, projects: updated });
                        }}
                        placeholder="e.g. SME Invoice & Ledger Portal"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Tech Stack / Tools Used
                      </label>
                      <input
                        type="text"
                        value={proj.techStack}
                        onChange={(e) => {
                          const updated = [...data.projects];
                          updated[pIdx].techStack = e.target.value;
                          setData({ ...data, projects: updated });
                        }}
                        placeholder="e.g. Next.js, Cursor AI, Supabase"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      GitHub or Live Demo URL
                    </label>
                    <input
                      type="text"
                      value={proj.link}
                      onChange={(e) => {
                        const updated = [...data.projects];
                        updated[pIdx].link = e.target.value;
                        setData({ ...data, projects: updated });
                      }}
                      placeholder="e.g. https://github.com/name/repo"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Description & Impact
                    </label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...data.projects];
                        updated[pIdx].description = e.target.value;
                        setData({ ...data, projects: updated });
                      }}
                      placeholder="What business problem did it solve? What was the outcome?"
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep("experience")}
                  className="w-1/3 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep("skills")}
                  className="w-2/3 py-2 rounded-xl bg-[#120D42] text-white font-semibold text-xs flex items-center justify-center gap-1 hover:bg-[#1b145a]"
                >
                  Next: Skills & Certifications <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Form Step 5: Skills & Certifications */}
          {activeStep === "skills" && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-[#120D42] uppercase tracking-wider">
                5. Core Competencies & Certifications
              </h3>

              {/* Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Add ATS Keywords / Competencies:
                </label>
                <form onSubmit={addSkill} className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. Financial Modelling, Prompt Engineering"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-[#120D42] text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="pt-3 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certifications & Executive Badges:
                </label>
                <form onSubmit={addCert} className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="e.g. MLA Certified AI Vibe Coder, ICAN ATSWA"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-[#120D42] text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5">
                  {data.certifications.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-cyan-50 text-[#120D42] border border-cyan-200"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => removeCert(c)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full py-3 rounded-xl bg-[#00D2FF] hover:bg-[#38BDF8] text-[#120D42] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Ready! Export A4 ATS PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live ATS Preview (7 cols) */}
        <div className="lg:col-span-7 sticky top-24">
          <div className="bg-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-inner">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-600 font-semibold px-2">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#120D42]" /> Live Real-Time ATS Preview (A4 Standard)
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                Parsable by Taleo, Workday, Greenhouse & Nigerian Recruiters
              </span>
            </div>

            {/* The Actual Resume Sheet (Print Target) */}
            <div
              id="printable-ats-cv"
              className="bg-white text-slate-900 rounded-xl p-8 sm:p-10 shadow-lg border border-slate-300 min-h-[842px] font-sans transition-all"
              style={{
                fontFamily:
                  template === "corporate"
                    ? "'Poppins', 'Segoe UI', Arial, sans-serif"
                    : "'Poppins', sans-serif",
              }}
            >
              {/* Header */}
              <div
                className={`text-center pb-4 mb-5 border-b ${
                  template === "corporate"
                    ? "border-slate-800"
                    : template === "tech"
                    ? "border-[#00D2FF] text-left"
                    : "border-slate-300"
                }`}
              >
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] uppercase">
                  {data.fullName || "Your Full Name"}
                </h1>
                {data.professionalTitle && (
                  <p className="text-xs sm:text-sm font-semibold text-[#120D42] mt-0.5">
                    {data.professionalTitle}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600 mt-2">
                  {data.location && <span>{data.location}</span>}
                  {data.phone && <span>• {data.phone}</span>}
                  {data.email && <span>• {data.email}</span>}
                  {data.linkedin && <span>• {data.linkedin}</span>}
                  {data.portfolio && <span>• {data.portfolio}</span>}
                </div>
              </div>

              {/* Summary */}
              {data.summary && (
                <div className="mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#120D42] border-b border-slate-200 pb-1 mb-2">
                    Professional Summary
                  </h2>
                  <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
                    {data.summary}
                  </p>
                </div>
              )}

              {/* Education (Prioritized for Entry-Level & Graduate Trainees) */}
              {template === "graduate" && data.education.length > 0 && (
                <div className="mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#120D42] border-b border-slate-200 pb-1 mb-2">
                    Education & Academic Qualifications
                  </h2>
                  <div className="space-y-3">
                    {data.education.map((edu) => (
                      <div key={edu.id} className="text-[11px]">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{edu.institution || "University Name"}</span>
                          <span className="text-slate-500 font-normal">{edu.year}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-700">
                          <span>{edu.degree || "Degree Title"}</span>
                          {edu.grade && (
                            <span className="font-semibold text-[#120D42]">{edu.grade}</span>
                          )}
                        </div>
                        {edu.honors && (
                          <p className="text-[10px] text-slate-500 italic mt-0.5">{edu.honors}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NYSC Service Block */}
              {data.nysc.completed && data.nysc.stateOfService && (
                <div className="mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#120D42] border-b border-slate-200 pb-1 mb-2">
                    National Youth Service Corps (NYSC)
                  </h2>
                  <div className="text-[11px] space-y-1">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>Deployment: {data.nysc.stateOfService}</span>
                      <span className="text-slate-500 font-normal">{data.nysc.year}</span>
                    </div>
                    {data.nysc.ppa && (
                      <p className="text-slate-700">
                        <span className="font-medium">Primary Place of Assignment (PPA):</span>{" "}
                        {data.nysc.ppa}
                      </p>
                    )}
                    {data.nysc.cdsContribution && (
                      <p className="text-slate-700">
                        <span className="font-medium">CDS & Community Leadership:</span>{" "}
                        {data.nysc.cdsContribution}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Experience */}
              {data.experience.length > 0 && data.experience[0].company && (
                <div className="mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#120D42] border-b border-slate-200 pb-1 mb-2">
                    Professional Experience & Internships
                  </h2>
                  <div className="space-y-3.5">
                    {data.experience.map((exp) => (
                      <div key={exp.id} className="text-[11px]">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>
                            {exp.role} — <span className="font-medium">{exp.company}</span>
                          </span>
                          <span className="text-slate-500 font-normal">{exp.duration}</span>
                        </div>
                        {exp.location && (
                          <p className="text-[10px] text-slate-500">{exp.location}</p>
                        )}
                        <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-slate-700">
                          {exp.achievements
                            .filter((a) => a.trim().length > 0)
                            .map((ach, idx) => (
                              <li key={idx} className="leading-snug">
                                {ach}
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education (If Corporate or Tech template, placed after experience) */}
              {template !== "graduate" && data.education.length > 0 && (
                <div className="mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#120D42] border-b border-slate-200 pb-1 mb-2">
                    Education
                  </h2>
                  <div className="space-y-3">
                    {data.education.map((edu) => (
                      <div key={edu.id} className="text-[11px]">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{edu.institution || "University Name"}</span>
                          <span className="text-slate-500 font-normal">{edu.year}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-700">
                          <span>{edu.degree || "Degree Title"}</span>
                          {edu.grade && (
                            <span className="font-semibold text-[#120D42]">{edu.grade}</span>
                          )}
                        </div>
                        {edu.honors && (
                          <p className="text-[10px] text-slate-500 italic mt-0.5">{edu.honors}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects & Vibe Coding */}
              {data.projects.length > 0 && (
                <div className="mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#120D42] border-b border-slate-200 pb-1 mb-2">
                    AI Vibe Coding Projects & Solutions
                  </h2>
                  <div className="space-y-2.5">
                    {data.projects.map((proj) => (
                      <div key={proj.id} className="text-[11px]">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900">{proj.name}</span>
                          {proj.link && (
                            <span className="text-[10px] text-cyan-600 font-mono">
                              {proj.link.replace(/^https?:\/\//, "")}
                            </span>
                          )}
                        </div>
                        {proj.techStack && (
                          <p className="text-[10px] text-slate-500 font-medium">
                            Stack: {proj.techStack}
                          </p>
                        )}
                        {proj.description && (
                          <p className="text-slate-700 text-[11px] mt-0.5 leading-snug">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills & Certifications */}
              {(data.skills.length > 0 || data.certifications.length > 0) && (
                <div className="mb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#120D42] border-b border-slate-200 pb-1 mb-2">
                    Core Competencies & Certifications
                  </h2>
                  <div className="text-[11px] space-y-1.5">
                    {data.skills.length > 0 && (
                      <p className="text-slate-700">
                        <span className="font-bold text-slate-900">Key Competencies:</span>{" "}
                        {data.skills.join(" • ")}
                      </p>
                    )}
                    {data.certifications.length > 0 && (
                      <p className="text-slate-700">
                        <span className="font-bold text-slate-900">Certifications:</span>{" "}
                        {data.certifications.join(" • ")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
