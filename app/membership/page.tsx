import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/store";
import { MembershipCheckoutForm } from "@/components/membership/membership-checkout-form";
import {
  CheckCircle2,
  Crown,
  Sparkles,
  Tag,
  MessageSquare,
} from "lucide-react";

export const metadata = {
  title: "Lifetime Membership (₦20,000) — Mentorship & Leadership Academy",
  description:
    "Join the MLA Lifetime Membership for a one-time fee of ₦20,000. Enjoy 50% discount on all publications, 100% free access to Membership Deals, and exclusive community privileges.",
};

export default async function MembershipPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, is_member, membership_paid_at")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const bankSettings = await getStoreSettings();
  const isMember = Boolean(profile?.is_member);

  return (
    <div className="min-h-screen bg-ink text-parchment">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#1C140D] via-[#0E0A08] to-ink py-16 sm:py-24 px-4">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-[700px] h-[500px] bg-gold/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold uppercase tracking-widest mb-6">
            <Crown size={14} /> Official Academy Privilege
          </div>

          <h1 className="font-display text-4xl sm:text-6xl text-parchment font-bold tracking-tight leading-[1.1] mb-6">
            Unlock Lifetime Access to <br />
            <span className="text-gradient-gold">Scholarship &amp; Leadership</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-parchment/70 leading-relaxed font-light mb-8">
            A single, one-time membership investment of <strong className="text-gold font-bold">₦20,000</strong>. Enjoy permanent <strong>50% discounts</strong> across all store publications, complimentary access to all <strong>Membership Deals</strong>, and verified privileges in our scholarly community.
          </p>

          {isMember ? (
            <div className="mx-auto inline-flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-4 text-emerald-400">
              <CheckCircle2 size={24} />
              <div className="text-left">
                <p className="font-bold text-sm">You are an Active Lifetime Member</p>
                <p className="text-xs opacity-80">
                  Enjoy your 50% discount and free access across our digital catalog.
                </p>
              </div>
              <Link
                href="/shop"
                className="ml-4 rounded-full bg-emerald-500 text-ink px-4 py-2 text-xs font-bold hover:bg-emerald-400 transition"
              >
                Browse Collection →
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-parchment/60 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-gold" /> One-Time Payment
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-gold" /> No Recurring Charges
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-gold" /> Instant Activation
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        {/* Core Value Pillars Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-parchment">
              Exclusive Member Benefits
            </h2>
            <p className="text-sm text-parchment/60 mt-2">
              Everything included with your lifetime membership
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#120D09] p-6 space-y-3 hover:border-gold/40 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Tag size={24} />
              </div>
              <h3 className="font-display text-lg font-bold text-parchment">
                50% Discount on Everything
              </h3>
              <p className="text-xs text-parchment/70 leading-relaxed">
                Enjoy an automatic 50% discount on all books, audio masterclasses, keynote decks, and monographs. Never pay full retail.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#120D09] p-6 space-y-3 hover:border-gold/40 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Crown size={24} />
              </div>
              <h3 className="font-display text-lg font-bold text-parchment">
                Free Membership Deals
              </h3>
              <p className="text-xs text-parchment/70 leading-relaxed">
                Instant 100% complimentary access to exclusive publications designated as Membership Deals. Zero download fees.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#120D09] p-6 space-y-3 hover:border-gold/40 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-display text-lg font-bold text-parchment">
                Community Forum Badge
              </h3>
              <p className="text-xs text-parchment/70 leading-relaxed">
                A verified Lifetime Member crown badge next to your profile across our academic and professional discussion boards.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#120D09] p-6 space-y-3 hover:border-gold/40 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Sparkles size={24} />
              </div>
              <h3 className="font-display text-lg font-bold text-parchment">
                Priority Toolkits &amp; Notices
              </h3>
              <p className="text-xs text-parchment/70 leading-relaxed">
                Early access to new research releases, event announcements, executive briefing decks, and prompt engineering handbooks.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing & Checkout Card */}
        {!isMember && (
          <div id="join" className="mx-auto max-w-2xl">
            <div className="rounded-[2.5rem] border border-gold/30 bg-gradient-to-b from-[#1C130B] to-[#0E0A08] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="text-center border-b border-white/10 pb-8 mb-8 relative z-10">
                <span className="inline-block rounded-full bg-gold/20 text-gold px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                  Lifetime Pass
                </span>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="font-display text-5xl sm:text-6xl font-bold text-parchment">
                    ₦20,000
                  </span>
                  <span className="text-sm text-parchment/60 font-medium">/ one-time</span>
                </div>
                <p className="text-xs sm:text-sm text-parchment/70">
                  Pay once. Enjoy lifetime discounts, digital privileges, and deals forever.
                </p>
              </div>

              {/* Checkout Form */}
              <MembershipCheckoutForm
                initialUser={
                  user
                    ? { email: user.email ?? "", name: profile?.full_name ?? "" }
                    : null
                }
                bankSettings={bankSettings}
              />
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto space-y-6">
          <h2 className="font-display text-2xl font-bold text-parchment text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="rounded-2xl border border-white/10 bg-[#120D09] p-6">
            <h4 className="font-bold text-parchment text-sm mb-2">
              Is the ₦20,000 fee an annual renewal or one-time?
            </h4>
            <p className="text-xs text-parchment/70 leading-relaxed">
              It is strictly a <strong>one-time payment</strong>. You will never be billed again, and your lifetime privileges, 50% store discounts, and access to all future Membership Deals remain permanent.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#120D09] p-6">
            <h4 className="font-bold text-parchment text-sm mb-2">
              How does the 50% discount apply to my purchases?
            </h4>
            <p className="text-xs text-parchment/70 leading-relaxed">
              When logged in with your registered email, all store prices automatically display your 50% discount. During checkout, whether paying by card or bank transfer, the half-price rate is calculated automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#120D09] p-6">
            <h4 className="font-bold text-parchment text-sm mb-2">
              How do I access publications marked as Membership Deals?
            </h4>
            <p className="text-xs text-parchment/70 leading-relaxed">
              As a Lifetime Member, any publication with the &ldquo;Membership Deal&rdquo; badge can be downloaded instantly for ₦0.00. Your personal DRM watermark and license are generated immediately upon download.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
