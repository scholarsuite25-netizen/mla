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

  const wordCount = post.body ? post.body.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/40 shadow-lg border border-white/5">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-end bg-gradient-to-br from-[#261D16] to-[#120E0B] p-5 transition-transform duration-500 group-hover:scale-105">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold/60">
              MLA Academy Dispatch
            </span>
          </div>
        )}

        {/* Category Pill Over Cover */}
        <div className="absolute top-3 left-3">
          <span className="inline-block rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold tracking-wide text-gold border border-gold/30">
            {post.category || "Leadership"}
          </span>
        </div>
      </div>

      {/* Card Body (No Padding, Flush with Image) */}
      <div className="flex flex-col gap-1.5 mt-1 px-1">
        {/* Metadata */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-parchment/50">
          {date && <span>{date}</span>}
          {date && <span>•</span>}
          <span>{readTime} min read</span>
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold leading-snug text-parchment transition-colors group-hover:text-gold line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-[12px] leading-relaxed text-parchment/65 line-clamp-2 mt-0.5">
          {post.excerpt ? post.excerpt : post.body.replace(/[#*`_~[\]]/g, "").slice(0, 90) + "..."}
        </p>

        {/* Author Footer (No 'Read Article' Button) */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 border border-gold/30 text-gold font-display text-[9px] font-bold">
            M
          </div>
          <span className="text-[11px] font-semibold text-parchment/70">
            MLA Editorial
          </span>
        </div>
      </div>
    </Link>
  );
}