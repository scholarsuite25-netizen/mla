import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Copies every file in every Supabase Storage bucket into a Cloudflare R2
// bucket. Scheduled nightly by a Vercel Cron -> app/api/cron/backup.
// Run locally with: node scripts/r2-backup.mjs
// Requires: SUPABASE_SERVICE_ROLE_KEY + all CLOUDFLARE_R2_* vars.

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? "mla-backups";

async function main() {
  if (
    !process.env.CLOUDFLARE_R2_ENDPOINT ||
    !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
    !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  ) {
    console.error("R2 backup skipped: missing CLOUDFLARE_R2_* env vars.");
    process.exit(0);
  }

  const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
  });

  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (!buckets) {
    console.log("No storage buckets to back up.");
    return;
  }

  let total = 0;
  for (const bucket of buckets) {
    let cursor;
    let n = 0;
    do {
      const { data } = await supabase.storage.from(bucket.name).listV2({
        prefix: "",
        limit: 1000,
        cursor,
      });
      if (!data) break;

      for (const file of data.objects) {
        const key = file.key ?? file.name;
        const { data: blob, error: dlError } = await supabase.storage
          .from(bucket.name)
          .download(key);
        if (dlError) {
          console.error(`  download failed: ${bucket.name}/${key}`, dlError.message);
          continue;
        }
        await r2.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: `${bucket.name}/${key}`,
            Body: new Uint8Array(await blob.arrayBuffer()),
          })
        );
        n++;
      }
      cursor = data.hasNext ? data.nextCursor : undefined;
    } while (cursor);

    console.log(`[${bucket.name}] copied ${n} file(s)`);
    total += n;
  }
  console.log(`R2 backup complete: ${total} file(s) this run.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});