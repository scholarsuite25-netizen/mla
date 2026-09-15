import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: post, error } = await admin
    .from("blog_posts")
    .select(
      "id,title,slug,body,cover_image_url,status,category,tags,excerpt,seo_title,seo_description,allow_comments,featured,published_at"
    )
    .eq("id", id)
    .single();
  if (error || !post) notFound();

  return (
    <div>
      <PostForm post={post} />
    </div>
  );
}