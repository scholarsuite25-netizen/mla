"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMemberRole, toggleMemberStatus } from "@/app/admin/members/actions";
import {
  Users,
  Shield,
  GraduationCap,
  Ban,
  CheckCircle2,
  Search,
  Copy,
  Check,
  Building,
} from "lucide-react";

export interface ProfileItem {
  id: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  institutions?: { name: string } | { name: string }[] | null;
}

export function MembersManager({ initialMembers }: { initialMembers: ProfileItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Stats calculation
  const totalMembers = initialMembers.length;
  const activeMembers = initialMembers.filter((m) => m.is_active).length;
  const adminCount = initialMembers.filter(
    (m) => m.role === "super_admin" || m.role === "institution_admin"
  ).length;
  const facultyCount = initialMembers.filter(
    (m) => m.role === "faculty" || m.role === "mentor"
  ).length;
  const suspendedCount = initialMembers.filter((m) => !m.is_active).length;

  const filteredMembers = initialMembers.filter((m) => {
    const instName = Array.isArray(m.institutions)
      ? m.institutions[0]?.name
      : m.institutions?.name;

    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      (m.full_name?.toLowerCase().includes(term) ?? false) ||
      m.id.toLowerCase().includes(term) ||
      (instName?.toLowerCase().includes(term) ?? false);

    if (!matchesSearch) return false;

    if (roleFilter === "all") return true;
    if (roleFilter === "suspended") return !m.is_active;
    if (roleFilter === "admin") {
      return m.role === "super_admin" || m.role === "institution_admin";
    }
    if (roleFilter === "faculty") {
      return m.role === "faculty" || m.role === "mentor";
    }
    return m.role === roleFilter;
  });

  const handleRoleChange = (profileId: string, newRole: string) => {
    setUpdatingId(profileId);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("profileId", profileId);
      fd.append("role", newRole);
      await updateMemberRole(fd);
      setUpdatingId(null);
      router.refresh();
    });
  };

  const handleToggleStatus = (profileId: string, currentActive: boolean) => {
    setUpdatingId(profileId);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("profileId", profileId);
      fd.append("isActive", String(currentActive));
      await toggleMemberStatus(fd);
      setUpdatingId(null);
      router.refresh();
    });
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded-xl border border-white/10 bg-panel/80 p-4 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-semibold text-parchment/60">
            <Users className="h-4 w-4 text-gold" />
            Total Members
          </div>
          <div className="mt-2 text-2xl font-bold text-parchment">{totalMembers}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-panel/80 p-4 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-semibold text-parchment/60">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Active
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">{activeMembers}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-panel/80 p-4 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-semibold text-parchment/60">
            <Shield className="h-4 w-4 text-blue-400" />
            Admins
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-400">{adminCount}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-panel/80 p-4 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-semibold text-parchment/60">
            <GraduationCap className="h-4 w-4 text-purple-400" />
            Faculty / Mentors
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-400">{facultyCount}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-panel/80 p-4 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-semibold text-parchment/60">
            <Ban className="h-4 w-4 text-red-400" />
            Suspended
          </div>
          <div className="mt-2 text-2xl font-bold text-red-400">{suspendedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment/40" />
          <input
            type="text"
            placeholder="Search member name, ID, or institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0E0A08] py-2.5 pl-10 pr-4 text-xs text-parchment placeholder-parchment/40 focus:border-gold focus:outline-none"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-panel p-1 text-xs">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              roleFilter === "all"
                ? "bg-gold text-midnight font-semibold shadow"
                : "text-parchment/60 hover:text-parchment"
            }`}
          >
            All ({totalMembers})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              roleFilter === "admin"
                ? "bg-gold text-midnight font-semibold shadow"
                : "text-parchment/60 hover:text-parchment"
            }`}
          >
            Admins ({adminCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("faculty")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              roleFilter === "faculty"
                ? "bg-gold text-midnight font-semibold shadow"
                : "text-parchment/60 hover:text-parchment"
            }`}
          >
            Faculty ({facultyCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("member")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              roleFilter === "member"
                ? "bg-gold text-midnight font-semibold shadow"
                : "text-parchment/60 hover:text-parchment"
            }`}
          >
            Regular
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("suspended")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              roleFilter === "suspended"
                ? "bg-red-500/20 text-red-300 font-semibold border border-red-500/40"
                : "text-parchment/60 hover:text-parchment"
            }`}
          >
            Suspended ({suspendedCount})
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-panel shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-parchment/80">
            <thead className="border-b border-white/10 bg-white/5 uppercase tracking-wider text-[11px] text-parchment/60">
              <tr>
                <th className="px-4 py-3.5">Member</th>
                <th className="px-4 py-3.5">Affiliation</th>
                <th className="px-4 py-3.5">Role Permission</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Registered</th>
                <th className="px-4 py-3.5 text-right">Quick Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.map((m) => {
                const instName = Array.isArray(m.institutions)
                  ? m.institutions[0]?.name
                  : m.institutions?.name;
                const isWorking = updatingId === m.id;

                const initials = m.full_name
                  ? m.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "U";

                return (
                  <tr
                    key={m.id}
                    className={`transition-colors hover:bg-white/[0.02] ${
                      !m.is_active ? "bg-red-950/10 opacity-75" : ""
                    }`}
                  >
                    {/* Member Name + ID */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-mono text-[11px] font-bold text-gold">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-parchment">
                            {m.full_name || "Unnamed Member"}
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-parchment/40">
                            <span>{m.id.slice(0, 8)}...</span>
                            <button
                              type="button"
                              onClick={() => copyId(m.id)}
                              title="Copy Full UUID"
                              className="text-parchment/30 hover:text-gold"
                            >
                              {copiedId === m.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Affiliation */}
                    <td className="px-4 py-3.5 text-parchment/70">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-parchment/40" />
                        <span>{instName || "Direct / Independent"}</span>
                      </div>
                    </td>

                    {/* Current Role Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                          m.role === "super_admin"
                            ? "border-gold/50 bg-gold/15 text-gold"
                            : m.role === "institution_admin"
                            ? "border-blue-500/50 bg-blue-500/15 text-blue-400"
                            : m.role === "faculty" || m.role === "mentor"
                            ? "border-purple-500/50 bg-purple-500/15 text-purple-300"
                            : "border-white/10 bg-white/5 text-parchment/60"
                        }`}
                      >
                        {m.role === "super_admin" && "Super Admin"}
                        {m.role === "institution_admin" && "Institution Admin"}
                        {m.role === "faculty" && "Faculty"}
                        {m.role === "mentor" && "Mentor"}
                        {m.role === "member" && "Academy Member"}
                        {!["super_admin", "institution_admin", "faculty", "mentor", "member"].includes(
                          m.role
                        ) && m.role}
                      </span>
                    </td>

                    {/* Status Indicator */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
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

                    {/* Joined Date */}
                    <td className="px-4 py-3.5 text-parchment/50">
                      {new Date(m.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Quick Management */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Instant Role Select */}
                        <select
                          value={m.role}
                          disabled={isPending || isWorking}
                          onChange={(e) => handleRoleChange(m.id, e.target.value)}
                          className="rounded-lg border border-white/10 bg-[#0E0A08] px-2.5 py-1 text-[11px] text-parchment transition focus:border-gold focus:outline-none disabled:opacity-50"
                        >
                          <option value="member">Role: Member</option>
                          <option value="faculty">Role: Faculty / Mentor</option>
                          <option value="institution_admin">Role: Institution Admin</option>
                          <option value="super_admin">Role: Super Admin</option>
                        </select>

                        {/* Suspend / Reactivate Button */}
                        <button
                          type="button"
                          disabled={isPending || isWorking}
                          onClick={() => handleToggleStatus(m.id, m.is_active)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition disabled:opacity-50 ${
                            m.is_active
                              ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                              : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {m.is_active ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-parchment/50">
                    <Users className="mx-auto h-8 w-8 text-parchment/30 mb-2" />
                    No members match the selected criteria.
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
