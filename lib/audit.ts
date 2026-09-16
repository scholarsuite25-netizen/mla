import { createAdminClient } from "@/lib/supabase/admin";

export type AuditCategory =
  | "all"
  | "membership"
  | "licenses"
  | "mentorship"
  | "courses"
  | "shop"
  | "security"
  | "general";

export type AuditSeverity = "info" | "notice" | "warning" | "critical";

export interface AuditLogRecord {
  id: number | string;
  actor_id: string | null;
  actor_email: string | null;
  actor_name?: string | null;
  action: string;
  target_table: string;
  target_id: string | null;
  category: AuditCategory;
  severity: AuditSeverity;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface LogAuditParams {
  action: string;
  targetTable: string;
  targetId?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  category?: AuditCategory;
  severity?: AuditSeverity;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}

/**
 * Centrally records an enterprise audit event to public.audit_log
 */
export async function logAuditEvent(params: LogAuditParams): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      action: params.action,
      target_table: params.targetTable,
      target_id: params.targetId ?? null,
      actor_id: params.actorId ?? null,
      actor_email: params.actorEmail ?? null,
      category: params.category ?? "general",
      severity: params.severity ?? "info",
      details: params.details ?? {},
      ip_address: params.ipAddress ?? null,
    });
  } catch (err) {
    console.error("Failed to write audit log event:", err);
  }
}
