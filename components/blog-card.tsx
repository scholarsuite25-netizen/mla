import Link from "next/link";
import { type PublishedPost } from "@/lib/blog";

export function BlogCard({ post }: { post: PublishedPost }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-md border border-parchment/10 bg-panel p-6 transition-colors hover:border-gold/60"
    >
      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt=""
          className="mb-4 aspect-[16/9] w-full rounded-sm object-cover"
        />
      )}
      <p className="text-xs uppercase tracking-widest text-gold">{date}</p>
      <h3 className="mt-2 font-display text-xl text-parchment group-hover:text-gold">
        {post.title}
      </h3>
    </Link>
  );
}