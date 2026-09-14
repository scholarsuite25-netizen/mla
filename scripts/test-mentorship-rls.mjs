// Phase 3 RLS test: full mentorship flow — request insert, participant
// visibility, mentor accept/reject only, mentee cannot self-approve,
// institution admin read-only, super admin final approval.
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let failures = 0;
function check(name, cond, extra = "") {
  if (!cond) {
    failures++;
    console.log(`FAIL: ${name} ${extra}`);
  } else {
    console.log(`PASS: ${name}`);
  }
}

async function makeUser(suffix, instId, role) {
  const email = `mr-${suffix}-${Date.now()}@test.local`;
  const password = "TestPass123!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { institution_id: instId },
  });
  if (error) throw new Error(`${email}: ${error.message}`);
  const { error: upErr } = await admin
    .from("profiles")
    .update({ institution_id: instId, full_name: `MR ${suffix}` })
    .eq("id", data.user.id);
  if (upErr) throw new Error(`profiles update: ${upErr.message}`);
  if (role) {
    const { error: roleErr } = await admin
      .from("profiles")
      .update({ role })
      .eq("id", data.user.id);
    if (roleErr) throw new Error(`role update: ${roleErr.message}`);
  }
  return { id: data.user.id, email };
}

async function authed(email) {
  const { data } = await anon.auth.signInWithPassword({
    email,
    password: "TestPass123!",
  });
  return { session: data.session, client: anon };
}

async function clientFor(session) {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${session.access_token}` } },
  });
}

async function main() {
  const { data: instA } = await admin
    .from("institutions")
    .insert({ name: `MR Inst A ${Date.now()}` })
    .select("id")
    .single();
  const { data: instB } = await admin
    .from("institutions")
    .insert({ name: `MR Inst B ${Date.now()}` })
    .select("id")
    .single();

  const mentor = await makeUser("mentor", instA.id);
  const mentee = await makeUser("mentee", instB.id);
  const outsider = await makeUser("outsider", instB.id);
  const instAdmin = await makeUser("instadmin", instA.id, "institution_admin");

  // 1. Member becomes a mentor (owner insert).
  const mentorAuth = await authed(mentor.email);
  const mentorClient = await clientFor(mentorAuth.session);
  const { error: becomeErr } = await mentorClient
    .from("mentor_profiles")
    .insert({ profile_id: mentor.id, bio: "I mentor builders", expertise_tags: ["AI", "Coding"], availability: "Evenings" });
  check("member becomes a mentor", !becomeErr, becomeErr?.message ?? "");

  // 2. Anonymous sees the active mentor directory.
  const { data: dirAnon } = await anon.from("mentor_profiles").select("profile_id").eq("is_active", true);
  check(
    "anon sees active mentor directory",
    (dirAnon ?? []).some((m) => m.profile_id === mentor.id)
  );

  // 3. Member (different institution) can request mentorship.
  const menteeAuth = await authed(mentee.email);
  const menteeClient = await clientFor(menteeAuth.session);
  const { error: reqErr } = await menteeClient
    .from("mentorship_requests")
    .insert({ mentee_id: mentee.id, mentor_id: mentor.id, institution_id: instB.id, status: "pending" });
  check("cross-institution mentorship request created", !reqErr, reqErr?.message ?? "");
  const { data: reqs } = await admin
    .from("mentorship_requests")
    .select("id,status")
    .eq("mentee_id", mentee.id)
    .eq("mentor_id", mentor.id);
  const req = reqs?.[0];
  check("request row exists", !!req);

  // 4. Participant (mentor) sees the request.
  const { data: mentorView } = await mentorClient
    .from("mentorship_requests")
    .select("id")
    .eq("id", req.id);
  check("mentor sees the request (participant)", (mentorView ?? []).length === 1);

  // 5. Outsider (non-participant) cannot see the request.
  const outsiderAuth = await authed(outsider.email);
  const outsiderClient = await clientFor(outsiderAuth.session);
  const { data: outsiderView } = await outsiderClient
    .from("mentorship_requests")
    .select("id")
    .eq("id", req.id);
  check("non-participant cannot see the request", (outsiderView ?? []).length === 0);

  // 6. Mentee cannot change status to 'approved' (only super admin / own 'pending' insert policy).
  const fakeApproval = await menteeClient
    .from("mentorship_requests")
    .update({ status: "approved" })
    .eq("id", req.id);
  const { data: stillPending } = await admin
    .from("mentorship_requests")
    .select("status")
    .eq("id", req.id)
    .single();
  check("mentee cannot approve own request", (stillPending?.status ?? "") === "pending", JSON.stringify(fakeApproval));

  // 7. Mentor accepts -> allowed, status flips to 'accepted'.
  const { error: acceptErr } = await mentorClient
    .from("mentorship_requests")
    .update({ status: "accepted" })
    .eq("id", req.id)
    .eq("mentor_id", mentor.id);
  check("mentor accepts request", !acceptErr, acceptErr?.message ?? "");
  const { data: accepted } = await admin
    .from("mentorship_requests")
    .select("status")
    .eq("id", req.id)
    .single();
  check("status is accepted", accepted?.status === "accepted");

  // 8. Institution Admin of the mentor's institution: reads but cannot approve.
  const instAdminAuth = await authed(instAdmin.email);
  const instAdminClient = await clientFor(instAdminAuth.session);
  const { data: iaView } = await instAdminClient
    .from("mentorship_requests")
    .select("id")
    .eq("id", req.id);
  check("institution admin sees institution request (view-only)", (iaView ?? []).length === 1);

  await instAdminClient.from("mentorship_requests").update({ status: "approved" }).eq("id", req.id);
  const { data: afterIA } = await admin
    .from("mentorship_requests")
    .select("status")
    .eq("id", req.id)
    .single();
  check("institution admin cannot approve (read-only)", afterIA?.status === "accepted");

  // 9. Super Admin final approval (direct, mirrors approveRequestAction).
  const { error: superErr } = await admin
    .from("mentorship_requests")
    .update({ status: "approved" })
    .eq("id", req.id);
  check("super admin final approval", !superErr, superErr?.message ?? "");
  const { data: approved } = await admin
    .from("mentorship_requests")
    .select("status")
    .eq("id", req.id)
    .single();
  check("status is approved", approved?.status === "approved");

  // Cleanup.
  for (const u of [mentor, mentee, outsider, instAdmin]) {
    await admin.auth.admin.deleteUser(u.id);
  }
  await admin.from("institutions").delete().in("id", [instA.id, instB.id]);

  console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("SCRIPT ERROR:", e.message);
  process.exit(1);
});