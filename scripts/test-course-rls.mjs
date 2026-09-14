// Phase 2 RLS test: enrollment requires a published course, module progress
// requires enrollment, and members never see each other's rows.
// Throwaway users are cleaned up at the end.
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

async function main() {
  // 1. Two institutions.
  const { data: instA } = await admin
    .from("institutions")
    .insert({ name: `RLS Test Inst A ${Date.now()}` })
    .select("id")
    .single();
  const { data: instB } = await admin
    .from("institutions")
    .insert({ name: `RLS Test Inst B ${Date.now()}` })
    .select("id")
    .single();

  // 2. A published course with one module, and a draft course.
  const { data: pubCourse } = await admin
    .from("courses")
    .insert({ title: "RLS Published Course", description: "desc", status: "published", published_at: new Date().toISOString() })
    .select("id")
    .single();
  const { data: mod } = await admin
    .from("course_modules")
    .insert({ course_id: pubCourse.id, title: "Module 1", content: "hi", order_index: 0 })
    .select("id")
    .single();
  const { data: draftCourse } = await admin
    .from("courses")
    .insert({ title: "RLS Draft Course", description: "desc", status: "draft" })
    .select("id")
    .single();

  // 3. Two users, one per institution.
  const mkUser = async (email, instId) => {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: "TestPass123!",
      email_confirm: true,
      user_metadata: { institution_id: instId },
    });
    if (error) throw new Error(`${email}: ${error.message}`);
    const { error: upErr } = await admin
      .from("profiles")
      .update({ institution_id: instId, full_name: email.split("@")[0] })
      .eq("id", data.user.id);
    if (upErr) throw new Error(`profiles update ${email}: ${upErr.message}`);
    return data.user.id;
  };

  const uA = await mkUser(`rls-a-${Date.now()}@test.local`, instA.id);
  const uB = await mkUser(`rls-b-${Date.now()}@test.local`, instB.id);

  const authA = async () => {
    const { data, error } = await anon.auth.signInWithPassword({
      email: (await admin.auth.admin.getUserById(uA)).data.user.email,
      password: "TestPass123!",
    });
    if (error) throw new Error(`signin A: ${error.message}`);
    return data.session.access_token;
  };
  const authB = async () => {
    const { data, error } = await anon.auth.signInWithPassword({
      email: (await admin.auth.admin.getUserById(uB)).data.user.email,
      password: "TestPass123!",
    });
    if (error) throw new Error(`signin B: ${error.message}`);
    return data.session.access_token;
  };

  const clientA = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${await authA()}` } },
  });
  const clientB = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${await authB()}` } },
  });

  // 4. A enrolls into the published course -> allowed.
  const { error: enrError } = await clientA
    .from("course_enrollments")
    .insert({ course_id: pubCourse.id, profile_id: uA });
  check("member A enrolls in published course", !enrError, enrError?.message ?? "");

  // 5. A marks the module complete -> allowed.
  const { error: progError } = await clientA
    .from("course_module_progress")
    .insert({ course_module_id: mod.id, profile_id: uA });
  check("member A marks module complete", !progError, progError?.message ?? "");

  // 6. B (not enrolled) marks the same module -> MUST FAIL.
  const { error: crossProgress } = await clientB
    .from("course_module_progress")
    .insert({ course_module_id: mod.id, profile_id: uB });
  check("un-enrolled B cannot mark module complete (RLS)", !!crossProgress);

  // 7. B enrolls in a DRAFT course -> MUST FAIL.
  const { error: draftEnroll } = await clientB
    .from("course_enrollments")
    .insert({ course_id: draftCourse.id, profile_id: uB });
  check("B cannot enroll in a draft course (RLS)", !!draftEnroll);

  // 8. B lists enrollments of the platform -> sees only own (none), not A's.
  const { data: bEnrollments } = await clientB
    .from("course_enrollments")
    .select("profile_id");
  const seesOthers = (bEnrollments ?? []).some((e) => e.profile_id !== uB);
  check("B does not see A's enrollments", !seesOthers);

  // 9. B attempts to delete A's module progress -> MUST FAIL.
  // RLS deletes block silently (0 rows affected, no error), so confirm
  // the row survives B's attempt.
  const { data: aProgressIdArr } = await admin
    .from("course_module_progress")
    .select("id")
    .eq("profile_id", uA);
  const aProgressId = aProgressIdArr?.[0]?.id;
  await clientB.from("course_module_progress").delete().eq("id", aProgressId);
  const { data: survivor } = await admin
    .from("course_module_progress")
    .select("id")
    .eq("id", aProgressId);
  check("B cannot delete A's progress (RLS)", (survivor ?? []).length === 1);

  // 10. B cannot enroll into A's... (cross-institution: B reading A-owned row fetch returns none)

  // Cleanup.
  for (const id of [uA, uB]) {
    await admin.auth.admin.deleteUser(id);
  }
  await admin.from("institutions").delete().in("id", [instA.id, instB.id]);

  console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("SCRIPT ERROR:", e.message);
  process.exit(1);
});