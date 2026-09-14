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
  const fingerprint = searchParams.get("d") ?? "";
  if (!licenseId || !fingerprint) {
    return NextResponse.json({ error: "Missing download parameters." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: lic } = await admin
    .from("product_licenses")
    .select("license_key,buyer_id,product_id,digital_products(file_url,type,title)")
    .eq("id", licenseId)
    .single();

  if (!lic || String(lic.buyer_id) !== user.id) {
    return NextResponse.json({ error: "Licence not found for this account." }, { status: 404 });
  }

  const product = Array.isArray(lic.digital_products)
    ? lic.digital_products[0]
    : (lic.digital_products as { file_url: string | null; type: string; title: string } | null);
  if (!product?.file_url) {
    return NextResponse.json({ error: "Product file has not been uploaded yet." }, { status: 500 });
  }

  const activation = await allowActivation(licenseId, fingerprint);
  if (!activation.ok) {
    return NextResponse.json({ error: activation.reason }, { status: 403 });
  }

  let identity: { user: { email?: string } | null } | null = null;
  try {
    const res = await admin.auth.admin.getUserById(user.id);
    identity = res.data as { user: { email?: string } | null };
  } catch {
    identity = null;
  }
  const email = identity?.user?.email ?? user.email ?? "buyer";
  const { data: profile } = await admin.from("profiles").select("full_name").eq("id", user.id).single();
  const buyerName = profile?.full_name ?? email;

  const isPdf = /\.pdf$/i.test(product.file_url);

  if (isPdf) {
    const blob = await admin.storage
      .from("product-files")
      .download(product.file_url);
    const buf = blob.data;
    if (!buf) {
      return NextResponse.json({ error: "Could not fetch the product file." }, { status: 500 });
    }

    const watermarked = await watermarkPdf(new Uint8Array(await buf.arrayBuffer()), `${buyerName} | ${email}`);

    return new NextResponse(new Uint8Array(watermarked), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${product.title.replace(/[^a-z0-9._ -]/gi, "_")}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const { data: signed } = await admin.storage
    .from("product-files")
    .createSignedUrl(product.file_url, 300);
  if (!signed?.signedUrl) {
    return NextResponse.json({ error: "Could not generate download link." }, { status: 500 });
  }
  return NextResponse.redirect(signed.signedUrl);
}