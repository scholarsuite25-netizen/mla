import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const admin = createAdminClient();

  const [{ data: licenses }, { data: requests }, { data: profiles }] =
    await Promise.all([
      admin
        .from("product_licenses")
        .select("id, license_key, created_at, digital_products(title)")
        .order("created_at", { ascending: false })
        .limit(10),
      admin
        .from("mentorship_requests")
        .select("id, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      admin
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const auditEvents = [
    ...(licenses || []).map((l) => ({
      id: l.id,
      action: "Product License Issued",
      detail: `License created for ${(l.digital_products as { title?: string } | null)?.title || "Digital Product"}`,
      time: l.created_at,
      badge: "Shop / License",
      badgeColor: "border-gold/30 text-gold bg-gold/10",
    })),
    ...(requests || []).map((r) => ({
      id: r.id,
      action: `Mentorship Request: ${r.status.toUpperCase()}`,
      detail: `Application updated to status "${r.status}"`,
      time: r.created_at,
      badge: "Mentorship",
      badgeColor: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    })),
    ...(profiles || []).map((p) => ({
      id: p.id,
      action: "Member Onboarded",
      detail: `${p.full_name || "Anonymous Member"} joined as ${p.role}`,
      time: p.created_at,
      badge: "Membership",
      badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-parchment">System Audit Log</h2>
          <p className="mt-1 text-xs text-parchment/60">
            Real-time feed of member registrations, license issuances, and platform administrative actions.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-panel divide-y divide-white/5 shadow-xl">
        {auditEvents.map((evt) => (
          <div key={evt.id} className="p-4 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold border ${evt.badgeColor}`}>
                  {evt.badge}
                </span>
                <span className="font-semibold text-xs text-parchment">{evt.action}</span>
              </div>
              <p className="text-xs text-parchment/70">{evt.detail}</p>
            </div>
            <span className="shrink-0 text-[11px] text-parchment/50 font-mono">
              {new Date(evt.time).toLocaleString()}
            </span>
          </div>
        ))}
        {auditEvents.length === 0 && (
          <div className="p-8 text-center text-xs text-parchment/50">
            No system audit logs recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
