import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PublishButton, DeleteButton } from "@/components/admin/post-actions";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const admin = createAdminClient();
  const { data: posts, error } = await admin
    .from("blog_posts")
    .select("id,title,slug,status,published_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return <p className="text-crest-red">{error.message}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-parchment">Blog posts</h2>
        <Link
          href="/admin/blog/new"
          className="rounded-sm bg-crest-red px-4 py-2 text-sm font-medium text-white hover:bg-crest-red/90"
        >
          New post
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {posts?.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between gap-4 rounded-md border border-parchment/10 bg-panel p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-display text-lg text-parchment">
                {post.title}
              </p>
              <p className="mt-1 text-xs text-parchment/50">
                {post.slug} ·{" "}
                <span className={post.status === "published" ? "text-gold" : "text-parchment/40"}>
                  {post.status}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/blog/${post.id}/edit`}
                className="rounded-sm border border-parchment/20 px-3 py-1.5 text-xs text-parchment/80 hover:border-gold/60 hover:text-gold"
              >
                Edit
              </Link>
              {post.status === "draft" ? (
                <PublishButton postId={post.id} />
              ) : (
                <span className="text-xs text-gold">Live</span>
              )}
              <DeleteButton postId={post.id} />
            </div>
          </div>
        ))}
        {(!posts || posts.length === 0) && (
          <p className="text-parchment/60">No posts yet. Write your first one.</p>
        )}
      </div>
    </div>
  );
}