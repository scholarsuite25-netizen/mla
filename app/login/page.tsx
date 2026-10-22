import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; next?: string }>;
}) {
  const { registered, next } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    redirect(dest);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFD] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-[#120D42] to-[#1E176E] text-white shadow-md">
            <span className="font-bold text-lg text-[#00D2FF]">M</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">Sign in to access your courses, mentorship, and library</p>
        </div>

        {registered && (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800">
            Account created successfully. If you received a confirmation email, please confirm it before logging in.
          </p>
        )}
        <LoginForm next={next} />
      </div>
    </div>
  );
}