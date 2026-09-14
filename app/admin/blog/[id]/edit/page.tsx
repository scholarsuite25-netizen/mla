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
    .select("id,title,slug,body,cover_image_url,status")
    .eq("id", id)
    .single();
  if (error || !post) notFound();

  return (
    <div>
      <h2 className="font-display text-2xl text-parchment">Edit post</h2>
      <PostForm post={post} />
    </div>
  );
}