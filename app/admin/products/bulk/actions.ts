"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSuperAdmin } from "@/lib/auth-guard";
import { logAuditEvent } from "@/lib/audit";

const FILE_LIMIT = 50 * 1024 * 1024; // 50MB

const bulkItemSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  type: z.enum(["ebook", "software", "pdf", "lecture_slides", "training_manual", "monograph"]),
  price: z.coerce.number().min(0, "Price must be ₦0 or greater."),
  status: z.enum(["published", "draft"]).default("published"),
  description: z.string().trim().max(10000).default(""),
  excerpt: z.string().trim().max(5000).default(""),
});

export type BulkUploadResult = {
  success?: boolean;
  error?: string;
  productId?: string;
  title?: string;
};

export async function uploadSingleProductInBulkAction(
  formData: FormData
): Promise<BulkUploadResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided." };
  }

  if (file.size > FILE_LIMIT) {
    return { error: `File "${file.name}" exceeds the 50MB limit.` };
  }

  const parsed = bulkItemSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    type: String(formData.get("type") ?? "ebook"),
    price: Number(formData.get("price") ?? "0"),
    status: String(formData.get("status") ?? "published"),
    description: String(formData.get("description") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const admin = createAdminClient();

  // Ensure product-files bucket exists
  const { data: bucket } = await admin.storage.getBucket("product-files").catch(() => ({ data: null }));
  if (!bucket) {
    const { error: bErr } = await admin.storage.createBucket("product-files", { public: false });
    if (bErr) return { error: bErr.message };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `product-files/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadErr } = await admin.storage
    .from("product-files")
    .upload(storagePath, file, { contentType: file.type || "application/octet-stream", upsert: true });

  if (uploadErr) {
    return { error: `Storage upload failed: ${uploadErr.message}` };
  }

  // Insert into digital_products table
  const { data: newProduct, error: dbErr } = await admin
    .from("digital_products")
    .insert({
      title: parsed.data.title,
      type: parsed.data.type,
      price: parsed.data.price,
      status: parsed.data.status,
      description: parsed.data.description || `Digital deliverable for ${parsed.data.title}. Authored by S. B. Omotoso.`,
      preview_excerpt_text: parsed.data.excerpt || null,
      file_url: storagePath,
    })
    .select("id")
    .single();

  if (dbErr) {
    return { error: `Database insert failed: ${dbErr.message}` };
  }

  await logAuditEvent({
    action: "product.bulk_created",
    targetTable: "digital_products",
    targetId: newProduct.id,
    actorId: actor.id,
    actorEmail: actor.email,
    category: "shop",
    severity: "info",
    details: {
      title: parsed.data.title,
      type: parsed.data.type,
      price: parsed.data.price,
      file: file.name,
      storagePath,
    },
  });

  revalidatePath("/shop");
  revalidatePath("/admin/products");

  return {
    success: true,
    productId: newProduct.id,
    title: parsed.data.title,
  };
}
