export function InstitutionTicker() {
  const ecosystemPillars = [
    "Corporate & Working Professionals",
    "University of Lagos (UNILAG)",
    "Tech Startups & Innovators",
    "Fresh Graduates & NYSC Fellows",
    "University of Ibadan (UI)",
    "Self-Employed & Entrepreneurs",
    "Ahmadu Bello University (ABU)",
    "Banking & Fintech Networks",
    "Covenant University",
    "Independent Scholars & Creators",
    "Obafemi Awolowo University (OAU)",
    "Creative Agencies & Digital Studios",
  ];

  return (
    <div className="relative border-y border-slate-200/80 bg-white/70 py-4 overflow-hidden backdrop-blur-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAFAFD] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FAFAFD] to-transparent z-10" />

      <div className="flex w-max items-center gap-8 animate-[marquee_40s_linear_infinite]">
        {[...ecosystemPillars, ...ecosystemPillars].map((name, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(0,210,255,0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-blue-700 transition-colors">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
