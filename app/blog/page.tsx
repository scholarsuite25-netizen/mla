import Link from "next/link";
import {
  getPublishedPosts,
  getPublishedPostsCount,
  getFeaturedPost,
  getCategoriesWithCounts,
  type PublishedPost,
} from "@/lib/blog";
import { BlogCard } from "@/components/blog-card";
import {
  Search,
  ArrowRight,
  Sparkles,
  Tag,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 12;

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

function FeaturedHero({ post }: { post: PublishedPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:border-cyan-400/60 hover:shadow-md transition-all"
    >
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-[220px] overflow-hidden bg-slate-100">
          {post.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-cyan-50/50">
              <BookOpen size={48} className="text-[#0284C7]/40" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
            <Sparkles size={11} /> Featured Dispatch
          </div>
          <span className="text-xs text-slate-500">
            {post.category} · {post.published_at ? new Date(post.published_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : ""}
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="line-clamp-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {post.excerpt || post.body.replace(/[#>*`\[\]()-]/g, "").slice(0, 220)}
          </p>
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0284C7]">
            Read the dispatch <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; tag?: string; page?: string }>;
}) {
  const { category = "all", search = "", tag = "", page: pageParam = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);

  const opts = {
    category: category !== "all" ? category : undefined,
    search: search || undefined,
    tag: tag || undefined,
  };
  const isHomeListing = category === "all" && !search && !tag;

  const [posts, featuredPost, categories, total] = await Promise.all([
    getPublishedPosts({ ...opts, limit: POSTS_PER_PAGE, page: currentPage }),
    isHomeListing && currentPage === 1 ? getFeaturedPost() : null,
    getCategoriesWithCounts(),
    getPublishedPostsCount(opts),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []))
  ).slice(0, 15);

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800">
      {/* Royal Navy Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] text-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#00D2FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-[#7C3AED]/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col items-start gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#00D2FF] uppercase">
              <Sparkles size={12} />
              <span>Academy Dispatches</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Intellect, Strategy &amp; Leadership.
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
              Peer-reviewed frameworks, executive mentorship insights, career blueprints, and dispatches from MLA fellows shaping Africa and global industry.
            </p>

            {/* Search & Filter Bar */}
            <div className="mt-4 w-full max-w-xl">
              <form method="GET" action="/blog" className="relative flex items-center">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search articles by title, topic, or keyword..."
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-24 text-xs sm:text-sm text-white placeholder-slate-400 backdrop-blur-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
                />
                {category !== "all" && (
                  <input type="hidden" name="category" value={category} />
                )}
                <button
                  type="submit"
                  className="absolute right-1.5 rounded-lg bg-[#00D2FF] px-4 py-2 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] transition"
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
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                category === "all" && !tag
                  ? "bg-[#00D2FF] text-[#0A0E2A] shadow-sm font-bold"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-cyan-400 hover:text-slate-900"
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
                      ? "bg-[#00D2FF] text-[#0A0E2A] shadow-sm font-bold"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-cyan-400 hover:text-slate-900"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isActive ? "bg-black/15 text-[#0A0E2A]" : "bg-slate-100 text-slate-500"
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
              className="shrink-0 text-xs text-[#0284C7] hover:underline"
            >
              Clear filters
            </Link>
          )}
        </div>

        {/* Active Filter Notice */}
        {(category !== "all" || search || tag) && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>Showing results for:</span>
            {category !== "all" && (
              <span className="rounded-lg bg-cyan-50 border border-cyan-200 px-2.5 py-1 text-[#0284C7] font-semibold">
                Category: {category}
              </span>
            )}
            {search && (
              <span className="rounded-lg bg-cyan-50 border border-cyan-200 px-2.5 py-1 text-[#0284C7] font-semibold">
                Search: &ldquo;{search}&rdquo;
              </span>
            )}
            {tag && (
              <span className="rounded-lg bg-cyan-50 border border-cyan-200 px-2.5 py-1 text-[#0284C7] font-semibold">
                Tag: #{tag}
              </span>
            )}
            <span>({posts.length} articles found)</span>
          </div>
        )}

        {/* Featured Hero */}
        {featuredPost && (
          <div className="mb-8">
            <FeaturedHero post={featuredPost} />
          </div>
        )}

        {/* Article Grid */}
        {posts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center space-y-4 shadow-sm">
            <BookOpen size={40} className="mx-auto text-slate-400" />
            <h3 className="font-display text-lg font-bold text-slate-900">
              No articles found
            </h3>
            <p className="mx-auto max-w-md text-xs text-slate-500">
              There are no published articles matching your current search or category filter. Check back soon or explore another topic!
            </p>
            <Link
              href="/blog"
              className="inline-block rounded-lg bg-[#00D2FF] px-5 py-2 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] transition"
            >
              Reset All Filters
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && posts.length > 0 && (
          <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Blog pagination">
            {currentPage > 1 ? (
              <Link
                href={{
                  pathname: "/blog",
                  query: {
                    ...(category !== "all" ? { category } : {}),
                    ...(search ? { search } : {}),
                    ...(tag ? { tag } : {}),
                    page: String(currentPage - 1),
                  },
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:border-cyan-400"
              >
                <ChevronLeft size={14} /> Previous
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-400">
                <ChevronLeft size={14} /> Previous
              </span>
            )}
            <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link
                href={{
                  pathname: "/blog",
                  query: {
                    ...(category !== "all" ? { category } : {}),
                    ...(search ? { search } : {}),
                    ...(tag ? { tag } : {}),
                    page: String(currentPage + 1),
                  },
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:border-cyan-400"
              >
                Next <ChevronRight size={14} />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-400">
                Next <ChevronRight size={14} />
              </span>
            )}
          </nav>
        )}

        {/* Popular Tags Discovery Cloud */}
        {allTags.length > 0 && (
          <section className="mt-14 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={16} className="text-[#0284C7]" />
              <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">
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
                      ? "border-cyan-500 bg-[#00D2FF] text-[#0A0E2A] font-bold"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-cyan-300 hover:text-slate-900"
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