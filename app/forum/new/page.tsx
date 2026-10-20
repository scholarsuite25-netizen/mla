import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MessageSquarePlus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NewThreadForm } from "./new-thread-form";

export const metadata = {
  title: "Start a Discussion | Community Forum",
  description: "Share questions, clinical scenarios, study tips, or professional insights with the community.",
};

export default async function NewThreadPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/forum/new");
  }

  const resolvedParams = await searchParams;
  const admin = createAdminClient();
  const { data: categories } = await admin
    .from("forum_categories")
    .select("id, name, slug, icon, description")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const activeCategories = categories || [];
  const preselectedCategoryId = activeCategories.find(
    (c) => c.slug === resolvedParams.category
  )?.id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Forum Overview
        </Link>

        <div className="bg-gradient-to-r from-teal-900/30 via-slate-900 to-indigo-950/40 border border-teal-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <MessageSquarePlus className="w-6 h-6" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Peer Collaboration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Start a New Discussion
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Pose a clinical query, clarify exam questions, or share tips with registered scholars and health practitioners.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <NewThreadForm
            categories={activeCategories}
            defaultCategoryId={preselectedCategoryId}
          />
        </div>
      </div>
    </div>
  );
}
