import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/blog";
import { Markdown } from "@/components/markdown";

export const dynamic = "force-dynamic";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt=""
          className="mb-10 aspect-[21/9] w-full rounded-sm object-cover"
        />
      )}
      <p className="text-xs uppercase tracking-widest text-gold">{date}</p>
      <h1 className="mt-4 font-display text-4xl leading-tight text-parchment">
        {post.title}
      </h1>
      <div className="mt-2 h-px w-16 bg-gold" aria-hidden />
      <div className="mt-8">
        <Markdown>{post.body}</Markdown>
      </div>
    </article>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return { title: post ? `${post.title} — MLA` : "Blog — MLA" };
}