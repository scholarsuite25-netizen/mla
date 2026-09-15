"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ExternalLink,
  ShoppingBag,
  FileCode,
  Book,
  FileText,
} from "lucide-react";
import { ProductActions } from "@/components/admin/product-actions";

export interface ProductListItem {
  id: string;
  title: string;
  type: string;
  price: number;
  status: string;
  updated_at: string;
}

export interface RecentOrder {
  id: string;
  amount: number;
  paystack_reference: string | null;
  status: string;
  created_at: string;
  buyer?: { full_name: string | null } | null;
  digital_products?: { title: string } | null;
}

export function ProductsManager({
  initialProducts,
  recentOrders = [],
}: {
  initialProducts: ProductListItem[];
  recentOrders?: RecentOrder[];
}) {
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesType = typeFilter === "all" || product.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const publishedCount = initialProducts.filter((p) => p.status === "published").length;
  const draftCount = initialProducts.filter((p) => p.status === "draft").length;

  const totalSalesVolume = recentOrders
    .filter((o) => o.status === "paid")
    .reduce((acc, o) => acc + Number(o.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-parchment sm:text-3xl">Shop &amp; E-Commerce</h2>
          <p className="mt-1 text-xs text-parchment/60">
            WooCommerce-grade digital shop management: products, prices, downloads, and sales.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-crest-red to-amber-700 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <p className="text-[11px] uppercase tracking-wider text-parchment/50 font-semibold">Total Catalog</p>
          <p className="mt-1 text-xl font-bold text-parchment">{initialProducts.length} Items</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <p className="text-[11px] uppercase tracking-wider text-parchment/50 font-semibold">Active in Store</p>
          <p className="mt-1 text-xl font-bold text-gold">{publishedCount} Published</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <p className="text-[11px] uppercase tracking-wider text-parchment/50 font-semibold">Recent Orders</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">{recentOrders.length} Orders</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#120D09] p-4">
          <p className="text-[11px] uppercase tracking-wider text-parchment/50 font-semibold">Total Revenue</p>
          <p className="mt-1 text-xl font-bold text-parchment">₦{totalSalesVolume.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Tabs (Catalog vs Orders) */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
            activeTab === "catalog"
              ? "border-gold text-gold"
              : "border-transparent text-parchment/50 hover:text-parchment"
          }`}
        >
          Product Catalog ({initialProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
            activeTab === "orders"
              ? "border-gold text-gold"
              : "border-transparent text-parchment/50 hover:text-parchment"
          }`}
        >
          Orders &amp; Sales ({recentOrders.length})
        </button>
      </div>

      {/* Tab 1: Product Catalog */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#120D09] p-3">
            {/* Status & Type Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setStatusFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : "text-parchment/60 hover:text-parchment hover:bg-white/5"
                }`}
              >
                All ({initialProducts.length})
              </button>
              <button
                onClick={() => setStatusFilter("published")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === "published"
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : "text-parchment/60 hover:text-parchment hover:bg-white/5"
                }`}
              >
                Published ({publishedCount})
              </button>
              <button
                onClick={() => setStatusFilter("draft")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === "draft"
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : "text-parchment/60 hover:text-parchment hover:bg-white/5"
                }`}
              >
                Drafts ({draftCount})
              </button>

              <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#0E0A08] px-2.5 py-1.5 text-xs text-parchment focus:border-gold focus:outline-none"
              >
                <option value="all">All Product Types</option>
                <option value="ebook">E-Book</option>
                <option value="software">Software / Starter Kit</option>
                <option value="pdf">PDF / Document</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-parchment placeholder:text-parchment/40 focus:border-gold/60 focus:outline-none"
              />
            </div>
          </div>

          {/* Product Items */}
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const TypeIcon =
                product.type === "software"
                  ? FileCode
                  : product.type === "ebook"
                  ? Book
                  : FileText;

              return (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#140F0B] p-5 shadow-md hover:border-gold/30 transition-all"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          product.status === "published"
                            ? "border-gold/40 bg-gold/10 text-gold"
                            : "border-white/10 bg-white/5 text-parchment/50"
                        }`}
                      >
                        {product.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-parchment/60 font-medium">
                        <TypeIcon size={12} className="text-gold" />
                        <span className="capitalize">{product.type}</span>
                      </span>
                    </div>

                    <h3 className="font-display text-base sm:text-lg font-bold text-parchment truncate">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-bold text-gold">
                        ₦{Number(product.price).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </span>
                      {product.status === "published" && (
                        <Link
                          href={`/shop/${product.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-parchment/60 hover:text-gold hover:underline"
                        >
                          <ExternalLink size={11} />
                          <span>View in Store</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-parchment hover:border-gold/60 hover:text-gold transition-colors"
                    >
                      Edit Details
                    </Link>
                    <ProductActions productId={product.id} status={product.status} />
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-panel p-12 text-center">
                <ShoppingBag size={28} className="mx-auto text-parchment/30 mb-2" />
                <p className="text-sm text-parchment/60">
                  {search ? "No products match your filter." : "No digital products added yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Orders & Sales History */}
      {activeTab === "orders" && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-parchment/80">
              <thead className="border-b border-white/10 bg-white/5 uppercase tracking-wider text-[11px] text-parchment/60">
                <tr>
                  <th className="px-4 py-3.5">Reference / ID</th>
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Buyer</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Payment Status</th>
                  <th className="px-4 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 font-mono text-[11px] text-parchment">
                      {ord.paystack_reference || ord.id.substring(0, 10)}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-parchment">
                      {ord.digital_products?.title || "Digital Product"}
                    </td>
                    <td className="px-4 py-3.5 text-parchment/70">
                      {ord.buyer?.full_name || "Customer"}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-gold">
                      ₦{Number(ord.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          ord.status === "paid"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-parchment/50">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-parchment/50">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
