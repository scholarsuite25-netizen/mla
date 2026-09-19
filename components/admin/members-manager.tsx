"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateMemberRole,
  toggleMemberStatus,
  sendPasswordResetAction,
  getMemberActivityAction,
  type MemberActivitySummary,
} from "@/app/admin/members/actions";
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
  Mail,
  Clock,
  BookOpen,
  Key,
  X,
  Download,
  UserCheck,
} from "lucide-react";

export interface ProfileItem {
  id: string;
  full_name: string | null;
  email?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_sign_in_at?: string | null;
  email_confirmed?: boolean;
  institutions?: { name: string } | { name: string }[] | null;
}

export function MembersManager({ initialMembers }: { initialMembers: ProfileItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Inspector Drawer State
  const [inspectingMember, setInspectingMember] = useState<ProfileItem | null>(null);
  const [activity, setActivity] = useState<MemberActivitySummary | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  // KPI Calculations
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
      (m.email?.toLowerCase().includes(term) ?? false) ||
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
    if (roleFilter === "scholar") {
      return m.role === "scholar" && m.is_active;
    }
    return m.role === roleFilter;
  });

  const handleRoleChange = (profileId: string, newRole: string) => {
    setUpdatingId(profileId);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("profileId", profileId);
      fd.append("role", newRole);
      const res = await updateMemberRole(fd);
      setUpdatingId(null);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleToggleStatus = (profileId: string, currentActive: boolean) => {
    setUpdatingId(profileId);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("profileId", profileId);
      fd.append("isActive", String(currentActive));
      const res = await toggleMemberStatus(fd);
      setUpdatingId(null);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Member Inspection Drawer
  async function openInspector(member: ProfileItem) {
    setInspectingMember(member);
    setActivity(null);
    setResetMsg(null);
    setLoadingActivity(true);
    const res = await getMemberActivityAction(member.id);
    if (res.activity) {
      setActivity(res.activity);
    }
    setLoadingActivity(false);
  }

  // Generate Password Reset Link
  async function handleResetPassword(member: ProfileItem) {
    if (!member.email) return;
    const res = await sendPasswordResetAction(member.id, member.email);
    if (res.error) {
      alert(res.error);
      if (res.resetLink) {
        navigator.clipboard.writeText(res.resetLink);
      }
    } else if (res.resetLink) {
      navigator.clipboard.writeText(res.resetLink);
      setResetMsg("Password reset email sent to the member. A backup link was also copied to your clipboard.");
    } else {
      setResetMsg("Password reset email sent to the member.");
    }
  }

  // Export Filtered Members to CSV
  function exportCSV() {
    const headers = ["ID", "Full Name", "Email", "Role", "Status", "Institution", "Joined Date"];
    const rows = filteredMembers.map((m) => {
      const instName = Array.isArray(m.institutions)
        ? m.institutions[0]?.name
        : m.institutions?.name ?? "Independent Scholar";
      return [
        m.id,
        `"${m.full_name || "Member"}"`,
        m.email || "N/A",
        m.role,
        m.is_active ? "Active" : "Suspended",
        `"${instName}"`,
        m.created_at,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mla_members_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-parchment/60">
            <Users className="h-4 w-4 text-gold" />
            <span>Total Directory</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-parchment">{totalMembers}</p>
          <span className="text-[10px] text-parchment/40">Verified Accounts</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Active Scholars</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{activeMembers}</p>
          <span className="text-[10px] text-parchment/40">In Good Standing</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
            <Shield className="h-4 w-4" />
            <span>Administrators</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-blue-400">{adminCount}</p>
          <span className="text-[10px] text-parchment/40">Super &amp; Campus</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
            <GraduationCap className="h-4 w-4" />
            <span>Faculty &amp; Mentors</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-purple-400">{facultyCount}</p>
          <span className="text-[10px] text-parchment/40">Teaching Cohort</span>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-crest-red">
            <Ban className="h-4 w-4" />
            <span>Suspended</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-crest-red">{suspendedCount}</p>
          <span className="text-[10px] text-parchment/40">Frozen Access</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#120D09] p-3">
        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === "all"
                ? "bg-gold text-midnight font-bold shadow"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            All ({totalMembers})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("scholar")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === "scholar"
                ? "bg-gold text-midnight font-bold shadow"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Scholars
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("faculty")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === "faculty"
                ? "bg-gold text-midnight font-bold shadow"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Faculty ({facultyCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === "admin"
                ? "bg-gold text-midnight font-bold shadow"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Admins ({adminCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("suspended")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === "suspended"
                ? "bg-gold text-midnight font-bold shadow"
                : "text-parchment/60 hover:text-parchment hover:bg-white/5"
            }`}
          >
            Suspended ({suspendedCount})
          </button>
        </div>

        {/* Search & Export Action */}
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-parchment/40" />
            <input
              type="text"
              placeholder="Search name, email, UUID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] py-2 pl-9 pr-3 text-xs text-parchment placeholder-parchment/40 focus:border-gold focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-parchment/80 hover:border-gold hover:text-gold transition shrink-0"
            title="Export filtered directory to CSV"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Member Directory Records */}
      <div className="space-y-3">
        {filteredMembers.map((member) => {
          const instName = Array.isArray(member.institutions)
            ? member.institutions[0]?.name
            : member.institutions?.name;

          const dateStr = new Date(member.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          const initials = (member.full_name || "Member")
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          const isSuperAdmin = member.role === "super_admin";

          return (
            <div
              key={member.id}
              className={`rounded-2xl border p-5 shadow-lg transition-all hover:border-gold/30 ${
                !member.is_active
                  ? "border-crest-red/30 bg-[#160E0D]/90"
                  : isSuperAdmin
                  ? "border-gold/30 bg-[#15100B]/90"
                  : "border-white/10 bg-[#140E0A]/90"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Avatar, Name, Email, Institution & Metadata */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border font-display text-sm font-bold shadow-inner ${
                      isSuperAdmin
                        ? "border-gold/50 bg-gold/20 text-gold"
                        : member.role === "institution_admin"
                        ? "border-blue-500/40 bg-blue-500/20 text-blue-400"
                        : member.role === "faculty" || member.role === "mentor"
                        ? "border-purple-500/40 bg-purple-500/20 text-purple-400"
                        : "border-white/10 bg-white/5 text-parchment"
                    }`}
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-display text-base font-bold text-parchment">
                        {member.full_name || "Anonymous Member"}
                      </h3>

                      {/* Status indicator */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          member.is_active
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                            : "border-crest-red/40 bg-crest-red/15 text-crest-red"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            member.is_active ? "bg-emerald-400" : "bg-crest-red"
                          }`}
                        />
                        {member.is_active ? "Active" : "Suspended"}
                      </span>
                    </div>

                    {/* Email & Institution */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-parchment/70">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center gap-1 hover:text-gold transition truncate"
                        >
                          <Mail size={12} className="text-gold shrink-0" />
                          <span>{member.email}</span>
                        </a>
                      )}

                      {instName && (
                        <span className="inline-flex items-center gap-1 text-parchment/60 truncate">
                          <Building size={12} className="text-gold shrink-0" />
                          <span>{instName}</span>
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-parchment/40">
                        <Clock size={11} className="text-gold/60" />
                        <span>Joined {dateStr}</span>
                      </span>
                    </div>

                    {/* User ID / UUID with Copy */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-parchment/40 uppercase tracking-widest font-mono">
                        UID:
                      </span>
                      <span className="font-mono text-[11px] text-parchment/60 select-all">
                        {member.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyId(member.id)}
                        className="text-parchment/40 hover:text-gold transition p-0.5"
                        title="Copy Member UUID"
                      >
                        {copiedId === member.id ? (
                          <Check size={11} className="text-emerald-400" />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                      {copiedId === member.id && (
                        <span className="text-[10px] font-bold text-emerald-400 animate-in fade-in">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Role Elevation Dropdown & Status Controls */}
                <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  {/* Role Selector */}
                  <div className="relative">
                    <select
                      value={member.role}
                      disabled={isPending && updatingId === member.id}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none transition-all ${
                        member.role === "super_admin"
                          ? "border-gold/50 bg-gold/15 text-gold"
                          : member.role === "institution_admin"
                          ? "border-blue-500/40 bg-blue-500/15 text-blue-400"
                          : member.role === "faculty" || member.role === "mentor"
                          ? "border-purple-500/40 bg-purple-500/15 text-purple-400"
                          : "border-white/10 bg-[#0E0A08] text-parchment"
                      }`}
                    >
                      <option value="scholar">Scholar / Fellow</option>
                      <option value="faculty">Faculty / Instructor</option>
                      <option value="mentor">Executive Mentor</option>
                      <option value="institution_admin">Institution Admin</option>
                      <option value="super_admin">Super Administrator</option>
                    </select>
                  </div>

                  {/* Profile & Activity Inspector */}
                  <button
                    type="button"
                    onClick={() => openInspector(member)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-parchment/80 hover:border-gold hover:text-gold transition"
                    title="Inspect courses, purchases, and permissions"
                  >
                    <UserCheck size={13} className="text-gold" />
                    <span>Inspect</span>
                  </button>

                  {/* Freeze / Suspend Toggle */}
                  <button
                    type="button"
                    disabled={isPending && updatingId === member.id}
                    onClick={() => handleToggleStatus(member.id, member.is_active)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
                      member.is_active
                        ? "border-crest-red/30 bg-crest-red/10 text-crest-red hover:bg-crest-red hover:text-white"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-midnight font-bold"
                    }`}
                  >
                    {member.is_active ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                    <span>{member.is_active ? "Suspend" : "Reinstate"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMembers.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-[#120D09] p-12 text-center space-y-3">
            <Users size={32} className="mx-auto text-gold/40" />
            <h4 className="font-display text-lg font-bold text-parchment">
              No matching members found
            </h4>
            <p className="text-xs text-parchment/50 max-w-sm mx-auto">
              {search
                ? `No directory accounts matched "${search}". Try searching by email or user ID.`
                : "No members found under this role filter."}
            </p>
          </div>
        )}
      </div>

      {/* MemberPress Profile & Activity Inspector Drawer */}
      {inspectingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-[#140E0A] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/15 border border-gold/40 text-gold font-display font-bold">
                  {(inspectingMember.full_name || "M")[0]}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-parchment">
                    {inspectingMember.full_name || "Member Profile"}
                  </h3>
                  <span className="text-xs text-parchment/50 font-mono">
                    {inspectingMember.email || "No email on record"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingMember(null)}
                className="text-parchment/50 hover:text-parchment"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#0E0A08] p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-parchment/40 font-semibold block">
                  Enrolled Courses
                </span>
                <p className="mt-1 text-lg font-bold text-gold">
                  {loadingActivity ? "..." : activity?.coursesCount ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0E0A08] p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-parchment/40 font-semibold block">
                  Paid Purchases
                </span>
                <p className="mt-1 text-lg font-bold text-emerald-400">
                  {loadingActivity ? "..." : activity?.ordersCount ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0E0A08] p-3 text-center">
                <span className="text-[10px] uppercase tracking-wider text-parchment/40 font-semibold block">
                  Active DRM Keys
                </span>
                <p className="mt-1 text-lg font-bold text-parchment">
                  {loadingActivity ? "..." : activity?.licensesCount ?? 0}
                </p>
              </div>
            </div>

            {/* Member Details List */}
            <div className="rounded-2xl border border-white/10 bg-[#0E0A08] p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-parchment/50">User UUID:</span>
                <span className="font-mono text-parchment select-all">{inspectingMember.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-parchment/50">Current Role:</span>
                <span className="font-bold text-gold capitalize">{inspectingMember.role.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-parchment/50">Account Status:</span>
                <span className={inspectingMember.is_active ? "text-emerald-400 font-semibold" : "text-crest-red font-semibold"}>
                  {inspectingMember.is_active ? "Active" : "Suspended"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-parchment/50">Email Confirmation:</span>
                <span className={inspectingMember.email_confirmed ? "text-emerald-400" : "text-amber-300"}>
                  {inspectingMember.email_confirmed ? "Verified Address" : "Pending Confirmation"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-parchment/50">Registered:</span>
                <span className="text-parchment">
                  {new Date(inspectingMember.created_at).toLocaleString("en-GB")}
                </span>
              </div>
            </div>

            {/* Enrolled Courses & Orders Sections */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
                <BookOpen size={14} /> Course Curriculum Enrollments ({activity?.courses.length ?? 0})
              </span>

              {activity && activity.courses.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {activity.courses.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-2.5 text-xs text-parchment"
                    >
                      <span className="truncate">{c.title}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold shrink-0">Enrolled</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-parchment/40 italic">No course enrollments on record.</p>
              )}
            </div>

            {/* Admin Password Recovery Tool */}
            <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4 space-y-3">
              <span className="text-xs uppercase tracking-wider text-parchment/70 font-bold flex items-center gap-1.5">
                <Key size={13} className="text-gold" /> Account Credentials &amp; Recovery
              </span>

              {resetMsg && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                  {resetMsg}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleResetPassword(inspectingMember)}
                className="w-full rounded-xl border border-gold/40 bg-gold/10 py-2.5 text-xs font-semibold text-gold hover:bg-gold/20 transition"
              >
                Generate &amp; Copy Password Recovery Link
              </button>
            </div>

            {/* Drawer Actions */}
            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setInspectingMember(null)}
                className="rounded-xl border border-white/10 px-5 py-2 text-xs font-semibold text-parchment hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
