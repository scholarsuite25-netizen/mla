import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/product-form";
import { LicensesList } from "@/components/admin/licenses-list";
import {
  ArrowLeft,
  ExternalLink,
  ShoppingBag,
  CreditCard,
  KeyRound,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: product } = await admin
    .from("digital_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!product) notFound();

  const [{ data: licenses }, { data: paidOrders }] = await Promise.all([
    admin
      .from("product_licenses")
      .select(
        "id,license_key,max_activations,activation_count,is_revoked,created_at,buyer:profiles(full_name),orders(paystack_reference)"
      )
      .eq("product_id", id)
      .order("created_at", { ascending: false }),
    admin
      .from("orders")
      .select("amount,status")
      .eq("product_id", id)
      .eq("status", "paid"),
  ]);

  const unitsSold = paidOrders?.length ?? 0;
  const grossRevenue = (paidOrders ?? []).reduce(
    (acc, o) => acc + Number(o.amount || 0),
    0
  );
  const activeLicenses = (licenses ?? []).filter((l) => !l.is_revoked).length;

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs text-parchment/60 hover:text-gold mb-2 transition"
          >
            <ArrowLeft size={13} />
            <span>Back to Products</span>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-parchment sm:text-3xl">
              {product.title}
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider border ${
                product.status === "published"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              }`}
            >
              {product.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-parchment/60">
            WooCommerce product configuration, pricing rules, downloads, and DRM activation keys.
          </p>
        </div>

        {product.status === "published" && (
          <Link
            href={`/shop/${product.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-parchment hover:border-gold hover:text-gold transition self-start sm:self-auto shadow"
          >
            <ExternalLink size={14} />
            <span>View in Public Store</span>
          </Link>
        )}
      </div>

      {/* WooCommerce Sales & Performance KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <div className="flex items-center justify-between text-parchment/50 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Store Price</span>
            <CreditCard size={14} className="text-gold" />
          </div>
          <p className="text-xl font-bold text-parchment">
            ₦{Number(product.price).toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <div className="flex items-center justify-between text-parchment/50 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Units Sold</span>
            <ShoppingBag size={14} className="text-gold" />
          </div>
          <p className="text-xl font-bold text-gold">{unitsSold} Sales</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <div className="flex items-center justify-between text-parchment/50 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Gross Revenue</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">
            ₦{grossRevenue.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <div className="flex items-center justify-between text-parchment/50 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Active Licenses</span>
            <ShieldCheck size={14} className="text-gold" />
          </div>
          <p className="text-xl font-bold text-parchment">
            {activeLicenses} Active Keys
          </p>
        </div>
      </div>

      {/* Product Form Studio */}
      <ProductForm product={product} />

      {/* Attached Customer Licenses (DRM) */}
      <div className="rounded-3xl border border-white/10 bg-[#120D09] p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound size={18} className="text-gold" />
              <h3 className="font-display text-xl font-bold text-parchment">
                Issued Customer Licenses &amp; Activations ({licenses?.length ?? 0})
              </h3>
            </div>
            <p className="text-xs text-parchment/50 mt-0.5">
              Device-locked DRM keys issued to scholars upon completing Paystack checkout.
            </p>
          </div>

          <Link
            href="/admin/licenses"
            className="inline-flex items-center gap-1 text-xs text-gold hover:underline font-semibold"
          >
            <span>Open Global License Manager</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        <div className="mt-4">
          <LicensesList
            licenses={
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (licenses as any) ?? []
            }
          />
        </div>
      </div>
    </div>
  );
}