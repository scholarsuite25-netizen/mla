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
      className="card-biru group flex flex-col overflow-hidden p-4 transition-all duration-300"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-end bg-gradient-to-br from-[#161152] to-[#2B1B8A] p-5 transition-transform duration-500 group-hover:scale-105">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              MLA Academy Dispatch
            </span>
          </div>
        )}

        {/* Category Pill Over Cover */}
        <div className="absolute top-3 left-3">
          <span className="inline-block rounded-md bg-[#161152]/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold tracking-wide text-cyan-300 border border-white/15">
            {post.category || "Leadership"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-1.5 mt-3 px-1 flex-1 justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            {date && <span>{date}</span>}
            {date && <span>•</span>}
            <span>{readTime} min read</span>
          </div>

          {/* Title */}
          <h3 className="font-display text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 line-clamp-2 mt-1">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-[12px] leading-relaxed text-slate-500 line-clamp-2 mt-1">
            {post.excerpt ? post.excerpt : post.body.replace(/[#*`_~[\]]/g, "").slice(0, 90) + "..."}
          </p>
        </div>

        {/* Author Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 font-display text-[10px] font-bold">
            M
          </div>
          <span className="text-[11px] font-semibold text-slate-600">
            MLA Editorial
          </span>
        </div>
      </div>
    </Link>
  );
}