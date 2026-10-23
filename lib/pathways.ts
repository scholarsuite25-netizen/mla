export type Pathway =
  | "working_professional"
  | "fresh_graduate"
  | "self_employed"
  | "job_seeker"
  | "retiree_executive"
  | "campus_student"
  | "independent_scholar";

export interface PathwayOption {
  id: Pathway;
  label: string;
  defaultAffiliation: string;
  placeholder: string;
  helperText: string;
}

export const ACADEMY_PATHWAYS: PathwayOption[] = [
  {
    id: "working_professional",
    label: "Working Professional",
    defaultAffiliation: "Corporate Professional",
    placeholder: "e.g. Banking, Tech, Telecom, or your Company Name",
    helperText: "For managers, executives, engineers, and corporate staff upskilling in AI.",
  },
  {
    id: "fresh_graduate",
    label: "Fresh Graduate / NYSC",
    defaultAffiliation: "Fresh Graduate / NYSC",
    placeholder: "e.g. NYSC Corps Member, Alum of UNILAG, UI, etc.",
    helperText: "Bridge the gap to high-demand corporate & tech careers with proof-of-work.",
  },
  {
    id: "self_employed",
    label: "Self-Employed / Founder",
    defaultAffiliation: "Self-Employed / Entrepreneur",
    placeholder: "e.g. Digital Agency, E-commerce, Freelance Consultant",
    helperText: "Automate your workflows, launch AI products, and scale your business.",
  },
  {
    id: "job_seeker",
    label: "Job Seeker / Switcher",
    defaultAffiliation: "Career Switcher / Job Seeker",
    placeholder: "e.g. Career Transition to AI, Tech, Product, or Remote Work",
    helperText: "Acquire high-income digital capabilities and 1-on-1 career coaching.",
  },
  {
    id: "retiree_executive",
    label: "Retirement & Second-Act",
    defaultAffiliation: "Retiree / Executive Advisory",
    placeholder: "e.g. Retired Director, Board Advisor, Senior Consultant, Second-Act Founder",
    helperText: "Post-retirement occupation, board advisory, wealth preservation, and mentorship.",
  },
  {
    id: "campus_student",
    label: "Campus Scholar (Tertiary)",
    defaultAffiliation: "University Student",
    placeholder: "e.g. UNILAG, UI, ABU, FUTO, or type your school",
    helperText: "Connect with fellows across Nigerian universities and gain practical skills.",
  },
  {
    id: "independent_scholar",
    label: "Independent Scholar",
    defaultAffiliation: "Independent Scholar",
    placeholder: "e.g. Self-Taught Innovator, Lifelong Learner",
    helperText: "Open membership with full access to all courses and mentor directories.",
  },
];

export function getPathwayById(id?: string | null): PathwayOption | undefined {
  return ACADEMY_PATHWAYS.find((p) => p.id === id);
}
