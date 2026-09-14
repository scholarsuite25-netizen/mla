import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="font-display text-2xl text-parchment">New product</h2>
      <ProductForm product={null} />
    </div>
  );
}