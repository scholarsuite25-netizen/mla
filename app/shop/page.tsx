import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  title: string;
  type: string;
  description: string;
  price: number;
  cover_image_url: string | null;
};

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("digital_products")
    .select("id,title,type,description,price,cover_image_url")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-crest-red">{error.message}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-4xl text-parchment">Shop</h1>
      <p className="mt-3 text-parchment/70">
        Ebooks, PDFs, and software from MLA. Every purchase is delivered with
        a signed licence key for your personal use.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(products as unknown as ProductRow[] | null)?.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.id}`}
            className="group rounded-md border border-parchment/10 bg-panel p-5 transition-colors hover:border-gold/50"
          >
            {product.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.cover_image_url}
                alt={product.title}
                className="mb-4 h-40 w-full rounded-sm object-cover"
              />
            )}
            <p className="text-xs uppercase tracking-widest text-gold">
              {product.type}
            </p>
            <h2 className="mt-1 font-display text-xl text-parchment group-hover:text-gold">
              {product.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm text-parchment/60">
              {product.description}
            </p>
            <p className="mt-4 font-display text-lg text-parchment">
              ₦{Number(product.price).toFixed(2)}
            </p>
          </Link>
        ))}
        {(!products || products.length === 0) && (
          <p className="text-parchment/60">
            The shop opens soon — items will appear here once available.
          </p>
        )}
      </div>
    </div>
  );
}