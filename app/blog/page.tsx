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

  // Aggregate all unique tags from current posts for tag cloud
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []))
  ).slice(0, 15);

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

        {/* Article Grid */}
        {posts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8">
            {posts.map((post) => (
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