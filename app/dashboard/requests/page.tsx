import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RequestActions } from "@/components/mentorship/request-actions";
import { StatusBadge } from "@/components/mentorship/status-badge";

export const dynamic = "force-dynamic";

type ParticipantProfile = { full_name: string } | null;
type RequestRow = {
  id: string;
  status: string;
  created_at: string;
  mentee?: ParticipantProfile;
  mentor?: ParticipantProfile;
};

export default async function DashboardRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,institution_id")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "member";

  // Where I'm the mentor.
  const { data: incoming } = await supabase
    .from("mentorship_requests")
    .select(
      "id,status,created_at,mentee:mentorship_requests!mentorship_requests_mentee_id_fkey(full_name)"
    )
    .eq("mentor_id", user.id)
    .order("created_at", { ascending: false });

  // Where I'm the mentee.
  const { data: outgoing } = await supabase
    .from("mentorship_requests")
    .select(
      "id,status,created_at,mentor:mentorship_requests!mentorship_requests_mentor_id_fkey(full_name)"
    )
    .eq("mentee_id", user.id)
    .order("created_at", { ascending: false });

  // Institution activity (read-only for Institution Admins).
  let institutionRequests: RequestRow[] = [];
  if ((role === "institution_admin" || role === "super_admin") && profile?.institution_id) {
    // Super Admin sees all; Institution Admin scoped by their institution (RLS filters automatically
    // through the mr_select_institution_admin policy).
    const { data } = await supabase
      .from("mentorship_requests")
      .select(
        "id,status,created_at,mentee:mentorship_requests!mentorship_requests_mentee_id_fkey(full_name),mentor:mentorship_requests!mentorship_requests_mentor_id_fkey(full_name)"
      )
      .order("created_at", { ascending: false });
    institutionRequests = (data as unknown as RequestRow[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 space-y-14">
      <h1 className="font-display text-3xl text-parchment">My Requests</h1>

      {/* Where I'm the mentor */}
      <section>
        <h2 className="font-display text-xl text-parchment">
          Incoming {role === "super_admin" ? "" : "(You as mentor)"}
        </h2>
        <p className="mt-1 text-sm text-parchment/50">
          Mentee requests directed to you.
        </p>
        <div className="mt-4 space-y-3">
          {(!incoming || incoming.length === 0) && (
            <p className="text-parchment/50">No incoming requests yet.</p>
          )}
          {(incoming as RequestRow[] | null)?.map((req) => {
            const menteeProfile = req.mentee as ParticipantProfile;
            return (
              <div
                key={req.id}
                className="flex items-center justify-between gap-4 rounded-md border border-parchment/10 bg-panel p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-parchment">
                    {menteeProfile?.full_name ?? "Member"}
                  </p>
                  <p className="mt-0.5 text-xs text-parchment/50">
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={req.status} />
                  {req.status === "pending" && (
                    <RequestActions requestId={req.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Where I'm the mentee */}
      <section>
        <h2 className="font-display text-xl text-parchment">
          Sent {role === "super_admin" ? "" : "(You as mentee)"}
        </h2>
        <p className="mt-1 text-sm text-parchment/50">
          Mentorship requests you sent and their statuses.
        </p>
        <div className="mt-4 space-y-3">
          {(!outgoing || outgoing.length === 0) && (
            <p className="text-parchment/50">You have not sent any requests yet.</p>
          )}
          {(outgoing as RequestRow[] | null)?.map((req) => {
            const mentorProfile = req.mentor as ParticipantProfile;
            return (
              <div
                key={req.id}
                className="flex items-center justify-between gap-4 rounded-md border border-parchment/10 bg-panel p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-parchment">
                    {mentorProfile?.full_name ?? "Mentor"}
                  </p>
                  <p className="mt-0.5 text-xs text-parchment/50">
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Institution Admin / Super Admin: institution-wide view */}
      {institutionRequests.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-parchment">
            Institution activity (read-only)
          </h2>
          <div className="mt-4 space-y-3">
            {institutionRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-4 rounded-md border border-parchment/10 bg-panel p-4 opacity-90"
              >
                <div className="min-w-0">
                  <p className="text-sm text-parchment">
                    {(req.mentee as ParticipantProfile)?.full_name ?? "Member"} →{" "}
                    {(req.mentor as ParticipantProfile)?.full_name ?? "Mentor"}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}