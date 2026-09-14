// Creates the storage buckets Phase 1+ needs.
// Usage: node scripts/init-buckets.mjs
//  - covers: public (blog/product cover images)
//  - course-files: PRIVATE (course materials; served via signed URLs)
//  - product-files: PRIVATE (paid downloads; never publicly listable)
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const buckets = [
  { name: "covers", public: true },
  { name: "course-files", public: false },
  { name: "product-files", public: false },
];

for (const bucket of buckets) {
  const { data: existing } = await supabase.storage.getBucket(bucket.name);
  if (existing) {
    console.log(`exists:   ${bucket.name} (${existing.public ? "public" : "private"})`);
    continue;
  }
  const { error } = await supabase.storage.createBucket(bucket.name, {
    public: bucket.public,
  });
  if (error) {
    console.error(`error:    ${bucket.name} -> ${error.message}`);
    process.exitCode = 1;
  } else {
    console.log(`created:  ${bucket.name} (${bucket.public ? "public" : "private"})`);
  }
}

console.log("Bucket check complete.");