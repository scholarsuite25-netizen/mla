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
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-md border border-parchment/10 bg-panel p-8">
        <h1 className="font-display text-3xl text-parchment">Welcome back</h1>
        {registered && (
          <p className="mt-3 rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold">
            Account created. If you received a confirmation email, confirm it
            before logging in.
          </p>
        )}
        <LoginForm next={next} />
      </div>
    </div>
  );
}