import { getPublishedPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog-card";

export const metadata = { title: "Blog — MLA" };

export default async function BlogIndex() {
  const posts = await getPublishedPosts(50);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Blog</p>
      <h1 className="mt-3 font-display text-4xl text-parchment">
        Notes from the academy
      </h1>
      {posts.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-parchment/60">
          Nothing published yet — the first post is on its way.
        </p>
      )}
    </div>
  );
}