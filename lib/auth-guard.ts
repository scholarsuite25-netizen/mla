import { createClient } from "@/lib/supabase/server";

export type AuthActor = {
  id: string;
  email?: string;
  name: string;
  role: string;
};

/**
 * Ensures the active user is signed in and has the `super_admin` role.
 * Throws an Error if unauthorized, or returns the verified actor.
 */
export async function assertSuperAdmin(): Promise<AuthActor> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: please sign in.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    throw new Error("Forbidden: Super Admin access required.");
  }

  return {
    id: user.id,
    email: user.email,
    name: profile.full_name || "Super Admin",
    role: profile.role,
  };
}
