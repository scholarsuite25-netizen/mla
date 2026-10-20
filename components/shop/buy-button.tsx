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
          className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-gold-dark to-gold px-8 py-4 font-bold text-ink shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] cursor-pointer"
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
            className="flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-3 px-4 text-xs font-semibold text-parchment hover:border-gold/30 hover:bg-white/10 transition-all cursor-pointer"
          >
            {addedAnim || isAlreadyInCart ? (
              <>
                <Check size={14} className="text-green-400" />
                <span className="text-green-400">In Vault Cart</span>
              </>
            ) : (
              <>
                <Plus size={14} className="text-gold" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-full border border-gold/30 bg-gold/5 py-3 px-4 text-xs font-semibold text-gold hover:bg-gold/15 transition-all cursor-pointer"
          >
            <BookOpen size={14} />
            <span>Look Inside (Sample)</span>
          </button>
        </div>

        {/* WhatsApp Fast Order */}
        <a
          href={directWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-medium text-parchment/70 hover:bg-[#25D366]/10 hover:border-[#25D366]/40 hover:text-[#25D366] transition-all text-center"
        >
          <MessageCircle size={15} className="text-[#25D366]" />
          <span>Order directly via WhatsApp</span>
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