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
    <div className="min-h-screen bg-[#FAFAFD] text-slate-800">
      {/* Royal Navy Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#120D42] via-[#161152] to-[#241468] text-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#00D2FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-[#7C3AED]/25 blur-3xl" />

        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-[#00D2FF] uppercase tracking-wider mb-4">
            <Crown size={13} /> Official Academy Privilege
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white font-bold tracking-tight leading-tight mb-4">
            Unlock Lifetime Access to Scholarship &amp; Leadership
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            A single, one-time membership investment of <strong className="text-[#00D2FF] font-bold">₦20,000</strong>. Enjoy permanent <strong>50% discounts</strong> across all store publications, complimentary access to all <strong>Membership Deals</strong>, and verified privileges in our scholarly community.
          </p>

          {isMember ? (
            <div className="mx-auto inline-flex items-center gap-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md px-6 py-3.5 text-emerald-300">
              <CheckCircle2 size={20} />
              <div className="text-left">
                <p className="font-bold text-xs sm:text-sm text-white">You are an Active Lifetime Member</p>
                <p className="text-xs text-slate-300">
                  Enjoy your 50% discount and free access across our digital catalog.
                </p>
              </div>
              <Link
                href="/shop"
                className="ml-4 rounded-lg bg-[#00D2FF] text-[#0A0E2A] px-3.5 py-1.5 text-xs font-bold hover:bg-[#38BDF8] transition"
              >
                Browse Collection →
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#00D2FF]" /> One-Time Payment
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#00D2FF]" /> No Recurring Charges
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#00D2FF]" /> Instant Activation
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Core Value Pillars Grid */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Exclusive Member Benefits
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Everything included with your lifetime membership
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-2.5 shadow-sm hover:border-cyan-400/50 hover:shadow-md transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#0284C7] border border-cyan-100">
                <Tag size={20} />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">
                50% Discount on Everything
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enjoy an automatic 50% discount on all books, audio masterclasses, keynote decks, and monographs. Never pay full retail.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-2.5 shadow-sm hover:border-cyan-400/50 hover:shadow-md transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Crown size={20} />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Free Membership Deals
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant 100% complimentary access to exclusive publications designated as Membership Deals. Zero download fees.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-2.5 shadow-sm hover:border-cyan-400/50 hover:shadow-md transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Community Forum Badge
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A verified Lifetime Member crown badge next to your profile across our academic and professional discussion boards.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-2.5 shadow-sm hover:border-cyan-400/50 hover:shadow-md transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Sparkles size={20} />
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Priority Toolkits &amp; Notices
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Early access to new research releases, event announcements, executive briefing decks, and prompt engineering handbooks.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing & Checkout Card */}
        {!isMember && (
          <div id="join" className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-lg relative overflow-hidden">
              <div className="text-center border-b border-slate-100 pb-6 mb-6">
                <span className="inline-block rounded-full bg-cyan-50 text-[#0284C7] border border-cyan-200 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
                  Lifetime Pass
                </span>
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <span className="font-display text-4xl sm:text-5xl font-bold text-slate-900">
                    ₦20,000
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ one-time</span>
                </div>
                <p className="text-xs text-slate-500">
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
        <div className="mt-16 max-w-3xl mx-auto space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 text-center mb-6">
            Frequently Asked Questions
          </h2>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">
              Is the ₦20,000 fee an annual renewal or one-time?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              It is strictly a <strong>one-time payment</strong>. You will never be billed again, and your lifetime privileges, 50% store discounts, and access to all future Membership Deals remain permanent.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">
              How does the 50% discount apply to my purchases?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When logged in with your registered email, all store prices automatically display your 50% discount. During checkout, whether paying by card or bank transfer, the half-price rate is calculated automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">
              How do I access publications marked as Membership Deals?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              As a Lifetime Member, any publication with the &ldquo;Membership Deal&rdquo; badge can be downloaded instantly for ₦0.00. Your personal DRM watermark and license are generated immediately upon download.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
