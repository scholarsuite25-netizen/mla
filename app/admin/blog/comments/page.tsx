import { createAdminClient } from "@/lib/supabase/admin";
import { BlogCommentsManager, BlogCommentRow } from "@/components/admin/blog-comments-manager";

export const dynamic = "force-dynamic";

export default async function AdminBlogCommentsPage() {
  const admin = createAdminClient();
  const { data: comments, error } = await admin
    .from("blog_comments")
    .select("id,post_id,posts:blog_posts(title,slug),author_name,author_email,content,status,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return <p className="text-crest-red">{error.message}</p>;
  }

  return <BlogCommentsManager initialComments={(comments as BlogCommentRow[]) || []} />;
}