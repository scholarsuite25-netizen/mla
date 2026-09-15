import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-[#0A0806] flex flex-col lg:flex-row">
      <AdminNav />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-8 lg:p-10 max-w-7xl">
        {children}
      </main>
    </div>
  );
}