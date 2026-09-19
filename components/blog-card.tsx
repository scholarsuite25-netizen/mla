import Link from "next/link";
import { type PublishedPost } from "@/lib/blog";
import { Calendar, Clock, ArrowUpRight, Hash } from "lucide-react";

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
      className="glass-card group flex flex-col justify-between overflow-hidden rounded-xl border border-white/[0.08] bg-[#120D09]/80 backdrop-blur-xl transition-all duration-300 hover:border-gold/40 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(0,0,0,0.7)]"
    >
      <div>
        {/* Cover Image Container */}
        <div className="relative h-32 w-full overflow-hidden bg-black/40">
          {post.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-end bg-gradient-to-br from-[#261D16] to-[#120E0B] p-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold/60">
                MLA Academy Dispatch
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#100C09] via-transparent to-transparent opacity-80" />

          {/* Category Pill Over Cover */}
          <div className="absolute top-3 left-3">
            <span className="inline-block rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold tracking-wide text-gold border border-gold/30">
              {post.category || "Leadership"}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <div className="flex items-center gap-3 text-[10px] text-parchment/50 mb-2">
            {date && (
              <div className="flex items-center gap-1">
                <Calendar size={11} className="text-gold" />
                <span>{date}</span>
              </div>
            )}
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1">
              <Clock size={11} className="text-gold" />
              <span>{readTime} min read</span>
            </div>
          </div>

          <h3 className="font-display text-base font-bold leading-snug text-parchment transition-colors group-hover:text-gold line-clamp-2">
            {post.title}
          </h3>

          {post.excerpt ? (
            <p className="mt-1.5 text-[11px] leading-relaxed text-parchment/65 line-clamp-2">
              {post.excerpt}
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] leading-relaxed text-parchment/50 line-clamp-2">
              {post.body.replace(/[#*`_~[\]]/g, "").slice(0, 80)}...
            </p>
          )}

          {/* Tag Badges */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-0.5 rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-parchment/60 font-medium"
                >
                  <Hash size={9} className="text-gold/70" />
                  {t}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-[10px] text-parchment/40 self-center">
                  +{post.tags.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-[11px] font-semibold text-gold">
        <span>Read article</span>
        <ArrowUpRight
          size={13}
          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </Link>
  );
}