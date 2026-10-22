import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Set New Password — MLA Academy",
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=expired");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFD] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#0284C7] mb-4">
          <Lock size={20} />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Set New Password</h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 mb-6">
          Enter your strong new password below to secure your account.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
