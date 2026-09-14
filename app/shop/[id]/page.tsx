import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BuyButton } from "@/components/shop/buy-button";

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
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Link href="/shop" className="text-sm text-parchment/60 hover:text-gold">
        ← Back to shop
      </Link>

      <div className="mt-8 grid gap-8 md:grid-cols-[280px_1fr]">
        {product.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.cover_image_url}
            alt={product.title}
            className="h-80 w-full rounded-md object-cover"
          />
        )}
        <div>
          <p className="text-xs uppercase tracking-widest text-gold">
            {product.type}
          </p>
          <h1 className="mt-2 font-display text-4xl text-parchment">
            {product.title}
          </h1>
          <p className="mt-3 font-display text-2xl text-parchment">
            ₦{Number(product.price).toFixed(2)}
          </p>
          <div className="mt-6">
            {user ? (
              <BuyButton productId={product.id} />
            ) : (
              <Link
                href="/register?next=/shop/"
                className="inline-block rounded-sm bg-crest-red px-6 py-2.5 text-sm font-medium text-white hover:bg-crest-red/90"
              >
                Create a free account to buy
              </Link>
            )}
          </div>
          <div className="mt-8 border-t border-parchment/10 pt-6">
            <p className="text-sm leading-relaxed text-parchment/70">
              {product.description ||
                "No description provided."}
            </p>
            <p className="mt-4 text-xs text-parchment/40">
              Licensed for your personal use with device-based activation.
              Your licence key is emailed to you after purchase and also lives
              in your Library.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}