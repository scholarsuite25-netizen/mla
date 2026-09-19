"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSuperAdmin } from "@/lib/auth-guard";
import { logAuditEvent } from "@/lib/audit";

export type ActionResult = { error?: string };

const productSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  type: z.enum(["ebook", "software", "pdf"]),
  description: z.string().trim().max(10000, "Description is too long."),
  price: z.coerce.number().min(100, "Minimum price is ₦100 — Paystack rejects ₦0. Use license manual issue for complimentary access."),
  cover_image_url: z.string().trim().max(2000),
});

export async function saveProductAction(
  productId: string | null,
  formData: FormData
): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const parsed = productSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    type: String(formData.get("type") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: Number(formData.get("price") ?? "0"),
    cover_image_url: String(formData.get("cover_image_url") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const admin = createAdminClient();

  const productData = {
    title: parsed.data.title,
    type: parsed.data.type,
    description: parsed.data.description,
    price: parsed.data.price,
    cover_image_url: parsed.data.cover_image_url || null,
  };

  if (productId) {
    const { error } = await admin
      .from("digital_products")
      .update(productData)
      .eq("id", productId);
    if (error) return { error: error.message };

    await logAuditEvent({
      action: "product.updated",
      targetTable: "digital_products",
      targetId: productId,
      actorId: actor.id,
      actorEmail: actor.email,
      category: "shop",
      severity: "info",
      details: { title: productData.title, type: productData.type, price: productData.price },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");
    redirect(`/admin/products/${productId}`);
  }

  const row = {
    ...productData,
    status: "draft" as const,
  };

  const { data, error } = await admin
    .from("digital_products")
    .insert(row)
    .select("id")
    .single();
  if (error) return { error: error.message };

  await logAuditEvent({
    action: "product.created",
    targetTable: "digital_products",
    targetId: data!.id,
    actorId: actor.id,
    actorEmail: actor.email,
    category: "shop",
    severity: "info",
    details: { title: row.title, type: row.type, price: row.price },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${data!.id}`);
}

export async function publishProductAction(productId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("digital_products")
    .select("id,title,status,file_url")
    .eq("id", productId)
    .single();
  if (!product) return { error: "Product not found." };

  if (product.status === "draft" && !product.file_url) {
    return { error: "Upload the product file before publishing." };
  }

  const newStatus = product.status === "published" ? "draft" : "published";

  await admin.from("digital_products").update({
    status: newStatus,
  }).eq("id", productId);

  await logAuditEvent({
    action: newStatus === "published" ? "product.published" : "product.unpublished",
    targetTable: "digital_products",
    targetId: productId,
    actorId: actor.id,
    actorEmail: actor.email,
    category: "shop",
    severity: "notice",
    details: { title: product.title, status: newStatus },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return {};
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const admin = createAdminClient();

  const { data: product } = await admin
    .from("digital_products")
    .select("id,title,file_url")
    .eq("id", productId)
    .maybeSingle();
  if (!product) return { error: "Product not found." };

  // Never allow deleting a product with sales/licence history: orders hold an
  // FK (no cascade) so this protects revenue records and issued DRM keys.
  const { count: orderCount } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  if (orderCount && orderCount > 0) {
    return {
      error:
        "This product has orders and licences on record. Unpublish it to hide it from the shop instead of deleting.",
    };
  }

  // Remove the stored asset from private storage so no orphaned blob remains.
  if (product.file_url) {
    const { error: rmErr } = await admin.storage
      .from("product-files")
      .remove([product.file_url]);
    if (rmErr) {
      return { error: `Could not remove the stored file: ${rmErr.message}` };
    }
  }

  const { error } = await admin.from("digital_products").delete().eq("id", productId);
  if (error) return { error: error.message };

  await logAuditEvent({
    action: "product.deleted",
    targetTable: "digital_products",
    targetId: productId,
    actorId: actor.id,
    actorEmail: actor.email,
    category: "shop",
    severity: "warning",
    details: { title: product.title },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

const FILE_LIMIT = 50 * 1024 * 1024; // 50 MB
const allowedFileTypes = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/rtf",
  // Study aids
  "application/epub+zip",
  "application/zip",
  // Audio/video
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "video/mp4",
  "video/webm",
  // Images (for workbook covers/guides)
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Product file upload — private bucket, server-validated type + size (§9).
export async function uploadProductFileAction(formData: FormData): Promise<{ path?: string; error?: string }> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "No file received." };
  if (file.size > FILE_LIMIT) return { error: "File must be 50MB or smaller." };
  if (!allowedFileTypes.includes(file.type)) {
    return {
      error:
        "Unsupported file type. Only PDFs, Word, Excel, PowerPoint, CSV, TXT, Markdown, EPUB, archives, audio/video and images are allowed.",
    };
  }

  const admin = createAdminClient();
  const { data: bucket } = await admin.storage.getBucket("product-files").catch(() => ({ data: null }));
  if (!bucket) {
    const { error: bErr } = await admin.storage.createBucket("product-files", { public: false });
    if (bErr) return { error: bErr.message };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `product-files/${crypto.randomUUID()}-${safeName}`;
  const { error } = await admin.storage
    .from("product-files")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: error.message };
  return { path };
}

// Admin records the file path produced by uploadProductFileAction.
export async function setProductFileAction(
  productId: string,
  fileUrl: string
): Promise<ActionResult> {
  try {
    await assertSuperAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized." };
  }

  const parsed = z.string().trim().min(1).safeParse(fileUrl);
  if (!parsed.success) return { error: "Invalid file path." };
  const admin = createAdminClient();
  const { error } = await admin
    .from("digital_products")
    .update({ file_url: parsed.data })
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/products/${productId}`);
  return {};
}