import Link from "next/link";
import { type PublishedPost } from "@/lib/blog";
import { Calendar, ArrowUpRight } from "lucide-react";

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
      className="glass-card group flex flex-col justify-between overflow-hidden rounded-xl border border-white/[0.08] transition-all duration-300 hover:border-gold/30 hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
    >
      <div>
        {post.cover_image_url ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image_url}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#100C09] via-transparent to-transparent opacity-80" />
          </div>
        ) : (
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#261D16] to-[#120E0B] p-6 flex items-end">
            <span className="text-xs font-semibold text-gold/60 uppercase tracking-widest">Article</span>
          </div>
        )}

        <div className="p-5">
          {date && (
            <div className="flex items-center gap-1.5 text-xs text-parchment/50">
              <Calendar size={12} className="text-gold" />
              <span>{date}</span>
            </div>
          )}
          <h3 className="mt-2.5 font-display text-lg font-bold leading-snug text-parchment transition-colors group-hover:text-gold">
            {post.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 text-xs font-medium text-gold">
        <span>Read article</span>
        <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}