import { createAdminClient } from "@/lib/supabase/admin";
import { BlogPostsManager, BlogPostItem } from "@/components/admin/blog-posts-manager";

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

  return <BlogPostsManager initialPosts={(posts as BlogPostItem[]) || []} />;
}