import { createAdminClient } from "@/lib/supabase/admin";
import { MembersManager, ProfileItem } from "@/components/admin/members-manager";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const admin = createAdminClient();

  const [{ data: profiles, error }, authRes] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, role, is_active, created_at, institutions(name)")
      .order("created_at", { ascending: false })
      .limit(500),
    admin.auth.admin.listUsers({ perPage: 1000 }).catch(() => ({ data: { users: [] } })),
  ]);

  if (error) {
    return <p className="text-crest-red">{error.message}</p>;
  }

  const authMap = new Map<
    string,
    { email?: string; last_sign_in_at?: string | null; confirmed_at?: string | null }
  >();

  if (authRes?.data?.users) {
    for (const u of authRes.data.users) {
      authMap.set(u.id, {
        email: u.email,
        last_sign_in_at: u.last_sign_in_at,
        confirmed_at: u.email_confirmed_at,
      });
    }
  }

  const members: ProfileItem[] = (profiles || []).map((p) => {
    const authUser = authMap.get(p.id);
    return {
      id: p.id,
      full_name: p.full_name,
      email: authUser?.email || "No email on record",
      role: p.role,
      is_active: p.is_active,
      created_at: p.created_at,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      email_confirmed: !!authUser?.confirmed_at,
      institutions: p.institutions,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-parchment sm:text-3xl">
          Academy Members &amp; Roles
        </h2>
        <p className="mt-1 text-xs text-parchment/60">
          WordPress/MemberPress-grade membership directory. Promote administrators, assign faculty permissions, manage account statuses, or inspect user IDs.
        </p>
      </div>

      <MembersManager initialMembers={members} />
    </div>
  );
}
