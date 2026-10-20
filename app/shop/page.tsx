import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, Lock, Fingerprint, Star, ArrowRight, ShoppingBag, Eye, Heart } from "lucide-react";

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
    <div className="min-h-screen bg-ink w-full">
      {/* Top Security Announcement Bar */}
      <div className="w-full bg-[#1A1A1A] py-2.5 px-4 text-center border-b border-white/5">
        <p className="text-xs sm:text-sm text-parchment/80 font-medium flex items-center justify-center gap-2">
          <ShieldCheck size={16} className="text-gold" />
          <span><strong className="text-parchment">Instant Access</strong>: Pay via Direct GTBank Transfer (WhatsApp) or Card</span>
        </p>
      </div>

      {/* Lifetime Membership Promotional Strip */}
      <div className="w-full bg-gradient-to-r from-[#201508] via-[#36240E] to-[#201508] border-b border-gold/20 py-3 px-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-gold text-base shrink-0">
              👑
            </span>
            <p className="text-xs sm:text-sm text-parchment font-medium">
              <strong className="text-gold font-bold">MLA Lifetime Membership (₦20,000)</strong>: Get <span className="underline decoration-gold font-bold text-parchment">50% discount</span> on all publications + 100% free access to all Membership Deals!
            </p>
          </div>
          <Link
            href="/membership"
            className="rounded-full bg-gradient-to-r from-gold-dark to-gold px-4 py-1.5 text-xs font-bold text-ink hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition shrink-0 inline-flex items-center gap-1.5"
          >
            Join Membership Now <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0A1118] via-[#1E100A] to-[#0A0806] border border-gold/10 p-10 md:p-16 lg:p-24 shadow-2xl mb-12">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block mb-4 text-gold font-display italic text-lg tracking-wide border-b border-gold/30 pb-1">Official Thought Leadership & Lectures</span>
            <h1 className="font-display text-4xl md:text-6xl text-parchment leading-[1.1] mb-6">
              Lecture Notes, Keynotes <br/> & Executive Toolkits
            </h1>
            <p className="text-lg text-parchment/70 max-w-xl mb-10 leading-relaxed font-light">
              Instant access to masterclass notes, presentation slides, companion workbooks, and group bundles. Secure delivery via instant Card or Direct Bank Transfer to Tintol Business Services (GTBank).
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#collection" className="rounded-full bg-gradient-to-r from-gold-dark to-gold px-8 py-4 text-ink font-bold hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all flex items-center gap-2">
                Explore Lecture Materials <ArrowRight size={18} />
              </a>
              <a href="https://wa.me/2348034710699" target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/5 border border-white/10 px-8 py-4 text-parchment font-medium hover:bg-[#25D366]/10 hover:border-[#25D366]/40 hover:text-[#25D366] transition-all flex items-center gap-2">
                Order via WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Trust / Payment Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="flex items-center gap-4 rounded-2xl bg-[#141414] border border-white/5 p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold shrink-0">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-parchment">Direct GTBank Transfer</h3>
              <p className="text-xs text-parchment/60 mt-1">Tintol Business Services · 0029103844</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-[#141414] border border-white/5 p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-parchment">1-Click WhatsApp Proof</h3>
              <p className="text-xs text-parchment/60 mt-1">Instant confirmation & delivery via +2348034710699</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-[#141414] border border-white/5 p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold shrink-0">
              <Fingerprint size={24} />
            </div>
            <div>
              <h3 className="font-bold text-parchment">Dynamic Watermarking</h3>
              <p className="text-xs text-parchment/60 mt-1">Buyer identity stamped into every page</p>
            </div>
          </div>
        </div>

        {/* Product Grid Section */}
        <div id="collection" className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
          <h2 className="font-display text-3xl text-parchment">Lecture Notes & Materials</h2>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-parchment/50">
            <button className="text-gold border-b-2 border-gold pb-4 -mb-[18px]">All Items</button>
            <button className="hover:text-parchment transition">Ebooks</button>
            <button className="hover:text-parchment transition">Software</button>
            <button className="hover:text-parchment transition">Templates</button>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {(products as unknown as (ProductRow & { product_reviews: { rating: number }[] })[] | null)?.map((product) => {
            const reviews = product.product_reviews || [];
            const avgRating = reviews.length ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 0;

            return (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className="group relative flex flex-col rounded-3xl bg-[#F9F8F6] p-3 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,175,55,0.15)]"
            >
              {/* Product Image Container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#EBE9E2]">
                {product.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.cover_image_url}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#EBE9E2] text-ink/20">
                    <ShoppingBag size={48} />
                  </div>
                )}
                
                {/* Floating Tags */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  <span className="inline-flex items-center rounded-full bg-ink/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold backdrop-blur-md">
                    {product.type}
                  </span>
                  {product.is_membership_deal && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 text-ink px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md">
                      👑 Member Deal
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-gold hover:text-white transition shadow-sm" aria-label="Add to wishlist">
                    <Heart size={14} />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-gold hover:text-white transition shadow-sm" aria-label="Quick view">
                    <Eye size={14} />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-1 p-3 pt-4">
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < avgRating ? "currentColor" : "none"} className={i < avgRating ? "" : "text-ink/20"} />
                    ))}
                  </div>
                  <span className="text-[10px] text-ink/50 ml-1 font-medium">({reviews.length})</span>
                </div>
                
                <h2 className="font-display text-lg font-bold text-ink line-clamp-1 mb-1">
                  {product.title}
                </h2>
                
                <div className="mt-auto pt-4 flex flex-col gap-1">
                  {Number(product.price) === 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xl font-bold text-emerald-600">FREE</span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Complimentary
                      </span>
                    </div>
                  ) : product.is_membership_deal ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-lg font-bold text-ink line-through opacity-50">
                          ₦{Number(product.price).toLocaleString()}
                        </span>
                        <span className="font-display text-lg font-extrabold text-amber-600">
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
                        <p className="font-display text-xl font-bold text-ink">
                          ₦{Number(product.price).toLocaleString()}
                        </p>
                        <span className="text-xs text-gold font-bold">
                          ₦{Number(product.price * 0.5).toLocaleString()} for Members
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-medium block">
                        50% Member Discount Available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )})}
          {(!products || products.length === 0) && (
            <div className="col-span-full py-20 text-center">
              <p className="text-parchment/60 text-lg">
                The exclusive collection is currently being curated. Check back soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}