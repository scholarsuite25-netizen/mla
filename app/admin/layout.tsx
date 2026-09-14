import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Every /admin page is locked to the Super Admin (server-side check).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center gap-3 border-b border-parchment/10 pb-4">
        <span className="inline-block h-2.5 w-2.5 rotate-45 bg-gold" aria-hidden />
        <h1 className="font-display text-2xl text-parchment">Admin</h1>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}