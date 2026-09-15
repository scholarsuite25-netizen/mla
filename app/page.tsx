import Link from "next/link";
import { getInstitutionCount, getMentorCount, getPublishedPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog-card";

export default async function Home() {
  const [institutions, mentors, posts] = await Promise.all([
    getInstitutionCount(),
    getMentorCount(),
    getPublishedPosts(3),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-parchment/10 bg-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <p className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gold">
              <span className="inline-block h-2 w-2 rotate-45 bg-gold" aria-hidden />
              Mentorship &amp; Leadership Academy
            </p>
            <h1 className="mt-6 max-w-xl font-display text-5xl leading-tight text-parchment md:text-6xl">
              Lead where you study —
              <span className="text-gold"> mentor anyone, anywhere.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-parchment/75">
              Learn AI literacy and vibe coding, then prove it by mentoring
              students at other Nigerian higher institutions — all in one
              academy, from one reading desk.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/courses"
                className="rounded-sm bg-crest-red px-6 py-3 text-sm font-medium text-white hover:bg-crest-red/90"
              >
                Browse Courses
              </Link>
              <Link
                href="/mentorship/find"
                className="rounded-sm border border-gold/60 px-6 py-3 text-sm font-medium text-gold hover:bg-gold hover:text-ink"
              >
                Find a Mentor
              </Link>
            </div>

            <dl className="mt-12 flex gap-10">
              <Stat value={String(institutions)} label="Institutions" />
              <Stat value={String(mentors)} label="Active mentors" />
              <Stat value="1" label="Academy" />
            </dl>
          </div>

          <div className="hidden place-items-center md:grid" aria-hidden>
            <div className="relative h-72 w-72 rotate-45 rounded-md border border-gold/40">
              <div className="absolute -inset-0 flex items-center justify-center -rotate-45">
                <span className="font-display text-3xl text-parchment/30">MLA</span>
              </div>
              <span className="absolute -top-3 -left-3 h-6 w-6 rotate-45 bg-gold" />
              <span className="absolute -bottom-3 -right-3 h-6 w-6 rotate-45 bg-crest-red" />
            </div>
          </div>
        </div>
      </section>

      {/* Latest from the blog */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl text-parchment">From the blog</h2>
          <Link href="/blog" className="text-sm text-gold hover:underline">
            View all →
          </Link>
        </div>
        {posts.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-parchment/60">
            The first post is brewing. Watch this space.
          </p>
        )}
      </section>

      {/* Feature showcase */}
      <section className="border-t border-parchment/10 bg-panel">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2">
          <div className="rounded-md border border-parchment/10 bg-ink/40 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Learn &amp; Connect</p>
            <h2 className="mt-3 font-display text-2xl text-parchment">Courses &amp; Mentorship</h2>
            <p className="mt-3 text-sm leading-relaxed text-parchment/70">
              Structured AI Literacy and Vibe Coding modules with progress tracking,
              followed by 1-to-1 mentorship that connects learners across Nigerian institutions.
            </p>
            <div className="mt-5 flex gap-4">
              <Link href="/courses" className="text-xs uppercase tracking-wider text-gold hover:underline">
                Course Catalog →
              </Link>
              <Link href="/mentorship/find" className="text-xs uppercase tracking-wider text-parchment/70 hover:text-gold">
                Find Mentors →
              </Link>
            </div>
          </div>
          <div className="rounded-md border border-parchment/10 bg-ink/40 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Community &amp; Resources</p>
            <h2 className="mt-3 font-display text-2xl text-parchment">Events &amp; Digital Shop</h2>
            <p className="mt-3 text-sm leading-relaxed text-parchment/70">
              Institution-scoped workshops, platform-wide webinars, and a licensed
              digital products library with cryptographic key protection and personalized watermarking.
            </p>
            <div className="mt-5 flex gap-4">
              <Link href="/events" className="text-xs uppercase tracking-wider text-gold hover:underline">
                Upcoming Events →
              </Link>
              <Link href="/shop" className="text-xs uppercase tracking-wider text-parchment/70 hover:text-gold">
                Visit Shop →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-display text-3xl text-gold">{value}</dd>
      <dd className="text-xs uppercase tracking-widest text-parchment/50">{label}</dd>
    </div>
  );
}