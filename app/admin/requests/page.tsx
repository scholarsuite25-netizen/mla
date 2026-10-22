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
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
          Institution Admin Requests
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Members requesting to become administrators for their institution.
        </p>

        <div className="mt-4 space-y-3">
          {(!pendingAdminRequests || pendingAdminRequests.length === 0) && (
            <p className="text-xs sm:text-sm text-slate-400 py-4">No pending institution admin requests.</p>
          )}
          {pendingAdminRequests?.map((req) => {
            const prof = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
            const inst = Array.isArray(req.institutions) ? req.institutions[0] : req.institutions;
            return (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-300/80 bg-white p-5 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    {prof?.full_name ?? "Member"}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-[#0284C7]">
                    Requests to administer: {inst?.name ?? "Institution"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
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
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3">Past Admin Requests</p>
            <div className="space-y-2">
              {restAdminRequests.slice(0, 5).map((req) => {
                const prof = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
                const inst = Array.isArray(req.institutions) ? req.institutions[0] : req.institutions;
                return (
                  <div
                    key={req.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-xs"
                  >
                    <span>
                      <strong className="text-slate-800 font-semibold">{prof?.full_name ?? "Member"}</strong> ({inst?.name ?? "Institution"})
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
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
          Mentorship Approval Queue
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Requests the mentor accepted, awaiting your final platform approval.
        </p>

        <div className="mt-4 space-y-3">
          {(!pendingMentorship || pendingMentorship.length === 0) && (
            <p className="text-xs sm:text-sm text-slate-400 py-4">Nothing waiting for approval.</p>
          )}
          {pendingMentorship?.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-cyan-300/80 bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <p className="text-sm text-slate-800">
                  <span className="font-bold text-slate-900">
                    {(req.mentee as ParticipantProfile)?.full_name ?? "Mentee"}
                  </span>{" "}
                  →{" "}
                  <span className="font-bold text-slate-900">
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
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3">Past Mentorship Matches</p>
            <div className="space-y-2">
              {restMentorship.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-xs"
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