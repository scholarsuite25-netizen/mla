import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DownloadLink } from "@/components/shop/download-link";
import { BookOpen, ShieldCheck, KeyRound, AlertTriangle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type LibraryRow = {
  id: string;
  license_key: string;
  max_activations: number;
  activation_count: number;
  is_revoked: boolean;
  created_at: string;
  digital_products: { title: string; type: string } | { title: string; type: string }[];
  orders: { paystack_reference: string | null; amount: number } | { paystack_reference: string | null; amount: number }[];
};

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-slate-600 mb-4">Please sign in to access your digital library.</p>
        <Link
          href="/login"
          className="rounded-lg bg-[#00D2FF] px-6 py-2.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] transition inline-block shadow-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // buyer-facing view uses RLS (product_licenses_select_own).
  const { data: licenses } = await supabase
    .from("product_licenses")
    .select(
      "id,license_key,max_activations,activation_count,is_revoked,created_at,digital_products(title,type),orders(paystack_reference,amount)"
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (licenses ?? []) as unknown as LibraryRow[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-2">
          <BookOpen size={13} />
          Digital Library &amp; Toolkits
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          My Licensed Materials
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl">
          Everything you&apos;ve acquired, your cryptographic license keys, and device activation limits.
          Downloads are dynamically watermarked for copyright protection.
        </p>
      </div>

      <div className="space-y-4">
        {rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-[#0284C7] mb-3">
              <BookOpen size={24} />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900 mb-1">
              No Materials Acquired Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              You haven&apos;t downloaded any lecture notes or digital toolkits yet. Explore the digital shop for free and member-exclusive materials.
            </p>
            <Link
              href="/shop"
              className="rounded-lg bg-[#00D2FF] px-6 py-2.5 text-xs font-bold text-[#0A0E2A] hover:bg-[#38BDF8] transition inline-flex items-center gap-2 shadow-sm"
            >
              Explore Digital Toolkits <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {rows.map((lic) => {
          const product = Array.isArray(lic.digital_products)
            ? lic.digital_products[0]
            : (lic.digital_products as { title: string; type: string });
          const consumed = lic.activation_count;

          return (
            <div
              key={lic.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-cyan-400/50 hover:shadow-md transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="rounded-full bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0284C7]">
                      {product?.type || "MATERIAL"}
                    </span>
                    <span className="text-xs text-slate-400">
                      Acquired {new Date(lic.created_at).toLocaleDateString("en-NG")}
                    </span>
                  </div>

                  <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {product?.title}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1 font-mono text-slate-700">
                      <KeyRound size={13} className="text-[#0284C7]" />
                      <span>{lic.license_key}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span>
                        {consumed}/{lic.max_activations} device{consumed === 1 ? "" : "s"} activated
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  {lic.is_revoked ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">
                      <AlertTriangle size={14} />
                      Revoked
                    </span>
                  ) : (
                    <DownloadLink
                      licenseId={lic.id}
                      licenseKey={lic.license_key}
                      title={product?.title ?? "product"}
                      label="Download File"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}