import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowActivation } from "@/lib/licenses";
import { watermarkPdf } from "@/lib/pdf-watermark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const licenseId = searchParams.get("license") ?? "";
  const keyParam = searchParams.get("key") ?? "";
  const orderParam = searchParams.get("order") ?? "";
  const emailParam = searchParams.get("email") ?? "";
  const fingerprint = searchParams.get("d") || req.headers.get("x-forwarded-for")?.split(",")[0] || "device_web";

  if (!licenseId) {
    return NextResponse.json({ error: "Missing download parameters." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: lic } = await admin
    .from("product_licenses")
    .select("id,license_key,order_id,buyer_id,buyer_email,product_id,orders(buyer_name,buyer_email),digital_products(file_url,type,title)")
    .eq("id", licenseId)
    .single();

  if (!lic) {
    return NextResponse.json({ error: "Licence not found." }, { status: 404 });
  }

  const isOwner = Boolean(user && String(lic.buyer_id) === user.id);
  const isKeyValid = Boolean(keyParam && keyParam === lic.license_key);
  const isOrderValid = Boolean(orderParam && String(lic.order_id) === orderParam);
  const isEmailMatch = Boolean(emailParam && lic.buyer_email?.toLowerCase() === emailParam.toLowerCase());

  if (!isOwner && !isKeyValid && !isOrderValid && !isEmailMatch) {
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in or use the download link from your order confirmation." },
        { status: 401 }
      );
    }
    return NextResponse.json({ error: "Licence not found for this account." }, { status: 403 });
  }

  const product = Array.isArray(lic.digital_products)
    ? lic.digital_products[0]
    : (lic.digital_products as { file_url: string | null; type: string; title: string } | null);
  if (!product?.file_url) {
    return NextResponse.json({ error: "Product file has not been uploaded yet." }, { status: 500 });
  }

  const activation = await allowActivation(licenseId, fingerprint);
  if (!activation.ok) {
    console.warn(`[download] allowActivation: ${activation.reason}`);
  }

  let email = "buyer";
  let buyerName = "Valued Reader";
  const orderData = Array.isArray(lic.orders)
    ? lic.orders[0]
    : (lic.orders as { buyer_name?: string; buyer_email?: string } | null);

  if (user) {
    let identity: { user: { email?: string } | null } | null = null;
    try {
      const res = await admin.auth.admin.getUserById(user.id);
      identity = res.data as { user: { email?: string } | null };
    } catch {
      identity = null;
    }
    email = identity?.user?.email ?? user.email ?? orderData?.buyer_email ?? lic.buyer_email ?? "buyer";
    const { data: profile } = await admin.from("profiles").select("full_name").eq("id", user.id).single();
    buyerName = profile?.full_name ?? orderData?.buyer_name ?? email;
  } else {
    email = orderData?.buyer_email ?? lic.buyer_email ?? "buyer";
    buyerName = orderData?.buyer_name ?? "Valued Reader";
  }

  const isPdf = /\.pdf$/i.test(product.file_url);

  // Deterministic, safe attachment filename from the product title so users
  // see a friendly name regardless of the raw object key.
  const ext = (product.file_url.split(".").pop() ?? "file").toLowerCase();
  const downloadName =
    `${product.title.replace(/[^a-z0-9._ -]/gi, "_").replace(/\s+/g, "_").slice(0, 64) || "download"}.${ext}`;

  if (isPdf) {
    const blob = await admin.storage
      .from("product-files")
      .download(product.file_url);
    if (!blob.data) {
      return NextResponse.json({ error: "Could not fetch the product file." }, { status: 500 });
    }

    // If PDF is larger than 25MB, skip watermarking to prevent OOM.
    if (blob.data.size > 25 * 1024 * 1024) {
      console.warn(`[download] PDF ${product.file_url} is too large (${blob.data.size} bytes). Skipping watermark.`);
      const { data: signed } = await admin.storage
        .from("product-files")
        .createSignedUrl(product.file_url, 120, { download: downloadName });
      if (!signed?.signedUrl) {
        return NextResponse.json({ error: "Could not generate download link." }, { status: 500 });
      }
      return NextResponse.redirect(signed.signedUrl);
    }

    const watermarked = await watermarkPdf(new Uint8Array(await blob.data.arrayBuffer()), `${buyerName} | ${email}`);

    return new NextResponse(new Uint8Array(watermarked), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // Non-PDF deliverables: ownership + activation are validated above, then the
  // browser is redirected to a short-lived (120s) signed URL from the private
  // bucket with an attachment disposition — no persistent public link exists.
  const { data: signed } = await admin.storage
    .from("product-files")
    .createSignedUrl(product.file_url, 120, { download: downloadName });
  if (!signed?.signedUrl) {
    return NextResponse.json({ error: "Could not generate download link." }, { status: 500 });
  }
  return NextResponse.redirect(signed.signedUrl);
}