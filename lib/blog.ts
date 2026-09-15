import { createClient } from "@/lib/supabase/server";

export type PublishedPost = {
  id: string;
  title: string;
  slug: string;
  body: string;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  allow_comments: boolean;
  featured: boolean;
  published_at: string | null;
  updated_at: string;
};

export type BlogComment = {
  id: string;
  post_id: string;
  author_name: string;
  author_email?: string;
  author_id: string | null;
  content: string;
  status: string;
  created_at: string;
};

const POST_SELECT =
  "id,title,slug,body,cover_image_url,category,tags,excerpt,seo_title,seo_description,allow_comments,featured,published_at,updated_at";

export async function getPublishedPosts(
  optionsOrLimit?:
    | number
    | {
        category?: string;
        tag?: string;
        search?: string;
        limit?: number;
      }
): Promise<PublishedPost[]> {
  const supabase = await createClient();

  const options =
    typeof optionsOrLimit === "number"
      ? { limit: optionsOrLimit }
      : optionsOrLimit;

  const limit = options?.limit ?? 50;

  let query = supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (options?.category && options.category !== "all") {
    query = query.ilike("category", options.category);
  }

  if (options?.tag) {
    query = query.contains("tags", [options.tag]);
  }

  if (options?.search) {
    const term = options.search.trim();
    query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,body.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return (data as PublishedPost[]) ?? [];
}

export async function getFeaturedPost(): Promise<PublishedPost | null> {
  const supabase = await createClient();
  const { data: featured } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (featured) return featured as PublishedPost;

  const { data: latest } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (latest as PublishedPost) ?? null;
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
  return data as PublishedPost;
}

export async function getRelatedPosts(
  category: string,
  excludeSlug: string,
  limit = 3
): Promise<PublishedPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .eq("category", category)
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (data && data.length > 0) return data as PublishedPost[];

  const { data: fallback } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (fallback as PublishedPost[]) ?? [];
}

export async function getCategoriesWithCounts(): Promise<{ name: string; count: number }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("category")
    .eq("status", "published");

  const counts: Record<string, number> = {};
  if (data) {
    for (const item of data) {
      const cat = item.category || "Leadership & Governance";
      counts[cat] = (counts[cat] || 0) + 1;
    }
  }

  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

export async function getPostComments(postId: string): Promise<BlogComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_comments")
    .select("id,post_id,author_name,content,status,created_at,author_id")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
  return (data as BlogComment[]) ?? [];
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