/**
 * Phase 4 — Events RLS verification.
 * Run: node scripts/test-events-rls.mjs
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(URL, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(URL, ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let failures = 0;
let step = 0;

function check(name, ok, extra = "") {
  step++;
  if (ok) {
    console.log(`PASS: ${name}`);
  } else {
    failures++;
    console.log(`FAIL: ${name} ${extra}`);
  }
}

async function signInAs(email) {
  const { data } = await anon.auth.signInWithPassword({
    email,
    password: "TestPass123!",
  });
  return createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
  });
}

async function makeUser(email, role, institutionId) {
  const { data } = await admin.auth.admin.createUser({
    email,
    password: "TestPass123!",
    email_confirm: true,
  });
  const { error } = await admin.from("profiles").update({ role, institution_id: institutionId }).eq("id", data.user.id);
  if (error) throw new Error(`profile update failed: ${error.message}`);
  return data.user.id;
}

async function cleanup(ids) {
  for (const id of ids) {
    await admin.auth.admin.deleteUser(id).catch(() => {});
  }
}

async function main() {
  const ts = Date.now();
  const instA = (await admin.from("institutions").insert({ name: `EV Inst A ${ts}` }).select("id").single()).data;
  const instB = (await admin.from("institutions").insert({ name: `EV Inst B ${ts}` }).select("id").single()).data;
  const superU = await makeUser(`super-events-${ts}@test.local`, "super_admin", null);
  const instAdminA = await makeUser(`insta-events-${ts}@test.local`, "institution_admin", instA.id);
  const instAdminB = await makeUser(`instb-events-${ts}@test.local`, "institution_admin", instB.id);
  const member = await makeUser(`member-events-${ts}@test.local`, "member", instA.id);

  const cSuper = await signInAs(`super-events-${ts}@test.local`);
  const cInstA = await signInAs(`insta-events-${ts}@test.local`);
  const cInstB = await signInAs(`instb-events-${ts}@test.local`);
  const cMember = await signInAs(`member-events-${ts}@test.local`);

  try {
    // -- platform event by super admin ---------------------------------
    const { data: plat, error: ePlat } = await cSuper
      .from("events")
      .insert({ title: `Platform ${ts}`, description: "all", start_time: "2027-01-01T10:00:00Z", institution_id: null, created_by: superU })
      .select("id");
    check("super admin creates platform-wide event", !ePlat, ePlat?.message);
    if (plat?.length === 0) return;

    // -- institution event by its admin --------------------------------
    const { error: eInst } = await cInstA.from("events").insert({ title: `Scoped ${ts}`, start_time: "2027-01-02T10:00:00Z", institution_id: instA.id, created_by: instAdminA });
    check("institution admin creates event for own institution", !eInst, eInst?.message);

    // -- cross-institution insert blocked ------------------------------
    const { error: eCross } = await cInstA.from("events").insert({ title: `Foreign ${ts}`, start_time: "2027-01-03T10:00:00Z", institution_id: instB.id, created_by: instAdminA });
    check("institution admin cannot create event for another institution", !!eCross, "should be blocked");

    // -- member cannot create ------------------------------------------
    const { error: eMemberCreate } = await cMember.from("events").insert({ title: `Member ${ts}`, start_time: "2027-01-04T10:00:00Z", institution_id: instA.id, created_by: member });
    check("plain member cannot create events", !!eMemberCreate, "should be blocked");

    // -- public visibility ---------------------------------------------
    const { data: pub, error: ePub } = await anon.from("events").select("id,title");
    const pubTitles = pub?.map(p => p.title) ?? [];
    check("anon sees events (public select)", !ePub && pubTitles.some(t => t.includes(`Platform ${ts}`)), JSON.stringify({ePub: ePub?.message, n: pub?.length}));

    // -- RSVP as member, then verify -----------------------------------
    const { error: eRsvp } = await cMember.from("event_rsvps").insert({ event_id: plat[0].id, profile_id: member, rsvp_status: "going" });
    check("member RSVPs to event", !eRsvp, eRsvp?.message);

    const { data: myRsvps } = await cMember.from("event_rsvps").select("event_id");
    check("member sees own RSVPs", (myRsvps ?? []).some(r => r.event_id === plat[0].id));

    // -- another member cannot see first member's RSVP -------------------
    const member2 = await makeUser(`member2-events-${ts}@test.local`, "member", instA.id);
    const cMember2 = await signInAs(`member2-events-${ts}@test.local`);
    const { data: otherRsvps } = await cMember2.from("event_rsvps").select("event_id");
    check("another member cannot see other RSVPs", !(otherRsvps ?? []).some(r => r.event_id === plat[0].id));
    await cleanup([member2]);

    // -- event creator sees attendees ------------------------------------
    const { data: attendeeList } = await cSuper.from("event_rsvps").select("profile_id");
    check("event creator sees attendee list", (attendeeList ?? []).some(r => r.profile_id === member));

    // -- non-creator inst admin cannot see RSVP list ----------------------
    const { data: instBList } = await cInstB.from("event_rsvps").select("profile_id").eq("event_id", plat[0].id);
    check("non-creator admin cannot see RSVPs", (instBList ?? []).length === 0);

    // -- duplicate RSVP prevented -----------------------------------------
    const { error: eDup } = await cMember.from("event_rsvps").insert({ event_id: plat[0].id, profile_id: member, rsvp_status: "going" });
    check("duplicate RSVP blocked by unique constraint", !!eDup, "should fail on unique");

    // -- member can delete own RSVP ---------------------------------------
    const { error: eDel } = await cMember.from("event_rsvps").delete().eq("event_id", plat[0].id).eq("profile_id", member);
    check("member can delete own RSVP", !eDel, eDel?.message);

    const { data: afterDel } = await cSuper.from("event_rsvps").select("profile_id").eq("event_id", plat[0].id);
    check("attendee list empty after deletion", (afterDel ?? []).length === 0);
  } finally {
    await cleanup([superU, instAdminA, instAdminB, member]);
    try {
      await admin.from("institutions").delete().in("id", [instA.id, instB.id]);
    } catch {}
  }

  console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("FATAL", e.message);
  process.exit(1);
});