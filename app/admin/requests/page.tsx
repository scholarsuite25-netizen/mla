import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/mentorship/status-badge";
import { ApproveRequestButton } from "@/components/admin/approve-request";

export const dynamic = "force-dynamic";

type ParticipantProfile = { full_name: string } | null;
type RequestRow = {
  id: string;
  status: string;
  created_at: string;
  mentee?: ParticipantProfile;
  mentor?: ParticipantProfile;
};

export default async function AdminRequestsPage() {
  const admin = createAdminClient();
  const { data: requests } = await admin
    .from("mentorship_requests")
    .select(
      "id,status,created_at,mentee:mentorship_requests!mentorship_requests_mentee_id_fkey(full_name),mentor:mentorship_requests!mentorship_requests_mentor_id_fkey(full_name)"
    )
    .order("created_at", { ascending: false });

  const pending = (requests as RequestRow[] | null)?.filter(
    (r) => r.status === "accepted"
  );
  const rest = (requests as RequestRow[] | null)?.filter(
    (r) => r.status !== "accepted"
  );

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-2xl text-parchment">
          Mentorship approval queue
        </h2>
        <p className="mt-1 text-sm text-parchment/50">
          Requests the mentor accepted, awaiting your final approval.
        </p>

        <div className="mt-4 space-y-3">
          {(!pending || pending.length === 0) && (
            <p className="text-parchment/50">Nothing waiting for approval.</p>
          )}
          {pending?.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between gap-4 rounded-md border border-gold/40 bg-panel p-4"
            >
              <div className="min-w-0">
                <p className="text-sm text-parchment">
                  <span className="font-medium">
                    {(req.mentee as ParticipantProfile)?.full_name ?? "Mentee"}
                  </span>{" "}
                  →{" "}
                  <span className="font-medium">
                    {(req.mentor as ParticipantProfile)?.full_name ?? "Mentor"}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={req.status} />
                <ApproveRequestButton requestId={req.id} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {rest && rest.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-parchment">History</h3>
          <div className="mt-3 space-y-2">
            {rest.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-4 rounded-md border border-parchment/10 bg-panel p-3 opacity-80"
              >
                <p className="min-w-0 text-xs text-parchment/70">
                  {(req.mentee as ParticipantProfile)?.full_name ?? "Mentee"} →{" "}
                  {(req.mentor as ParticipantProfile)?.full_name ?? "Mentor"} ·{" "}
                  {new Date(req.created_at).toLocaleDateString()}
                </p>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}