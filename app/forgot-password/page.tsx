import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { KeyRound } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reset Password — MLA Academy",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFD] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#0284C7] mb-4">
          <KeyRound size={20} />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Reset Password</h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 mb-6">
          Enter your registered email address and we&apos;ll send you an instant link to recover your account.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
