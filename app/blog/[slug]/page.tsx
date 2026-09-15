import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getPostBySlug,
  getRelatedPosts,
  getPostComments,
} from "@/lib/blog";
import { Markdown } from "@/components/markdown";
import { BlogCard } from "@/components/blog-card";
import { CommentSection } from "@/components/blog/comment-section";
import { ShareButtons } from "@/components/blog/share-buttons";
import {
  Calendar,
  Clock,
  ChevronRight,
  Hash,
  MessageSquare,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Article Not Found — MLA" };
  }

  const title = post.seo_title || `${post.title} — MLA Academy Dispatch`;
  const description =
    post.seo_description ||
    post.excerpt ||
    post.body.replace(/[#*`_~[\]]/g, "").slice(0, 155);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mla.org.ng";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title,
      description,
      url: postUrl,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      images: post.cover_image_url
        ? [{ url: post.cover_image_url, width: 1200, height: 630, alt: post.title }]
        : undefined,
      siteName: "Mentorship & Leadership Academy",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [relatedPosts, comments] = await Promise.all([
    getRelatedPosts(post.category || "Leadership", post.slug, 3),
    getPostComments(post.id),
  ]);

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const wordCount = post.body ? post.body.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mla.org.ng";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  // Schema.org Article Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.body.slice(0, 150),
    image: post.cover_image_url || undefined,
    datePublished: post.published_at || post.updated_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Organization",
      name: "Mentorship & Leadership Academy",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Mentorship & Leadership Academy",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <div className="min-h-screen bg-[#0E0A08] text-parchment selection:bg-gold/30 selection:text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-parchment/50">
          <Link href="/" className="hover:text-gold transition">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/blog" className="hover:text-gold transition">
            Blog
          </Link>
          <ChevronRight size={12} />
          <Link
            href={`/blog?category=${encodeURIComponent(post.category || "Leadership")}`}
            className="text-gold/80 hover:text-gold transition"
          >
            {post.category || "Leadership"}
          </Link>
          <ChevronRight size={12} />
          <span className="truncate max-w-[200px] text-parchment/40">
            {post.title}
          </span>
        </nav>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-parchment/60 hover:text-gold transition"
          >
            <ArrowLeft size={13} />
            <span>Back to all dispatches</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/blog?category=${encodeURIComponent(post.category || "Leadership")}`}
              className="inline-block rounded-xl border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-bold text-gold tracking-wide hover:bg-gold hover:text-midnight transition-all"
            >
              {post.category || "Leadership"}
            </Link>

            {post.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-crest-red/20 border border-crest-red/40 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                <Sparkles size={11} /> Featured Dispatch
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight text-parchment sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg leading-relaxed text-parchment/80 font-light italic border-l-2 border-gold/40 pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Author, Date & Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 border border-gold/30 text-gold font-display font-bold">
                M
              </div>
              <div>
                <span className="font-semibold text-parchment block leading-none">
                  MLA Editorial Directorate
                </span>
                <span className="text-[11px] text-parchment/50">
                  Leadership, Research &amp; Fellowship
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-parchment/50">
              {date && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-gold" />
                  <span>{date}</span>
                </div>
              )}
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-gold" />
                <span>{readTime} min read</span>
              </div>
              {post.allow_comments && (
                <>
                  <span>•</span>
                  <a
                    href="#comments"
                    className="flex items-center gap-1.5 hover:text-gold transition"
                  >
                    <MessageSquare size={13} className="text-gold" />
                    <span>{comments.length} comments</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {post.cover_image_url && (
          <div className="my-10 overflow-hidden rounded-3xl border border-white/15 bg-black/40 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="aspect-[21/9] w-full object-cover"
            />
          </div>
        )}

        {/* Article Body with Text-Wrap Image Support */}
        <article className="mt-8">
          <Markdown className="text-base leading-relaxed sm:text-lg">
            {post.body}
          </Markdown>
        </article>

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-parchment/50 mr-1 flex items-center gap-1">
              <Hash size={13} /> Tags:
            </span>
            {post.tags.map((t) => (
              <Link
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                className="rounded-xl border border-white/10 bg-[#140E0A] px-3 py-1 text-xs font-medium text-parchment/80 hover:border-gold hover:text-gold transition-all"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}

        {/* Social Sharing Bar */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/10 bg-[#120D09] p-5">
          <ShareButtons title={post.title} url={postUrl} />

          <Link
            href="/mentorship/become"
            className="text-xs text-gold hover:underline font-medium self-start sm:self-auto"
          >
            Interested in publishing an academic dispatch? Join Faculty →
          </Link>
        </div>

        {/* Author Bio Card */}
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-3xl border border-white/15 bg-gradient-to-br from-[#18120D] to-[#0F0B08] p-6 sm:p-8 shadow-xl">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gold/15 border border-gold/40 text-gold font-display text-2xl font-bold">
            M
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold text-parchment">
                Mentorship &amp; Leadership Academy
              </h3>
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">
                Verified Faculty
              </span>
            </div>
            <p className="text-xs leading-relaxed text-parchment/70">
              MLA produces actionable leadership intelligence, rigorous curriculum frameworks, and career governance doctrines for university scholars, corporate executives, and emerging industry founders across Nigeria and Africa.
            </p>
          </div>
        </div>

        {/* WordPress Comments Section */}
        <CommentSection
          postId={post.id}
          postSlug={post.slug}
          initialComments={comments}
          allowComments={post.allow_comments}
        />

        {/* Related Articles in Same Category */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 border-t border-white/10 pt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-gold font-bold">
                  Continue Reading
                </span>
                <h3 className="font-display text-2xl font-bold text-parchment">
                  Related Dispatches in {post.category || "Leadership"}
                </h3>
              </div>
              <Link
                href={`/blog?category=${encodeURIComponent(post.category || "Leadership")}`}
                className="text-xs text-gold hover:underline"
              >
                View all in category →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rPost) => (
                <BlogCard key={rPost.id} post={rPost} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}