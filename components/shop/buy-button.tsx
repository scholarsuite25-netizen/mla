"use client";

import { useState } from "react";
import { ShoppingBag, MessageCircle, BookOpen, Plus, Check } from "lucide-react";
import { CheckoutModal } from "@/components/shop/checkout-modal";
import { SamplePreviewModal } from "@/components/shop/sample-preview-modal";
import { useCart } from "@/lib/cart-context";
import type { StoreSettings } from "@/lib/store";

export function BuyButton({
  productId,
  title,
  price,
  type,
  coverImageUrl,
  bundleId,
  initialUser,
  bankSettings,
}: {
  productId?: string;
  bundleId?: string;
  title?: string;
  price?: number;
  type?: string;
  coverImageUrl?: string | null;
  initialUser?: {
    email?: string;
    name?: string;
  } | null;
  bankSettings?: StoreSettings | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  const { addItem, items } = useCart();
  const isAlreadyInCart = items.some((i) => i.id === (productId || bundleId));

  const productData = productId
    ? {
        id: productId,
        title: title ?? "Lecture Notes",
        price: price ?? 0,
        type: type ?? "pdf",
        cover_image_url: coverImageUrl ?? null,
      }
    : undefined;

  const bundleData = bundleId
    ? {
        id: bundleId,
        title: title ?? "Lecture Notes Bundle",
        price: price ?? 0,
        cover_image_url: coverImageUrl ?? null,
      }
    : undefined;

  const whatsappPhone = bankSettings?.whatsapp_number ?? "2348034710699";
  const itemTitle = title ?? "Lecture Notes";
  const formattedPrice = price ? `₦${Number(price).toLocaleString()}` : "";
  const directWaUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello Tintol Business Services! I want to order "${itemTitle}" (${formattedPrice}). Please share payment details.`
  )}`;

  function handleAddToCart() {
    addItem({
      id: productId || bundleId || crypto.randomUUID(),
      type: bundleId ? "bundle" : "product",
      title: itemTitle,
      price: price ?? 0,
      coverImageUrl,
      fileType: type ?? "pdf",
    });
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 2000);
  }

  return (
    <>
      <div className="space-y-3 w-full">
        {/* Main 1-Click Fast Checkout */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#00D2FF] px-8 py-4 font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] active:scale-[0.99] transition-all cursor-pointer text-xs sm:text-sm"
        >
          <ShoppingBag size={18} />
          <span>
            {price === 0 ? "Claim Free Download (₦0.00)" : `Get Instant Access (${formattedPrice})`}
          </span>
        </button>

        {/* Secondary Actions Row: Add to Cart & Look Inside */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 px-4 text-xs font-semibold text-slate-700 hover:border-cyan-400 hover:text-[#0284C7] transition-all cursor-pointer shadow-sm"
          >
            {addedAnim || isAlreadyInCart ? (
              <>
                <Check size={14} className="text-emerald-500" />
                <span className="text-emerald-600 font-bold">In Cart</span>
              </>
            ) : (
              <>
                <Plus size={14} className="text-[#0284C7]" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 px-4 text-xs font-semibold text-slate-700 hover:border-cyan-400 hover:text-[#0284C7] transition-all cursor-pointer shadow-sm"
          >
            <BookOpen size={14} className="text-[#0284C7]" />
            <span>Look Inside (Sample)</span>
          </button>
        </div>

        {/* WhatsApp Fast Order */}
        <a
          href={directWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold text-slate-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/30 transition-all text-center shadow-sm"
        >
          <MessageCircle size={15} className="text-emerald-600" />
          <span>Order directly via WhatsApp (+234 803 471 0699)</span>
        </a>
      </div>

      <CheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={productData}
        bundle={bundleData}
        initialUser={initialUser}
        bankSettings={bankSettings}
      />

      <SamplePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={itemTitle}
        price={price ?? 0}
        onBuyClick={() => setModalOpen(true)}
      />
    </>
  );
}