"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { assertSuperAdmin } from "@/lib/auth-guard";
import { AuditLogRecord, AuditCategory, AuditSeverity, logAuditEvent } from "@/lib/audit";

export interface AuditQueryOptions {
  category?: AuditCategory;
  severity?: AuditSeverity | "all";
  search?: string;
  limit?: number;
}

export async function getAuditLogsAction(
  options: AuditQueryOptions = {}
): Promise<{ logs?: AuditLogRecord[]; error?: string }> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  try {
    const admin = createAdminClient();
    const limit = options.limit || 200;

    let query = admin
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (options.category && options.category !== "all") {
      query = query.eq("category", options.category);
    }
    if (options.severity && options.severity !== "all") {
      query = query.eq("severity", options.severity);
    }

    const { data: rawLogs, error } = await query;
    if (error) return { error: error.message };

    // Fetch actor profile names and emails to enrich records
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

      // Also get emails from auth users if needed
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
        // Fallback gracefully
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

    return { logs: enrichedLogs };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load audit logs." };
  }
}

export async function recordAdminAuditNoteAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const note = (formData.get("note") as string)?.trim();
  const severity = (formData.get("severity") as AuditSeverity) || "notice";
  if (!note) return { error: "Audit note cannot be blank." };

  await logAuditEvent({
    action: "admin.security_note",
    targetTable: "audit_log",
    actorId: actor.id,
    actorEmail: actor.email,
    category: "security",
    severity,
    details: {
      note,
      author: actor.email || "Super Administrator",
    },
  });

  return { success: true };
}
