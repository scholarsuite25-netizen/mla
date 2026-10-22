import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Participating Institutions — MLA",
  description:
    "Explore higher institutions actively participating in the Mentorship and Leadership Academy across Nigeria.",
};

export default async function InstitutionsPage() {
  const supabase = await createClient();

  const { data: institutions } = await supabase
    .from("institutions")
    .select("id, name, created_at, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const list = institutions ?? [];

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800">
      {/* Royal Navy Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] text-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#00D2FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-[#7C3AED]/25 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-[#00D2FF] uppercase tracking-wider mb-3">
            National Academic Network
          </p>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Participating Institutions
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Higher institutions represented by students, mentors, and administrators across the Nigerian federation.
          </p>
        </div>
      </section>

      {/* Main Body */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <p className="text-xs uppercase tracking-wider text-[#0284C7] font-bold">
            {list.length} {list.length === 1 ? "Institution" : "Institutions"} Registered
          </p>
          <Link
            href="/register"
            className="rounded-lg bg-[#00D2FF] px-4 py-2 text-xs font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all"
          >
            Add Your Institution
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500 text-sm">
              No institutions have been registered yet. Be the first to represent your school!
            </p>
            <Link
              href="/register"
              className="mt-4 inline-block text-xs sm:text-sm font-bold text-[#0284C7] hover:underline"
            >
              Register your institution →
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {list.map((inst) => (
              <div
                key={inst.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-cyan-400/60 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-base font-bold text-slate-900">
                    {inst.name}
                  </h2>
                  <span className="shrink-0 rounded-full bg-cyan-50 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[#0284C7] font-semibold border border-cyan-200">
                    Active
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Joined {new Date(inst.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short" })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-12 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-900">
            Don&apos;t see your university or polytechnic?
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            MLA dynamically creates institution records when you sign up. Simply type your
            institution&apos;s name in the registration form, and it will be immediately available
            for all peers from your school.
          </p>
          <div className="mt-4">
            <Link
              href="/register"
              className="text-xs uppercase tracking-wider font-bold text-[#0284C7] hover:underline"
            >
              Register and add your school →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}