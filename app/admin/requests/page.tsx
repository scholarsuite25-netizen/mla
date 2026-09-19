import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/mentorship/status-badge";
import { ApproveRequestButton } from "@/components/admin/approve-request";
import { InstitutionRequestActions } from "@/components/admin/institution-request-actions";

export const dynamic = "force-dynamic";

type ParticipantProfile = { full_name: string } | null;
type RequestRow = {
  id: string;
  status: string;
  created_at: string;
  mentee?: ParticipantProfile;
  mentor?: ParticipantProfile;
};

type InstAdminRequestRow = {
  id: string;
  status: string;
  created_at: string;
  profile_id: string;
  institution_id: string;
  profiles?: { full_name: string | null } | { full_name: string | null }[] | null;
  institutions?: { name: string } | { name: string }[] | null;
};

export default async function AdminRequestsPage() {
  const admin = createAdminClient();

  const [{ data: requests }, { data: adminRequests }] = await Promise.all([
    admin
      .from("mentorship_requests")
      .select(
        "id,status,created_at,mentee:profiles!mentorship_requests_mentee_id_fkey(full_name),mentor:profiles!mentorship_requests_mentor_id_fkey(full_name)"
      )
      .order("created_at", { ascending: false }),
    admin
      .from("institution_admin_requests")
      .select(
        "id,status,created_at,profile_id,institution_id,profiles(full_name),institutions(name)"
      )
      .order("created_at", { ascending: false }),
  ]);

  const pendingMentorship = (requests as RequestRow[] | null)?.filter(
    (r) => r.status === "accepted"
  );
  const restMentorship = (requests as RequestRow[] | null)?.filter(
    (r) => r.status !== "accepted"
  );

  const pendingAdminRequests = (adminRequests as unknown as InstAdminRequestRow[] | null)?.filter(
    (r) => r.status === "pending"
  );
  const restAdminRequests = (adminRequests as unknown as InstAdminRequestRow[] | null)?.filter(
    (r) => r.status !== "pending"
  );

  return (
    <div className="space-y-12">
      {/* Institution Admin Requests */}
      <div>
        <h2 className="font-display text-2xl text-parchment">
          Institution Admin Requests
        </h2>
        <p className="mt-1 text-sm text-parchment/50">
          Members requesting to become administrators for their institution.
        </p>

        <div className="mt-4 space-y-3">
          {(!pendingAdminRequests || pendingAdminRequests.length === 0) && (
            <p className="text-parchment/50">No pending institution admin requests.</p>
          )}
          {pendingAdminRequests?.map((req) => {
            const prof = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
            const inst = Array.isArray(req.institutions) ? req.institutions[0] : req.institutions;
            return (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-gold/40 bg-panel p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-parchment">
                    {prof?.full_name ?? "Member"}
                  </p>
                  <p className="mt-0.5 text-xs text-gold">
                    Requests to administer: {inst?.name ?? "Institution"}
                  </p>
                  <p className="mt-0.5 text-xs text-parchment/40">
                    Requested on {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <InstitutionRequestActions requestId={req.id} />
                </div>
              </div>
            );
          })}
        </div>

        {restAdminRequests && restAdminRequests.length > 0 && (
          <div className="mt-4 border-t border-parchment/10 pt-3">
            <p className="text-xs uppercase tracking-widest text-parchment/50 mb-2">Past Admin Requests</p>
            <div className="space-y-2">
              {restAdminRequests.slice(0, 5).map((req) => {
                const prof = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
                const inst = Array.isArray(req.institutions) ? req.institutions[0] : req.institutions;
                return (
                  <div
                    key={req.id}
                    className="flex items-center justify-between gap-4 rounded-md border border-parchment/10 bg-panel/50 p-2.5 text-xs text-parchment/70"
                  >
                    <span>
                      {prof?.full_name ?? "Member"} ({inst?.name ?? "Institution"})
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mentorship Approval Queue */}
      <div>
        <h2 className="font-display text-2xl text-parchment">
          Mentorship Approval Queue
        </h2>
        <p className="mt-1 text-sm text-parchment/50">
          Requests the mentor accepted, awaiting your final platform approval.
        </p>

        <div className="mt-4 space-y-3">
          {(!pendingMentorship || pendingMentorship.length === 0) && (
            <p className="text-parchment/50">Nothing waiting for approval.</p>
          )}
          {pendingMentorship?.map((req) => (
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

        {restMentorship && restMentorship.length > 0 && (
          <div className="mt-4 border-t border-parchment/10 pt-3">
            <p className="text-xs uppercase tracking-widest text-parchment/50 mb-2">Past Mentorship Matches</p>
            <div className="space-y-2">
              {restMentorship.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between gap-4 rounded-md border border-parchment/10 bg-panel/50 p-2.5 text-xs text-parchment/70"
                >
                  <span>
                    {(req.mentee as ParticipantProfile)?.full_name ?? "Mentee"} →{" "}
                    {(req.mentor as ParticipantProfile)?.full_name ?? "Mentor"} ·{" "}
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}