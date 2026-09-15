export function InstitutionTicker() {
  const institutions = [
    "University of Lagos (UNILAG)",
    "University of Ibadan (UI)",
    "Ahmadu Bello University (ABU Zaria)",
    "Obafemi Awolowo University (OAU)",
    "Covenant University",
    "FUTA Akure",
    "University of Nigeria Nsukka (UNN)",
    "Babcock University",
    "Federal University of Technology Minna",
    "Lagos State University (LASU)",
  ];

  return (
    <div className="relative border-y border-white/[0.06] bg-black/40 py-4 overflow-hidden backdrop-blur-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0A0806] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0A0806] to-transparent z-10" />

      <div className="flex w-max items-center gap-8 animate-[marquee_35s_linear_infinite]">
        {[...institutions, ...institutions].map((name, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
            <span className="text-xs font-medium uppercase tracking-widest text-parchment/60 hover:text-gold transition-colors">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
