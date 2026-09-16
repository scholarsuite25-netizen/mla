import { createAdminClient } from "@/lib/supabase/admin";
import { AuditLogManager } from "@/components/admin/audit-log-manager";
import { AuditLogRecord, AuditCategory, AuditSeverity } from "@/lib/audit";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const admin = createAdminClient();

  // Fetch up to 300 latest audit records
  const { data: rawLogs, error: logError } = await admin
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (logError) {
    console.error("Error fetching audit logs:", logError);
  }

  // Fetch profiles to map actor IDs to readable full names
  const actorIds = Array.from(
    new Set(
      (rawLogs || [])
        .map((l) => l.actor_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const actorMap = new Map<string, { name: string; email?: string }>();

  if (actorIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds);

    (profiles || []).forEach((p) => {
      actorMap.set(p.id, { name: p.full_name || "Academy Member" });
    });

    try {
      const { data: usersData } = await admin.auth.admin.listUsers({
        perPage: 1000,
      });
      (usersData?.users || []).forEach((u) => {
        const existing = actorMap.get(u.id);
        if (existing) {
          existing.email = u.email;
        } else {
          actorMap.set(u.id, {
            name: (u.user_metadata?.full_name as string) || u.email || "User",
            email: u.email,
          });
        }
      });
    } catch {
      // Ignore if auth admin listing fails
    }
  }

  const enrichedLogs: AuditLogRecord[] = (rawLogs || []).map((l) => {
    const actorInfo = l.actor_id ? actorMap.get(l.actor_id) : undefined;
    return {
      id: l.id,
      actor_id: l.actor_id,
      actor_email: l.actor_email || actorInfo?.email || null,
      actor_name: actorInfo?.name || (l.actor_id ? "System / User" : "Automated System"),
      action: l.action,
      target_table: l.target_table,
      target_id: l.target_id,
      category: (l.category as AuditCategory) || "general",
      severity: (l.severity as AuditSeverity) || "info",
      details: (l.details as Record<string, unknown>) || {},
      ip_address: l.ip_address || null,
      created_at: l.created_at,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-Time Activity Stream
          </span>
          <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold border border-gold/30">
            Enterprise Grade
          </span>
        </div>
        <h2 className="font-display text-2xl text-parchment mt-2">Academy System Audit Log</h2>
        <p className="mt-1 text-xs text-parchment/60 max-w-3xl">
          Tamper-evident, real-time activity ledger recording user on-boardings, cryptographic license issuances, mentorship state transitions, LMS updates, and administrative security events across the Mentorship &amp; Leadership Academy.
        </p>
      </div>

      <AuditLogManager initialLogs={enrichedLogs} />
    </div>
  );
}
