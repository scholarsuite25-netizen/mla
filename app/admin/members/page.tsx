import { createAdminClient } from "@/lib/supabase/admin";
import { MembersManager, ProfileItem } from "@/components/admin/members-manager";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const admin = createAdminClient();
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, full_name, role, is_active, created_at, institutions(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return <p className="text-crest-red">{error.message}</p>;
  }

  const members = (profiles as unknown as ProfileItem[]) || [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-parchment">Academy Members &amp; Roles</h2>
        <p className="mt-1 text-xs text-parchment/60">
          WordPress/MemberPress-grade membership directory. Promote administrators, assign faculty permissions, manage account statuses, or inspect user IDs.
        </p>
      </div>

      <MembersManager initialMembers={members} />
    </div>
  );
}
