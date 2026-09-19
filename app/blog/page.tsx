import Link from "next/link";
import {
  getPublishedPosts,
  getFeaturedPost,
  getCategoriesWithCounts,
} from "@/lib/blog";
import { BlogCard } from "@/components/blog-card";
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Star,
  Sparkles,
  Tag,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Academy Dispatches & Insights — MLA Blog",
  description:
    "Explore executive leadership essays, fellowship updates, strategic career blueprints, and mentorship methodologies from the Mentorship & Leadership Academy.",
  openGraph: {
    title: "Academy Dispatches & Insights — MLA Blog",
    description:
      "Explore executive leadership essays, fellowship updates, strategic career blueprints, and mentorship methodologies from the Mentorship & Leadership Academy.",
    type: "website",
  },
};

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; tag?: string }>;
}) {
  const { category = "all", search = "", tag = "" } = await searchParams;

  const [posts, featuredPost, categories] = await Promise.all([
    getPublishedPosts({
      category: category !== "all" ? category : undefined,
      search: search || undefined,
      tag: tag || undefined,
    }),
    category === "all" && !search && !tag ? getFeaturedPost() : null,
    getCategoriesWithCounts(),
  ]);

  // If featuredPost exists, exclude it from regular grid when on the default "all" view so it isn't duplicated
  const gridPosts =
    featuredPost && category === "all" && !search && !tag
      ? posts.filter((p) => p.id !== featuredPost.id)
      : posts;

  // Aggregate all unique tags from current posts for tag cloud
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []))
  ).slice(0, 15);

  const featuredReadTime = featuredPost
    ? Math.max(1, Math.ceil((featuredPost.body?.split(/\s+/).length || 0) / 200))
    : 0;

  const featuredDate = featuredPost?.published_at
    ? new Date(featuredPost.published_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#0E0A08] text-parchment selection:bg-gold/30 selection:text-white">
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#18110B] to-[#0E0A08] py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-50 pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold tracking-widest text-gold uppercase">
              <Sparkles size={13} />
              <span>Academy Dispatches</span>
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-parchment sm:text-5xl lg:text-6xl">
              Intellect, Strategy &amp; Leadership.
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-parchment/70 sm:text-base">
              Peer-reviewed frameworks, executive mentorship insights, career blueprints, and dispatches from MLA fellows shaping Africa and global industry.
            </p>

            {/* Search & Filter Bar */}
            <div className="mt-4 w-full max-w-xl">
              <form method="GET" action="/blog" className="relative flex items-center">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment/40"
                />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search articles by title, topic, or keyword..."
                  className="w-full rounded-2xl border border-white/15 bg-black/50 py-3.5 pl-11 pr-24 text-xs sm:text-sm text-parchment placeholder-parchment/40 backdrop-blur-md focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all"
                />
                {category !== "all" && (
                  <input type="hidden" name="category" value={category} />
                )}
                <button
                  type="submit"
                  className="absolute right-2 rounded-xl bg-gold px-4 py-2 text-xs font-bold text-midnight hover:brightness-110 transition"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Category Navigation Pills */}
        <div className="mb-10 flex items-center justify-between gap-4 border-b border-white/10 pb-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                category === "all" && !tag
                  ? "bg-gradient-to-r from-gold to-amber-500 text-midnight shadow-md font-bold"
                  : "bg-[#140E0A] text-parchment/70 border border-white/10 hover:border-gold/40 hover:text-parchment"
              }`}
            >
              <span>All Articles</span>
            </Link>

            {categories.map((cat) => {
              const isActive = category.toLowerCase() === cat.name.toLowerCase();
              return (
                <Link
                  key={cat.name}
                  href={`/blog?category=${encodeURIComponent(cat.name)}`}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-gold to-amber-500 text-midnight shadow-md font-bold"
                      : "bg-[#140E0A] text-parchment/70 border border-white/10 hover:border-gold/40 hover:text-parchment"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isActive ? "bg-black/20 text-midnight" : "bg-white/10 text-parchment/50"
                    }`}
                  >
                    {cat.count}
                  </span>
                </Link>
              );
            })}
          </div>

          {(category !== "all" || search || tag) && (
            <Link
              href="/blog"
              className="shrink-0 text-xs text-gold/80 hover:text-gold underline"
            >
              Clear filters
            </Link>
          )}
        </div>

        {/* Active Filter Notice */}
        {(category !== "all" || search || tag) && (
          <div className="mb-8 flex flex-wrap items-center gap-2 text-xs text-parchment/60">
            <span>Showing results for:</span>
            {category !== "all" && (
              <span className="rounded-lg bg-gold/15 border border-gold/30 px-2.5 py-1 text-gold font-semibold">
                Category: {category}
              </span>
            )}
            {search && (
              <span className="rounded-lg bg-gold/15 border border-gold/30 px-2.5 py-1 text-gold font-semibold">
                Search: &ldquo;{search}&rdquo;
              </span>
            )}
            {tag && (
              <span className="rounded-lg bg-gold/15 border border-gold/30 px-2.5 py-1 text-gold font-semibold">
                Tag: #{tag}
              </span>
            )}
            <span>({posts.length} articles found)</span>
          </div>
        )}

        {/* Featured Editorial Hero (Visible on Default "All" View) */}
        {featuredPost && (
          <div className="mb-14">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group relative block overflow-hidden rounded-3xl border border-gold/30 bg-[#140E0A] shadow-2xl transition-all duration-300 hover:border-gold/60 hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)]"
            >
              <div className="grid lg:grid-cols-12 h-auto lg:h-72">
                {/* Hero Media */}
                <div className="relative aspect-video lg:aspect-auto lg:col-span-6 overflow-hidden bg-black/50">
                  {featuredPost.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featuredPost.cover_image_url}
                      alt={featuredPost.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2D1F13] to-[#120D09] p-8">
                      <BookOpen size={48} className="text-gold/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140E0A] via-transparent to-transparent lg:hidden" />
                </div>

                {/* Hero Content */}
                <div className="flex flex-col justify-between p-6 lg:col-span-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 border border-gold/40 px-3 py-0.5 text-xs font-bold text-gold">
                        <Star size={12} /> Featured Dispatch
                      </span>
                      <span className="text-xs text-gold/80 font-semibold uppercase tracking-wider">
                        {featuredPost.category || "Leadership"}
                      </span>
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-parchment group-hover:text-gold transition-colors line-clamp-2">
                      {featuredPost.title}
                    </h2>

                    <p className="text-xs sm:text-sm leading-relaxed text-parchment/70 line-clamp-3">
                      {featuredPost.excerpt ||
                        featuredPost.body.replace(/[#*`_~[\]]/g, "").slice(0, 180) + "..."}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                    <div className="flex items-center gap-3 text-parchment/50">
                      {featuredDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={13} className="text-gold" />
                          <span>{featuredDate}</span>
                        </div>
                      )}
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-gold" />
                        <span>{featuredReadTime} min read</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 font-bold text-gold group-hover:translate-x-1 transition-transform">
                      Read Story <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Article Grid */}
        {gridPosts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {gridPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#120D09] p-12 text-center space-y-4">
            <BookOpen size={40} className="mx-auto text-gold/50" />
            <h3 className="font-display text-xl font-bold text-parchment">
              No articles found
            </h3>
            <p className="mx-auto max-w-md text-xs text-parchment/60">
              There are no published articles matching your current search or category filter. Check back soon or explore another topic!
            </p>
            <Link
              href="/blog"
              className="inline-block rounded-xl bg-gold px-5 py-2 text-xs font-bold text-midnight hover:brightness-110 transition"
            >
              Reset All Filters
            </Link>
          </div>
        )}

        {/* Popular Tags Discovery Cloud */}
        {allTags.length > 0 && (
          <section className="mt-16 rounded-3xl border border-white/10 bg-[#120D09]/60 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={16} className="text-gold" />
              <h3 className="font-display text-base font-bold text-parchment">
                Explore by Topic &amp; Tags
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <Link
                  key={t}
                  href={`/blog?tag=${encodeURIComponent(t)}`}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                    tag.toLowerCase() === t.toLowerCase()
                      ? "border-gold bg-gold text-midnight font-bold"
                      : "border-white/10 bg-black/30 text-parchment/70 hover:border-gold/40 hover:text-gold"
                  }`}
                >
                  #{t}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}