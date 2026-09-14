import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Vercel Cron calls this nightly (see vercel.json).
// Guarded by CRON_SECRET; safe to enable only after R2 is configured.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const r2Bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const r2Endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const r2Key = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const r2Secret = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!r2Bucket || !r2Endpoint || !r2Key || !r2Secret) {
    return NextResponse.json(
      { error: "R2 not configured. Skipping backup." },
      { status: 200 }
    );
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const r2 = new S3Client({
    region: "auto",
    endpoint: r2Endpoint,
    credentials: { accessKeyId: r2Key, secretAccessKey: r2Secret },
  });

  const copy = async () => {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets) return 0;
    let total = 0;

    for (const bucket of buckets) {
      let cursor: string | undefined;
      do {
        const { data } = await supabase.storage.from(bucket.name).listV2({
          prefix: "",
          limit: 1000,
          cursor,
        });
        if (!data) break;

        for (const file of data.objects) {
          const { data: blob } = await supabase.storage
            .from(bucket.name)
            .download(file.key ?? file.name);
          if (!blob) continue;
          await r2.send(
            new PutObjectCommand({
              Bucket: r2Bucket,
              Key: `${bucket.name}/${file.key ?? file.name}`,
              Body: new Uint8Array(await blob.arrayBuffer()),
            })
          );
          total++;
        }

        cursor = data.hasNext ? data.nextCursor : undefined;
      } while (cursor);
    }
    return total;
  };

  try {
    const total = await copy();
    return NextResponse.json({ ok: true, filesCopied: total });
  } catch (err) {
    console.error("R2 backup failed:", err);
    return NextResponse.json({ error: "R2 backup failed" }, { status: 500 });
  }
}