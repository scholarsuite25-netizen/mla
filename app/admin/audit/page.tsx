import { createAdminClient } from "@/lib/supabase/admin";
import { AuditLogManager, AuditEvent } from "@/components/admin/audit-log-manager";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const admin = createAdminClient();

  const [{ data: licenses }, { data: requests }, { data: profiles }] =
    await Promise.all([
      admin
        .from("product_licenses")
        .select("id, license_key, created_at, digital_products(title)")
        .order("created_at", { ascending: false })
        .limit(30),
      admin
        .from("mentorship_requests")
        .select("id, status, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
      admin
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

  const auditEvents: AuditEvent[] = [
    ...(licenses || []).map((l) => ({
      id: l.id,
      action: "Product License Issued",
      detail: `License key created for ${(l.digital_products as { title?: string } | null)?.title || "Digital Product"}`,
      time: l.created_at,
      badge: "Shop / License",
      badgeColor: "border-gold/30 text-gold bg-gold/10",
    })),
    ...(requests || []).map((r) => ({
      id: r.id,
      action: `Mentorship Application: ${r.status.toUpperCase()}`,
      detail: `Mentorship request status updated to "${r.status}"`,
      time: r.created_at,
      badge: "Mentorship",
      badgeColor: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    })),
    ...(profiles || []).map((p) => ({
      id: p.id,
      action: "Member Account Onboarded",
      detail: `${p.full_name || "Anonymous User"} registered with role ${p.role}`,
      time: p.created_at,
      badge: "Membership",
      badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-parchment">System Audit Log</h2>
        <p className="mt-1 text-xs text-parchment/60">
          Real-time activity ledger recording user on-boardings, license issuances, and mentorship state changes across the academy.
        </p>
      </div>

      <AuditLogManager events={auditEvents} />
    </div>
  );
}
