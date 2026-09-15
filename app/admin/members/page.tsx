import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

interface ProfileItem {
  id: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  institutions?: { name: string } | { name: string }[] | null;
}

export async function updateMemberRole(formData: FormData) {
  "use server";
  const profileId = formData.get("profileId") as string;
  const newRole = formData.get("role") as string;
  if (!profileId || !newRole) return;

  const admin = createAdminClient();
  await admin.from("profiles").update({ role: newRole }).eq("id", profileId);
  revalidatePath("/admin/members");
}

export async function toggleMemberStatus(formData: FormData) {
  "use server";
  const profileId = formData.get("profileId") as string;
  const currentActive = formData.get("isActive") === "true";
  if (!profileId) return;

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ is_active: !currentActive })
    .eq("id", profileId);
  revalidatePath("/admin/members");
}

export default async function AdminMembersPage() {
  const admin = createAdminClient();
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, full_name, role, is_active, created_at, institutions(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return <p className="text-crest-red">{error.message}</p>;
  }

  const members = (profiles as unknown as ProfileItem[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-parchment">Members &amp; Roles</h2>
          <p className="mt-1 text-xs text-parchment/60">
            View registered academy users, assign administrative privileges, or manage account status.
          </p>
        </div>
        <div className="rounded-md border border-parchment/10 bg-panel px-3 py-1.5 text-xs text-parchment/70">
          Total: <span className="font-bold text-gold">{members.length}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-panel shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-parchment/80">
            <thead className="border-b border-white/10 bg-white/5 uppercase tracking-wider text-[11px] text-parchment/60">
              <tr>
                <th className="px-4 py-3.5">Name / Identity</th>
                <th className="px-4 py-3.5">Affiliation</th>
                <th className="px-4 py-3.5">Current Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Joined</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((m) => {
                const instName = Array.isArray(m.institutions)
                  ? m.institutions[0]?.name
                  : m.institutions?.name;

                return (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 font-medium text-parchment">
                      {m.full_name || "Anonymous Member"}
                      <span className="block font-mono text-[10px] text-parchment/40">
                        {m.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-parchment/65">
                      {instName || "Independent"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                          m.role === "super_admin"
                            ? "border-gold/40 bg-gold/10 text-gold"
                            : m.role === "institution_admin"
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                            : m.role === "faculty" || m.role === "mentor"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : "border-white/10 bg-white/5 text-parchment/70"
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] ${
                          m.is_active ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            m.is_active ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />
                        {m.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-parchment/50">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Role Selector Form */}
                        <form action={updateMemberRole} className="inline-flex items-center">
                          <input type="hidden" name="profileId" value={m.id} />
                          <select
                            name="role"
                            defaultValue={m.role}
                            onChange={(e) => e.target.form?.requestSubmit()}
                            className="rounded-md border border-white/10 bg-[#0E0A08] px-2 py-1 text-[11px] text-parchment focus:border-gold focus:outline-none"
                          >
                            <option value="member">member</option>
                            <option value="faculty">faculty</option>
                            <option value="institution_admin">institution_admin</option>
                            <option value="super_admin">super_admin</option>
                          </select>
                        </form>

                        {/* Suspend / Activate Form */}
                        <form action={toggleMemberStatus} className="inline-flex items-center">
                          <input type="hidden" name="profileId" value={m.id} />
                          <input type="hidden" name="isActive" value={String(m.is_active)} />
                          <button
                            type="submit"
                            className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors border ${
                              m.is_active
                                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                          >
                            {m.is_active ? "Suspend" : "Activate"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-parchment/50">
                    No members registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
