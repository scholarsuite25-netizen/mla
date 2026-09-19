import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BuyButton } from "@/components/shop/buy-button";
import { ShieldAlert, Fingerprint, RefreshCw, Lock, ShieldCheck, ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("digital_products")
    .select("id,title,type,description,price,cover_image_url")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (!product) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-ink w-full">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-16">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-parchment/60 hover:text-gold transition-colors mb-8">
          <ChevronLeft size={16} /> Back to Collection
        </Link>

        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] items-start">
          {/* Left Column: Product Render */}
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 lg:max-w-none overflow-hidden rounded-[2rem] bg-[#F9F8F6] p-4 shadow-2xl">
            <div className="h-full w-full rounded-2xl bg-[#EBE9E2] overflow-hidden border border-black/5 relative">
              {product.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.cover_image_url}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink/10">
                  <span className="font-display text-4xl font-bold italic">MLA</span>
                </div>
              )}
              {/* Floating Security Badge on Image */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-black/5 flex items-center gap-1.5">
                <Lock size={12} className="text-gold" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink">DRM Secured</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col pt-4">
            <p className="text-sm font-bold uppercase tracking-widest text-gold mb-3">
              {product.type}
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-parchment leading-tight mb-4">
              {product.title}
            </h1>
            <p className="font-display text-3xl text-parchment mb-8 border-b border-white/10 pb-8">
              ₦{Number(product.price).toFixed(2)}
            </p>

            <div className="prose prose-invert prose-parchment max-w-none mb-10 text-parchment/70 leading-relaxed font-light">
              <p>
                {product.description || "An exclusive digital asset curated by the Mentorship & Leadership Academy. Available for instant secure download."}
              </p>
            </div>

            {/* Purchase CTA */}
            <div className="mb-12">
              {user ? (
                <div className="group">
                  <BuyButton productId={product.id} />
                </div>
              ) : (
                <Link
                  href="/register?next=/shop/"
                  className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-gold-dark to-gold px-8 py-4 font-bold text-ink shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                >
                  Sign in to Purchase Securely
                </Link>
              )}
              <p className="mt-3 text-center text-xs text-parchment/40 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-gold/60" /> Payments processed securely with AES-256 encryption.
              </p>
            </div>

            {/* Security & Licensing Accordion/Card */}
            <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 space-y-5">
              <h3 className="font-display text-xl text-gold flex items-center gap-2">
                <ShieldAlert size={20} /> Protection & Licensing Notice
              </h3>
              
              <div className="space-y-4 text-sm text-parchment/80">
                <div className="flex items-start gap-3">
                  <Fingerprint size={18} className="shrink-0 text-gold/80 mt-0.5" />
                  <p>
                    <strong className="text-parchment block">Identity Binding</strong>
                    Your purchase is permanently bound to your MLA account. Digital downloads (including PDFs) are dynamically watermarked with your verified Name & Email prior to delivery.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <Lock size={18} className="shrink-0 text-gold/80 mt-0.5" />
                  <p>
                    <strong className="text-parchment block">Device Activation Limits</strong>
                    Software and high-value templates are protected by our proprietary DRM. You will receive a unique cryptographic license key valid for personal use across your registered devices only.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <RefreshCw size={18} className="shrink-0 text-gold/80 mt-0.5" />
                  <p>
                    <strong className="text-parchment block">Lifetime Updates</strong>
                    You retain lifetime access to this asset through your secured Library. Download links are dynamically generated and expire to prevent unauthorized sharing.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}