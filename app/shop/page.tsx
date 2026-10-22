import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, Lock, Fingerprint, Star, ArrowRight, Eye, Heart } from "lucide-react";
import { ProductCover } from "@/components/product-cover";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  title: string;
  type: string;
  description: string;
  price: number;
  cover_image_url: string | null;
  is_membership_deal?: boolean;
};

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("digital_products")
    .select("id,title,type,description,price,cover_image_url,is_membership_deal,product_reviews(rating)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-crest-red p-8">{error.message}</p>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800 w-full">
      {/* Top Security Announcement Bar */}
      <div className="w-full bg-[#120D42] py-2 px-4 text-center border-b border-white/10 text-white">
        <p className="text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
          <ShieldCheck size={16} className="text-[#00D2FF]" />
          <span><strong className="text-white">Instant Access</strong>: Pay via Direct GTBank Transfer (WhatsApp) or Card</span>
        </p>
      </div>

      {/* Lifetime Membership Promotional Strip */}
      <div className="w-full bg-gradient-to-r from-[#161152] via-[#241468] to-[#161152] border-b border-cyan-400/20 py-2.5 px-4 text-white">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/20 text-[#00D2FF] text-sm shrink-0">
              👑
            </span>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              <strong className="text-[#00D2FF] font-bold">MLA Lifetime Membership (₦20,000)</strong>: Get <span className="underline decoration-cyan-400 font-bold text-white">50% discount</span> on all publications + 100% free access to all Membership Deals!
            </p>
          </div>
          <Link
            href="/membership"
            className="rounded-lg bg-[#00D2FF] px-4 py-1.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] transition shrink-0 inline-flex items-center gap-1.5 shadow-sm"
          >
            Join Membership Now <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Royal Navy Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] text-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#00D2FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-[#7C3AED]/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-[#00D2FF] uppercase tracking-wider mb-3">
              Official Thought Leadership &amp; Lectures
            </span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight mb-4">
              Lecture Notes, Keynotes &amp; Executive Toolkits
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mb-6 leading-relaxed">
              Instant access to masterclass notes, presentation slides, companion workbooks, and group bundles. Secure delivery via instant Card or Direct Bank Transfer to Tintol Business Services (GTBank).
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#collection"
                className="rounded-lg bg-[#00D2FF] px-6 py-2.5 text-xs sm:text-sm font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] transition-all flex items-center gap-2"
              >
                Explore Materials <ArrowRight size={15} />
              </a>
              <a
                href="https://wa.me/2348034710699"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/15 transition-all flex items-center gap-2"
              >
                Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        {/* Trust / Payment Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#0284C7] shrink-0 border border-cyan-100">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Direct GTBank Transfer</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tintol Business Services · 0029103844</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">1-Click WhatsApp Proof</h3>
              <p className="text-xs text-slate-500 mt-0.5">Instant delivery via +2348034710699</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0 border border-indigo-100">
              <Fingerprint size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Dynamic Watermarking</h3>
              <p className="text-xs text-slate-500 mt-0.5">Buyer identity stamped into every page</p>
            </div>
          </div>
        </div>

        {/* Product Grid Section */}
        <div id="collection" className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">Lecture Notes &amp; Materials</h2>
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
            <button className="text-[#0284C7] border-b-2 border-[#0284C7] pb-3 -mb-[13px]">All Items</button>
            <button className="hover:text-slate-900 transition">Ebooks</button>
            <button className="hover:text-slate-900 transition">Software</button>
            <button className="hover:text-slate-900 transition">Templates</button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(products as unknown as (ProductRow & { product_reviews: { rating: number }[] })[] | null)?.map((product) => {
            const reviews = product.product_reviews || [];
            const avgRating = reviews.length ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 0;

            return (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-sm transition-all hover:border-cyan-400/60 hover:shadow-md"
            >
              {/* Product Cover (Executive Dynamic Cover if no uploaded image) */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
                <ProductCover
                  title={product.title}
                  type={product.type}
                  coverUrl={product.cover_image_url}
                />
                
                {/* Floating Tags */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                  <span className="inline-flex items-center rounded-full bg-[#120D42]/90 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#00D2FF] backdrop-blur-md">
                    {product.type}
                  </span>
                  {product.is_membership_deal && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-slate-950 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                      👑 Member Deal
                    </span>
                  )}
                </div>
                <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-700 hover:bg-[#00D2FF] hover:text-[#0A0E2A] transition shadow-sm" aria-label="Add to wishlist">
                    <Heart size={13} />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-700 hover:bg-[#00D2FF] hover:text-[#0A0E2A] transition shadow-sm" aria-label="Quick view">
                    <Eye size={13} />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-1 pt-3">
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} fill={i < avgRating ? "currentColor" : "none"} className={i < avgRating ? "" : "text-slate-300"} />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 ml-1 font-medium">({reviews.length})</span>
                </div>
                
                <h3 className="font-display text-sm font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-[#0284C7] transition-colors">
                  {product.title}
                </h3>
                
                <div className="mt-auto pt-3 flex flex-col gap-0.5">
                  {Number(product.price) === 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-emerald-600">FREE</span>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Complimentary
                      </span>
                    </div>
                  ) : product.is_membership_deal ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-sm font-bold text-slate-400 line-through">
                          ₦{Number(product.price).toLocaleString()}
                        </span>
                        <span className="font-display text-base font-extrabold text-amber-600">
                          FREE
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-700 font-semibold block">
                        Included with Lifetime Membership
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="font-display text-base font-bold text-slate-900">
                          ₦{Number(product.price).toLocaleString()}
                        </p>
                        <span className="text-[11px] text-[#0284C7] font-bold">
                          ₦{Number(product.price * 0.5).toLocaleString()} for Members
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium block">
                        50% Member Discount Available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )})}
          {(!products || products.length === 0) && (
            <div className="col-span-full py-16 text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-slate-500 text-sm">
                The exclusive collection is currently being curated. Check back soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}