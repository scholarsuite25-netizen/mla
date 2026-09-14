// Promotes the Super Admin. Creates the auth user too if it doesn't exist.
// Usage: npm run seed:super-admin
// Prints a generated password ONCE if it created a user — copy it now.
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const seedEmail = process.env.SUPER_ADMIN_SEED_EMAIL;

if (!url || !serviceRole || !seedEmail) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPER_ADMIN_SEED_EMAIL in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const targetEmail = seedEmail.toLowerCase();

async function main() {
  // 1. find existing user (paginated)
  let users = [];
  let page = 0;
  for (;;) {
    const {
      data: { users: pageUsers },
      error,
    } = await supabase.auth.admin.listUsers({ page: page + 1, perPage: 1000 });
    if (error) throw error;
    users = users.concat(pageUsers);
    if (pageUsers.length < 1000) break;
    page++;
  }

  let target = users.find((u) => u.email?.toLowerCase() === targetEmail);

  // 2. create the user if missing
  let generatedPassword;
  if (!target) {
    generatedPassword = randomBytes(12).toString("base64url");
    const { data, error } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: { full_name: "Super Admin" },
    });
    if (error) throw error;
    target = data.user;
    console.log("Created new auth user.");
  }

  // 3. upsert profile as super_admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .update({ role: "super_admin", full_name: "Super Admin" })
    .eq("id", target.id)
    .select()
    .single();

  if (profileError) {
    // profile row may not exist yet if user was just created (trigger lag) — retry once
    if (profileError.code === "PGRST116") {
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: target.id,
        full_name: "Super Admin",
        role: "super_admin",
      });
      if (upsertError) throw upsertError;
    } else {
      throw profileError;
    }
  }

  console.log(`Super Admin ready: ${targetEmail} (${target.id})`);
  if (generatedPassword) {
    console.log("\n==================================================");
    console.log("LOGIN PASSWORD (save it now, change after first login):");
    console.log(generatedPassword);
    console.log("==================================================");
  } else {
    console.log("User already existed; role set to super_admin.");
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});