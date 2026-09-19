import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Set New Password — MLA Academy",
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // If there's no session, they shouldn't be here (or the link expired)
    redirect("/login?error=expired");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-md border border-parchment/10 bg-panel p-8">
        <h1 className="font-display text-3xl text-parchment">Set New Password</h1>
        <p className="mt-2 text-sm text-parchment/70">
          Please enter your new password below.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
