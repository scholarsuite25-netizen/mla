import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const seedEmail = process.env.SUPER_ADMIN_SEED_EMAIL;

if (!url || !serviceRole || !seedEmail) {
  console.error("Missing required env variables");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const targetEmail = seedEmail.toLowerCase();
  
  // Find existing user
  let users = [];
  let page = 0;
  for (;;) {
    const { data: { users: pageUsers }, error } = await supabase.auth.admin.listUsers({ page: page + 1, perPage: 1000 });
    if (error) throw error;
    users = users.concat(pageUsers);
    if (pageUsers.length < 1000) break;
    page++;
  }

  const target = users.find((u) => u.email?.toLowerCase() === targetEmail);

  if (!target) {
    console.error(`User ${targetEmail} not found. Please run npm run seed:super-admin first.`);
    return;
  }

  const newPassword = "MLA@26#";
  const { error } = await supabase.auth.admin.updateUserById(target.id, {
    password: newPassword
  });

  if (error) {
    console.error("Failed to update password:", error);
    return;
  }

  console.log("\n==================================================");
  console.log("SUCCESS! Your super admin credentials are:");
  console.log("Email:    " + targetEmail);
  console.log("Password: " + newPassword);
  console.log("==================================================\n");
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
