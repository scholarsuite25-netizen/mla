import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reset Password — MLA Academy",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-md border border-parchment/10 bg-panel p-8">
        <h1 className="font-display text-3xl text-parchment">Reset Password</h1>
        <p className="mt-2 text-sm text-parchment/70">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
