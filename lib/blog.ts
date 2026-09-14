import { createClient } from "@/lib/supabase/server";

export type PublishedPost = {
  id: string;
  title: string;
  slug: string;
  body: string;
  cover_image_url: string | null;
  published_at: string | null;
};

const POST_SELECT = "id,title,slug,body,cover_image_url,published_at";

export async function getPublishedPosts(limit = 50): Promise<PublishedPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPostBySlug(slug: string): Promise<PublishedPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error) return null;
  return data;
}

export async function getInstitutionCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("institutions")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function getMentorCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("mentor_profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);
  return count ?? 0;
}