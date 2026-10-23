"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Briefcase,
  MapPin,
  Building,
  CheckCircle2,
  ExternalLink,
  Share2,
  Filter,
  Sparkles,
  DollarSign,
  Clock,
  MessageCircle,
} from "lucide-react";
import { JobListing } from "@/app/api/jobs/route";

const CATEGORIES = [
  "All",
  "Graduate Trainee",
  "Tech & AI",
  "Corporate & Finance",
  "Remote Entry-Level",
] as const;

export function JobBoard() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "All") params.set("category", selectedCategory);
        if (searchQuery.trim()) params.set("q", searchQuery.trim());

        const res = await fetch(`/api/jobs?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.jobs) setJobs(data.jobs);
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const handleShare = (job: JobListing) => {
    const text = `Check out this opening on MLA Career Launchpad: *${job.title}* at *${job.company}* (${job.location}). View and apply here: https://mla.org.ng/careers`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="w-full space-y-8">
      {/* Search & Category Filter Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, or state (e.g. Lagos, Trainee)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#00D2FF] focus:ring-1 focus:ring-[#00D2FF]"
            />
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-[#120D42]">{jobs.length}</span> verified career opportunities
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-100">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#120D42] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Job Listings Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#00D2FF] border-t-transparent mb-3" />
          <p className="text-sm text-slate-500 font-medium">Fetching verified graduate openings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching vacancies found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your search keywords or switch category filter to &quot;All&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-[#120D42] text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#00D2FF] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-[#120D42] border border-cyan-200">
                    {job.category}
                  </span>
                  {job.isVerifiedGraduateScheme && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified Trainee Scheme
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#0F172A] leading-snug hover:text-[#120D42]">
                  {job.title}
                </h3>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {job.jobType}
                  </span>
                </div>

                {job.salarySnippet && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/70 px-2.5 py-1 rounded-lg">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salarySnippet}
                  </div>
                )}

                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleShare(job)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Share to WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#120D42] hover:bg-[#1b145a] text-white shadow-sm transition-all"
                >
                  Apply Directly <ExternalLink className="w-3.5 h-3.5 text-[#00D2FF]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recruiter / Employer Callout */}
      <div className="rounded-2xl bg-gradient-to-r from-[#120D42] to-[#241468] p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-white/10">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00D2FF] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> For Employers & Recruiters
          </span>
          <h3 className="text-lg font-bold mt-1">Hiring Graduate Trainees or Tech Talent?</h3>
          <p className="text-xs text-slate-300 max-w-xl mt-0.5">
            Post your verified vacancies to our network of 50+ university hubs, NYSC corps members, and MLA certified vibe coders.
          </p>
        </div>
        <a
          href={`https://wa.me/2348034710699?text=${encodeURIComponent(
            "Hello MLA! We would like to list our corporate graduate trainee vacancy or recruit certified talent from your academy."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00D2FF] hover:bg-[#38BDF8] text-[#120D42] font-bold text-xs shadow-md transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          List a Vacancy via WhatsApp
        </a>
      </div>
    </div>
  );
}
