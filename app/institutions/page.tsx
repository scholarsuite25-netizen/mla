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
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="border-b border-parchment/10 pb-8">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">
          <span className="inline-block h-2 w-2 rotate-45 bg-gold" aria-hidden />
          National Academic Network
        </p>
        <h1 className="mt-3 font-display text-4xl text-parchment">
          Participating Institutions
        </h1>
        <p className="mt-3 text-lg text-parchment/75">
          Higher institutions represented by students, mentors, and administrators
          across the federation.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-gold">
          {list.length} {list.length === 1 ? "Institution" : "Institutions"} Registered
        </p>
        <Link
          href="/register"
          className="rounded-sm bg-crest-red px-4 py-2 text-xs font-medium text-white hover:bg-crest-red/90"
        >
          Add Your Institution
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 rounded-md border border-parchment/10 bg-panel p-8 text-center">
          <p className="text-parchment/60">
            No institutions have been registered yet. Be the first to represent your school!
          </p>
          <Link
            href="/register"
            className="mt-4 inline-block text-sm text-gold hover:underline"
          >
            Register your institution →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {list.map((inst) => (
            <div
              key={inst.id}
              className="rounded-md border border-parchment/10 bg-panel p-5 transition-colors hover:border-gold/40"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg text-parchment">
                  {inst.name}
                </h2>
                <span className="shrink-0 rounded-sm bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold font-mono">
                  Active
                </span>
              </div>
              <p className="mt-2 text-xs text-parchment/50">
                Joined {new Date(inst.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short" })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="mt-12 rounded-md border border-parchment/10 bg-panel/60 p-6">
        <h3 className="font-display text-xl text-parchment">
          Don&apos;t see your university or polytechnic?
        </h3>
        <p className="mt-2 text-sm text-parchment/70 leading-relaxed">
          MLA dynamically creates institution records when you sign up. Simply type your
          institution&apos;s name in the registration form, and it will be immediately available
          for all peers from your school.
        </p>
        <div className="mt-4">
          <Link
            href="/register"
            className="text-xs uppercase tracking-widest text-gold hover:underline"
          >
            Register and add your school →
          </Link>
        </div>
      </div>
    </div>
  );
}