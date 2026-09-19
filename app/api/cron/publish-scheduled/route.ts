import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { notifyAndBroadcast } from "@/lib/publish";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function createAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Vercel Cron (see vercel.json). Publishes any scheduled blog post whose
// published_at has arrived. Guarded by CRON_SECRET like the backup cron.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdmin();
    const now = new Date().toISOString();

    const { data: due, error } = await admin
      .from("blog_posts")
      .select("id,title,slug,status,published_at")
      .eq("status", "draft")
      .not("published_at", "is", null)
      .lte("published_at", now)
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let published = 0;
    for (const post of due ?? []) {
      const { error: pubError } = await admin
        .from("blog_posts")
        .update({ status: "published" })
        .eq("id", post.id);
      if (pubError) continue;

      await notifyAndBroadcast({
        targetType: "blog",
        targetId: post.id,
        message: `New blog post: ${post.title}`,
        title: post.title,
        path: `/blog/${post.slug}`,
      });

      await admin.from("audit_log").insert({
        actor_id: null,
        action: "blog.publish_scheduled",
        target_table: "blog_posts",
        target_id: post.id,
      });
      published++;
    }

    return NextResponse.json({ ok: true, published });
  } catch (err) {
    console.error("Scheduled publish failed:", err);
    return NextResponse.json({ error: "Scheduled publish failed" }, { status: 500 });
  }
}