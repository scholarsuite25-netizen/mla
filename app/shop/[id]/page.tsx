import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BuyButton } from "@/components/shop/buy-button";
import { ShieldAlert, Fingerprint, RefreshCw, Lock, ShieldCheck, ChevronLeft } from "lucide-react";
import { ProductCover } from "@/components/product-cover";

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
    .select("id,title,type,description,price,cover_image_url,is_membership_deal")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (!product) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const { checkIsMember } = await import("@/lib/membership");
  const isMember = await checkIsMember(user?.id, user?.email);

  const { getStoreSettings } = await import("@/lib/store");
  const bankSettings = await getStoreSettings();

  const basePrice = Number(product.price);
  const isMembershipDeal = Boolean(product.is_membership_deal);

  // Effective price for user
  let effectivePrice = basePrice;
  if (isMember) {
    if (isMembershipDeal) {
      effectivePrice = 0;
    } else if (basePrice > 0) {
      effectivePrice = Math.round(basePrice * 0.5);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800 w-full">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
        <Link href="/shop" className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#0284C7] transition-colors mb-6">
          <ChevronLeft size={16} /> Back to Collection
        </Link>

        {/* Member Discount Strip Notice */}
        {isMember ? (
          <div className="mb-8 rounded-2xl bg-cyan-50 border border-cyan-200 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">👑</span>
              <div>
                <p className="text-sm font-bold text-[#0284C7]">
                  Lifetime Member Status Active
                </p>
                <p className="text-xs text-slate-600">
                  {isMembershipDeal
                    ? "This publication is an official Membership Deal and is 100% complimentary for you."
                    : "You enjoy an automatic 50% discount on this material as an MLA Lifetime Member."}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-cyan-100 text-[#0284C7] border border-cyan-300 px-3 py-1 text-xs font-bold shrink-0">
              {isMembershipDeal ? "100% OFF" : "50% OFF"}
            </span>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-base">👑</span>
              <span>
                Want <strong>50% off</strong> all publications or free access to Membership Deals? One-time <strong>₦20,000</strong> Lifetime Membership available.
              </span>
            </div>
            <Link
              href="/membership"
              className="text-[#0284C7] font-bold hover:underline shrink-0"
            >
              Learn More &amp; Join →
            </Link>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] items-start">
          {/* Left Column: Product Render */}
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 lg:max-w-none overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-3 shadow-sm">
            <ProductCover
              title={product.title}
              type={product.type}
              coverUrl={product.cover_image_url}
              aspectRatio="aspect-auto h-full"
            />
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col pt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0284C7] border border-cyan-200">
                {product.type}
              </span>
              {isMembershipDeal && (
                <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  👑 Membership Deal
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-3">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-3 mb-6 border-b border-slate-200 pb-6">
              {effectivePrice === 0 ? (
                <>
                  <span className="font-display text-3xl font-bold text-emerald-600">FREE</span>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider">
                    {isMember && isMembershipDeal ? "Included with Membership" : "Complimentary Access"}
                  </span>
                </>
              ) : isMember ? (
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-lg text-slate-400 line-through">
                    ₦{basePrice.toLocaleString()}
                  </span>
                  <p className="font-display text-3xl font-bold text-[#0284C7]">
                    ₦{effectivePrice.toLocaleString()}
                  </p>
                  <span className="rounded-full bg-cyan-100 text-[#0284C7] border border-cyan-300 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                    50% Member Discount
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                    ₦{basePrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#0284C7] font-semibold">
                    ₦{(basePrice * 0.5).toLocaleString()} for MLA Lifetime Members
                  </p>
                </div>
              )}
            </div>

            <div className="max-w-none mb-8 text-slate-600 text-xs sm:text-sm leading-relaxed">
              <p>
                {product.description || "An exclusive digital asset curated by the Mentorship & Leadership Academy. Available for instant secure download."}
              </p>
            </div>

            {/* Purchase CTA */}
            <div className="mb-8">
              <BuyButton
                productId={product.id}
                title={product.title}
                price={effectivePrice}
                type={product.type}
                coverImageUrl={product.cover_image_url}
                initialUser={user ? { email: user.email, name: profile?.full_name ?? undefined } : null}
                bankSettings={bankSettings}
              />
              <p className="mt-3 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-[#0284C7]" /> Instant access via Direct GTBank Transfer or Card.
              </p>
            </div>

            {/* Security & Licensing Accordion/Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-[#0284C7]" /> Protection &amp; Licensing Notice
              </h3>
              
              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Fingerprint size={16} className="shrink-0 text-[#0284C7] mt-0.5" />
                  <p>
                    <strong className="text-slate-800 block font-semibold">Identity Binding</strong>
                    Your purchase is permanently bound to your MLA account. Digital downloads (including PDFs) are dynamically watermarked with your verified Name &amp; Email prior to delivery.
                  </p>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <Lock size={16} className="shrink-0 text-[#0284C7] mt-0.5" />
                  <p>
                    <strong className="text-slate-800 block font-semibold">Device Activation Limits</strong>
                    Software and high-value templates are protected by our proprietary DRM. You will receive a unique cryptographic license key valid for personal use across your registered devices only.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <RefreshCw size={16} className="shrink-0 text-[#0284C7] mt-0.5" />
                  <p>
                    <strong className="text-slate-800 block font-semibold">Lifetime Updates</strong>
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