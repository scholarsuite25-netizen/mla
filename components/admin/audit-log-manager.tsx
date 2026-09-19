"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import {
  Search,
  ShieldAlert,
  Clock,
  Radio,
  Download,
  RefreshCw,
  FileJson,
  PlusCircle,
  Check,
  Copy,
  X,
  User,
  Key,
  Users,
  BookOpen,
  ShoppingBag,
  AlertTriangle,
  Info,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuditLogRecord, AuditCategory, AuditSeverity } from "@/lib/audit";
import { getAuditLogsAction, recordAdminAuditNoteAction } from "@/app/admin/audit/actions";

interface AuditLogManagerProps {
  initialLogs: AuditLogRecord[];
}

export function AuditLogManager({ initialLogs }: AuditLogManagerProps) {
  const [logs, setLogs] = useState<AuditLogRecord[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AuditCategory | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | "all">("all");
  const [timeRange, setTimeRange] = useState<"all" | "24h" | "7d" | "30d">("all");

  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const [latestEventToast, setLatestEventToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Forensic modal & Note modal
  const [inspectingLog, setInspectingLog] = useState<AuditLogRecord | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteSeverity, setNoteSeverity] = useState<AuditSeverity>("notice");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Copied states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Setup Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-audit-log-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "audit_log" },
        (payload) => {
          const newRecord = payload.new as AuditLogRecord;
          const formatted: AuditLogRecord = {
            id: newRecord.id,
            actor_id: newRecord.actor_id,
            actor_email: newRecord.actor_email,
            actor_name: newRecord.actor_email || (newRecord.actor_id ? "Member / User" : "Automated System"),
            action: newRecord.action,
            target_table: newRecord.target_table,
            target_id: newRecord.target_id,
            category: (newRecord.category as AuditCategory) || "general",
            severity: (newRecord.severity as AuditSeverity) || "info",
            details: (newRecord.details as Record<string, unknown>) || {},
            ip_address: newRecord.ip_address || null,
            created_at: newRecord.created_at || new Date().toISOString(),
          };

          setLogs((prev) => [formatted, ...prev.filter((l) => l.id !== formatted.id)]);
          setNewEventsCount((c) => c + 1);
          setLatestEventToast(`Live Event: ${humanizeAction(formatted.action)}`);
          setTimeout(() => setLatestEventToast(null), 6000);
        }
      )
      .subscribe((status) => {
        setIsRealtimeActive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    startTransition(async () => {
      const res = await getAuditLogsAction();
      if (res.logs) {
        setLogs(res.logs);
        setNewEventsCount(0);
      }
    });
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper for humanizing action strings
  function humanizeAction(action: string): string {
    if (action === "member.onboarded") return "Member Account Onboarded";
    if (action.startsWith("member.role_changed_to_")) {
      const role = action.replace("member.role_changed_to_", "");
      return `Member Role Changed to ${role.toUpperCase()}`;
    }
    if (action === "member.suspended") return "Member Account Suspended";
    if (action === "member.reinstated") return "Member Account Reactivated";
    if (action === "member.password_reset_generated") return "Password Recovery Link Generated";

    if (action === "license.issued") return "Cryptographic License Issued";
    if (action === "license.activation_reset") return "Hardware Devices Quota Reset";
    if (action === "license.revoked") return "Cryptographic License Revoked";
    if (action === "license.unrevoked") return "Cryptographic License Reinstated";
    if (action === "license.manual_issue") return "Manual License Issued by Admin";
    if (action === "license.update_max_activations") return "License Device Limit Updated";

    if (action === "mentorship.requested") return "Mentorship Application Submitted";
    if (action === "mentorship.approve") return "Mentorship Match Approved";
    if (action === "mentorship.approved") return "Mentorship Match Approved";
    if (action === "mentorship.rejected") return "Mentorship Match Rejected";
    if (action === "mentorship.accepted") return "Mentorship Accepted by Mentor";
    if (action === "mentorship.cancelled") return "Mentorship Request Withdrawn";
    if (action === "mentorship.ended") return "Mentorship Match Ended";
    if (action === "institution_admin.approve") return "Institution Admin Granted";
    if (action === "institution_admin.reject") return "Institution Admin Rejected";

    if (action === "course.created") return "Course Curriculum Created";
    if (action === "course.updated") return "Course Syllabus Updated";
    if (action === "course.deleted") return "Course Curriculum Deleted";
    if (action === "course.publish") return "Course Curriculum Published";
    if (action === "course.unpublish") return "Course Curriculum Unpublished";

    if (action === "blog.publish") return "Academy Article Published";
    if (action === "blog.publish_scheduled") return "Scheduled Article Published Automatically";
    if (action === "blog.unpublish") return "Academy Article Unpublished";
    if (action === "blog.delete") return "Academy Article Deleted";

    if (action === "product.created") return "Digital Product Created";
    if (action === "product.updated") return "Digital Product Updated";
    if (action === "product.deleted") return "Digital Product Deleted";
    if (action === "email.send_individual") return "Individual Email Sent";
    if (action === "email.send_broadcast") return "Broadcast Email Sent";

    if (action === "order.paid") return "Store Order Settled (Paystack)";
    if (action === "order.created") return "Store Checkout Initiated";
    if (action === "order.amount_mismatch") return "Paystack Amount Verify Failed";
    if (action === "admin.security_note") return "Admin Security Milestone";

    return action.replace(/[._]/g, " ").toUpperCase();
  }

  // Helper for humanizing detail explanation
  function humanizeDetail(log: AuditLogRecord): string {
    const d = log.details || {};
    if (log.action === "member.onboarded") {
      return `${(d.full_name as string) || log.actor_name || "New member"} joined academy with initial role [${(d.role as string) || "scholar"}]`;
    }
    if (log.action === "license.issued") {
      return `Cryptographic license key issued [${((d.license_key as string) || "").substring(0, 16)}...] with max ${(d.max_activations as number) || 3} hardware seats`;
    }
    if (log.action === "license.manual_issue") {
      return `Manual license ${log.target_id?.substring(0, 8)}... issued to a member with ${(d.max_activations as number) || 3} hardware seats`;
    }
    if (log.action === "license.update_max_activations") {
      return `Device activation limit for license ${log.target_id?.substring(0, 8)}... updated by administrator`;
    }
    if (log.action === "license.activation_reset") {
      return `Hardware activations and device fingerprints cleared for license ${log.target_id?.substring(0, 8)}...`;
    }
    if (log.action === "license.revoked") {
      return `License ${log.target_id?.substring(0, 8)}... revoked and access severed`;
    }
    if (log.action === "license.unrevoked") {
      return `License ${log.target_id?.substring(0, 8)}... reinstated and access restored`;
    }
    if (log.action === "mentorship.requested") {
      return `Mentorship application initiated for scholar. Match status: pending review`;
    }
    if (log.action === "mentorship.cancelled") {
      return `Mentorship request ${log.target_id?.substring(0, 8)}... withdrawn by the mentee`;
    }
    if (log.action === "mentorship.ended") {
      return `Approved mentorship match ${log.target_id?.substring(0, 8)}... ended`;
    }
    if (log.action === "mentorship.approved" || log.action === "mentorship.approve") {
      return `Mentorship status transitioned to "approved". Mentor and mentee notified`;
    }
    if (log.action.startsWith("member.role_changed_to_")) {
      const role = log.action.replace("member.role_changed_to_", "");
      return `Administrative authority elevated profile ${log.target_id?.substring(0, 8)} to role [${role}]`;
    }
    if (log.action === "admin.security_note") {
      return (d.note as string) || "Administrative security note entered into immutable ledger.";
    }

    if (Object.keys(d).length > 0) {
      return JSON.stringify(d).substring(0, 120);
    }
    return `Event recorded on entity ${log.target_table} (ID: ${log.target_id || "N/A"})`;
  }

  // Filtering calculations
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter((log) => {
      // Time filter
      if (timeRange !== "all") {
        const logTime = new Date(log.created_at).getTime();
        const diffHours = (now - logTime) / (1000 * 60 * 60);
        if (timeRange === "24h" && diffHours > 24) return false;
        if (timeRange === "7d" && diffHours > 24 * 7) return false;
        if (timeRange === "30d" && diffHours > 24 * 30) return false;
      }

      // Category filter
      if (category !== "all" && log.category !== category) {
        return false;
      }

      // Severity filter
      if (severityFilter !== "all" && log.severity !== severityFilter) {
        return false;
      }

      // Search keyword filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchActor =
          (log.actor_name && log.actor_name.toLowerCase().includes(q)) ||
          (log.actor_email && log.actor_email.toLowerCase().includes(q)) ||
          (log.actor_id && log.actor_id.toLowerCase().includes(q));
        const matchTarget =
          (log.target_table && log.target_table.toLowerCase().includes(q)) ||
          (log.target_id && log.target_id.toLowerCase().includes(q));
        const matchDetails = JSON.stringify(log.details || {}).toLowerCase().includes(q);

        if (!matchAction && !matchActor && !matchTarget && !matchDetails) {
          return false;
        }
      }

      return true;
    });
  }, [logs, category, severityFilter, timeRange, search]);

  // Metric counts
  const metrics = useMemo(() => {
    const total = logs.length;
    const onBoardings = logs.filter(
      (l) => l.action === "member.onboarded" || l.category === "membership"
    ).length;
    const licenses = logs.filter(
      (l) => l.category === "licenses" || l.action.startsWith("license.")
    ).length;
    const mentorship = logs.filter(
      (l) => l.category === "mentorship" || l.action.startsWith("mentorship.")
    ).length;
    const security = logs.filter(
      (l) => l.severity === "warning" || l.severity === "critical" || l.category === "security"
    ).length;

    return { total, onBoardings, licenses, mentorship, security };
  }, [logs]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Timestamp (UTC)",
      "Category",
      "Severity",
      "Action",
      "Actor Name",
      "Actor Email",
      "Actor ID",
      "Target Table",
      "Target ID",
      "Details JSON",
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      l.created_at,
      l.category,
      l.severity,
      l.action,
      `"${(l.actor_name || "").replace(/"/g, '""')}"`,
      l.actor_email || "",
      l.actor_id || "",
      l.target_table || "",
      l.target_id || "",
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mla_system_audit_log_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `mla_audit_trail_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Submit Administrative Security Note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsSubmittingNote(true);
    setNoteError(null);

    const formData = new FormData();
    formData.append("note", noteContent);
    formData.append("severity", noteSeverity);

    const res = await recordAdminAuditNoteAction(formData);
    setIsSubmittingNote(false);

    if (res.error) {
      setNoteError(res.error);
    } else {
      setIsNoteModalOpen(false);
      setNoteContent("");
      handleRefresh();
    }
  };

  // Helper for category badge styling
  const getCategoryBadge = (cat: AuditCategory) => {
    switch (cat) {
      case "membership":
        return {
          label: "Membership",
          icon: <User className="h-3 w-3" />,
          color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
        };
      case "licenses":
        return {
          label: "DRM & Licenses",
          icon: <Key className="h-3 w-3" />,
          color: "border-gold/30 text-gold bg-gold/10",
        };
      case "mentorship":
        return {
          label: "Mentorship",
          icon: <Users className="h-3 w-3" />,
          color: "border-blue-500/30 text-blue-400 bg-blue-500/10",
        };
      case "courses":
        return {
          label: "Courses / LMS",
          icon: <BookOpen className="h-3 w-3" />,
          color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
        };
      case "shop":
        return {
          label: "Shop & Orders",
          icon: <ShoppingBag className="h-3 w-3" />,
          color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
        };
      case "security":
        return {
          label: "Security",
          icon: <ShieldAlert className="h-3 w-3" />,
          color: "border-rose-500/30 text-rose-400 bg-rose-500/10",
        };
      default:
        return {
          label: "System",
          icon: <ShieldCheck className="h-3 w-3" />,
          color: "border-parchment/20 text-parchment/70 bg-white/5",
        };
    }
  };

  // Helper for severity styling
  const getSeverityBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case "critical":
        return {
          label: "CRITICAL",
          color: "border-rose-500/40 text-rose-400 bg-rose-500/10 font-bold",
          icon: <AlertTriangle className="h-3 w-3 text-rose-400" />,
        };
      case "warning":
        return {
          label: "WARNING",
          color: "border-amber-500/40 text-amber-400 bg-amber-500/10 font-semibold",
          icon: <AlertTriangle className="h-3 w-3 text-amber-400" />,
        };
      case "notice":
        return {
          label: "NOTICE",
          color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-medium",
          icon: <ShieldCheck className="h-3 w-3 text-emerald-400" />,
        };
      default:
        return {
          label: "INFO",
          color: "border-parchment/20 text-parchment/60 bg-white/5",
          icon: <Info className="h-3 w-3 text-parchment/40" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Toast Banner */}
      {latestEventToast && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-xs text-emerald-300 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">{latestEventToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setLatestEventToast(null)}
            className="text-emerald-400/60 hover:text-emerald-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-white/10 bg-panel/80 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-parchment/60">
            <span>Total Events</span>
            <ShieldCheck className="h-4 w-4 text-gold/60" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-parchment">
            {metrics.total.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-parchment/40">Immutable Ledger</div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-panel/80 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>On-boardings</span>
            <User className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-emerald-300">
            {metrics.onBoardings}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/60">Scholars &amp; Faculty</div>
        </div>

        <div className="rounded-xl border border-gold/20 bg-panel/80 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gold">
            <span>Licenses &amp; DRM</span>
            <Key className="h-4 w-4 text-gold" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-gold">
            {metrics.licenses}
          </div>
          <div className="mt-1 text-[11px] text-gold/60">Cryptographic Issuances</div>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-panel/80 p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-blue-400">
            <span>Mentorships</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-blue-300">
            {metrics.mentorship}
          </div>
          <div className="mt-1 text-[11px] text-blue-400/60">State Transitions</div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-panel/80 p-4 shadow-lg col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>Security Flags</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-amber-300">
            {metrics.security}
          </div>
          <div className="mt-1 text-[11px] text-amber-400/60">High Priority Notes</div>
        </div>
      </div>

      {/* Main Filter & Action Toolbar */}
      <div className="rounded-2xl border border-white/10 bg-panel/90 p-4 shadow-xl space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment/40" />
            <input
              type="text"
              placeholder="Search by action, email, actor UUID, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0E0A08] py-2.5 pl-10 pr-4 text-xs text-parchment placeholder-parchment/40 focus:border-gold focus:outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment/40 hover:text-parchment"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Realtime Stream Badge */}
            <div
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium ${
                isRealtimeActive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/10 bg-white/5 text-parchment/50"
              }`}
            >
              <Radio className={`h-3.5 w-3.5 ${isRealtimeActive ? "animate-pulse text-emerald-400" : ""}`} />
              <span>{isRealtimeActive ? "Live Stream Active" : "Connecting..."}</span>
              {newEventsCount > 0 && (
                <span className="ml-1 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[10px] font-bold text-midnight">
                  +{newEventsCount}
                </span>
              )}
            </div>

            {/* Sync / Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs font-medium text-parchment/80 hover:border-gold/40 hover:text-parchment transition"
              title="Refresh ledger from database"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin text-gold" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs font-medium text-parchment/80 hover:border-gold/40 hover:text-parchment transition"
              title="Export CSV for auditors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>CSV</span>
            </button>

            {/* Export JSON */}
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0E0A08] px-3 py-2 text-xs font-medium text-parchment/80 hover:border-gold/40 hover:text-parchment transition"
              title="Export JSON payload"
            >
              <FileJson className="h-3.5 w-3.5" />
              <span>JSON</span>
            </button>

            {/* Log Security Note */}
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-3.5 py-2 text-xs font-semibold text-midnight hover:bg-gold-light transition shadow-md"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add Audit Note</span>
            </button>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                category === "all"
                  ? "bg-gold text-midnight font-semibold shadow"
                  : "text-parchment/60 hover:text-parchment hover:bg-white/5"
              }`}
            >
              All Events ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setCategory("membership")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                category === "membership"
                  ? "bg-gold text-midnight font-semibold shadow"
                  : "text-parchment/60 hover:text-parchment hover:bg-white/5"
              }`}
            >
              On-boardings ({logs.filter((l) => l.category === "membership").length})
            </button>
            <button
              type="button"
              onClick={() => setCategory("licenses")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                category === "licenses"
                  ? "bg-gold text-midnight font-semibold shadow"
                  : "text-parchment/60 hover:text-parchment hover:bg-white/5"
              }`}
            >
              Licenses &amp; DRM ({logs.filter((l) => l.category === "licenses").length})
            </button>
            <button
              type="button"
              onClick={() => setCategory("mentorship")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                category === "mentorship"
                  ? "bg-gold text-midnight font-semibold shadow"
                  : "text-parchment/60 hover:text-parchment hover:bg-white/5"
              }`}
            >
              Mentorship ({logs.filter((l) => l.category === "mentorship").length})
            </button>
            <button
              type="button"
              onClick={() => setCategory("security")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                category === "security"
                  ? "bg-gold text-midnight font-semibold shadow"
                  : "text-parchment/60 hover:text-parchment hover:bg-white/5"
              }`}
            >
              Security ({logs.filter((l) => l.category === "security").length})
            </button>
          </div>

          {/* Time & Severity Selectors */}
          <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#0E0A08] px-2 py-1">
              <span className="text-parchment/40">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as AuditSeverity | "all")}
                className="bg-transparent text-parchment font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-panel text-parchment">All Levels</option>
                <option value="info" className="bg-panel text-parchment">Info</option>
                <option value="notice" className="bg-panel text-parchment">Notice</option>
                <option value="warning" className="bg-panel text-parchment">Warning</option>
                <option value="critical" className="bg-panel text-parchment">Critical</option>
              </select>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#0E0A08] px-2 py-1">
              <span className="text-parchment/40">Time:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as "all" | "24h" | "7d" | "30d")}
                className="bg-transparent text-parchment font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-panel text-parchment">All Time</option>
                <option value="24h" className="bg-panel text-parchment">Last 24h</option>
                <option value="7d" className="bg-panel text-parchment">Last 7 Days</option>
                <option value="30d" className="bg-panel text-parchment">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Stream Table / Cards */}
      <div className="rounded-2xl border border-white/10 bg-panel shadow-2xl overflow-hidden divide-y divide-white/5">
        <div className="bg-white/[0.02] px-4 py-3 flex items-center justify-between text-xs text-parchment/50 font-medium">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gold/60" />
            <span>Showing {filteredLogs.length} events</span>
          </div>
          <div className="text-[11px] text-parchment/40">
            Realtime WebSocket + PostgreSQL Triggers Active
          </div>
        </div>

        {filteredLogs.map((log) => {
          const catBadge = getCategoryBadge(log.category);
          const sevBadge = getSeverityBadge(log.severity);

          return (
            <div
              key={log.id}
              onClick={() => setInspectingLog(log)}
              className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Pill */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${catBadge.color}`}
                  >
                    {catBadge.icon}
                    {catBadge.label}
                  </span>

                  {/* Severity Badge */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border ${sevBadge.color}`}
                  >
                    {sevBadge.icon}
                    {sevBadge.label}
                  </span>

                  {/* Action Title */}
                  <span className="font-semibold text-xs text-parchment group-hover:text-gold transition-colors">
                    {humanizeAction(log.action)}
                  </span>
                </div>

                {/* Event Explanation */}
                <p className="text-xs text-parchment/80 font-sans break-words line-clamp-2">
                  {humanizeDetail(log)}
                </p>

                {/* Metadata details line */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-parchment/50 pt-1 font-mono">
                  {log.actor_name && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-parchment/40" />
                      <span className="text-parchment/70 font-sans">{log.actor_name}</span>
                      {log.actor_email && (
                        <span className="text-parchment/40 font-sans">({log.actor_email})</span>
                      )}
                    </span>
                  )}

                  {log.target_table && (
                    <span className="flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5">
                      <span className="text-parchment/40">target:</span>
                      <span className="text-parchment/80">{log.target_table}</span>
                      {log.target_id && (
                        <span className="text-gold/70">#{log.target_id.substring(0, 8)}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamp and inspect button */}
              <div className="shrink-0 flex sm:flex-col sm:items-end justify-between items-center gap-1.5 text-[11px] text-parchment/50 font-mono">
                <div className="flex items-center gap-1.5 text-parchment/70">
                  <Clock className="h-3.5 w-3.5 text-gold/60" />
                  <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <div className="text-[10px] text-parchment/40">
                  {new Date(log.created_at).toLocaleDateString()}
                </div>
                <span className="inline-flex items-center text-[10px] text-gold/80 group-hover:underline mt-1 font-sans">
                  Inspect &rarr;
                </span>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="p-16 text-center text-xs text-parchment/50 space-y-2">
            <ShieldAlert className="mx-auto h-10 w-10 text-parchment/30" />
            <p className="font-medium text-parchment/70">No audit events match the selected criteria.</p>
            <p className="text-[11px] text-parchment/40">
              Try adjusting your search query, severity, or date range filter.
            </p>
          </div>
        )}
      </div>

      {/* FORENSIC INSPECTOR MODAL */}
      {inspectingLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setInspectingLog(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-white/10 bg-panel p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      getCategoryBadge(inspectingLog.category).color
                    }`}
                  >
                    {getCategoryBadge(inspectingLog.category).label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border ${
                      getSeverityBadge(inspectingLog.severity).color
                    }`}
                  >
                    {getSeverityBadge(inspectingLog.severity).label}
                  </span>
                </div>
                <h3 className="font-display text-lg text-parchment mt-1">
                  {humanizeAction(inspectingLog.action)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="rounded-lg p-1.5 text-parchment/60 hover:bg-white/10 hover:text-parchment"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Key-Value Forensic Ledger */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-white/5 bg-[#0E0A08] p-3 space-y-1">
                <span className="text-parchment/40 text-[10px] uppercase font-mono">Event ID</span>
                <div className="font-mono text-parchment font-semibold">#{inspectingLog.id}</div>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0E0A08] p-3 space-y-1">
                <span className="text-parchment/40 text-[10px] uppercase font-mono">Timestamp (UTC &amp; Local)</span>
                <div className="font-mono text-parchment text-[11px]">
                  {new Date(inspectingLog.created_at).toISOString()}
                </div>
                <div className="text-[10px] text-parchment/50">
                  {new Date(inspectingLog.created_at).toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0E0A08] p-3 space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-parchment/40 text-[10px] uppercase font-mono">Actor / Identity</span>
                  {inspectingLog.actor_id && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(inspectingLog.actor_id!, "actor")}
                      className="text-[10px] text-gold hover:underline flex items-center gap-1"
                    >
                      {copiedField === "actor" ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" /> Copied Actor UUID
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy Actor UUID
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="text-parchment font-medium text-xs">
                  {inspectingLog.actor_name || "System Automated"}
                  {inspectingLog.actor_email && (
                    <span className="text-parchment/60 ml-1">({inspectingLog.actor_email})</span>
                  )}
                </div>
                {inspectingLog.actor_id && (
                  <div className="font-mono text-[10px] text-parchment/40 break-all">
                    UUID: {inspectingLog.actor_id}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0E0A08] p-3 space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-parchment/40 text-[10px] uppercase font-mono">Target Entity</span>
                  {inspectingLog.target_id && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(inspectingLog.target_id!, "target")}
                      className="text-[10px] text-gold hover:underline flex items-center gap-1"
                    >
                      {copiedField === "target" ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" /> Copied Target UUID
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy Target UUID
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="text-parchment font-mono text-xs">
                  Table: <span className="text-gold">{inspectingLog.target_table}</span>
                </div>
                {inspectingLog.target_id && (
                  <div className="font-mono text-[10px] text-parchment/40 break-all">
                    Target UUID: {inspectingLog.target_id}
                  </div>
                )}
              </div>
            </div>

            {/* Details Payload JSON */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-parchment">Forensic Payload (JSONB)</span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(inspectingLog, null, 2),
                      "json"
                    )
                  }
                  className="text-xs text-gold hover:underline flex items-center gap-1"
                >
                  {copiedField === "json" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied Full JSON
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy Event JSON
                    </>
                  )}
                </button>
              </div>

              <pre className="rounded-xl border border-white/10 bg-[#0E0A08] p-4 text-[11px] font-mono text-emerald-400/90 overflow-x-auto max-h-56 leading-relaxed">
                {JSON.stringify(inspectingLog.details || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-parchment hover:bg-white/10 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ADMINISTRATIVE SECURITY NOTE MODAL */}
      {isNoteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setIsNoteModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-panel p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-gold" />
                <h3 className="font-display text-lg text-parchment">Record Audit Note</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="rounded-lg p-1.5 text-parchment/60 hover:bg-white/10 hover:text-parchment"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-parchment/70">
              Append an immutable, timestamped administrative milestone or security verification note into the academy audit trail.
            </p>

            {noteError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {noteError}
              </div>
            )}

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-parchment">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["notice", "warning", "critical"] as AuditSeverity[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNoteSeverity(s)}
                      className={`rounded-xl border py-2 text-xs font-semibold uppercase transition ${
                        noteSeverity === s
                          ? s === "critical"
                            ? "border-rose-500 bg-rose-500/20 text-rose-400"
                            : s === "warning"
                            ? "border-amber-500 bg-amber-500/20 text-amber-400"
                            : "border-gold bg-gold/20 text-gold"
                          : "border-white/10 bg-[#0E0A08] text-parchment/60 hover:text-parchment"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-parchment">Security Note / Incident Observation</label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="E.g. Completed quarterly SOC2 access review; all super administrative privileges confirmed and aligned..."
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-3 text-xs text-parchment placeholder-parchment/40 focus:border-gold focus:outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-parchment hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNote || !noteContent.trim()}
                  className="rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-midnight hover:bg-gold-light transition disabled:opacity-50"
                >
                  {isSubmittingNote ? "Committing..." : "Commit Note to Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
