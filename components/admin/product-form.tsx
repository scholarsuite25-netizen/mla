"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  saveProductAction,
  uploadProductFileAction,
  setProductFileAction,
  publishProductAction,
  deleteProductAction,
} from "@/app/admin/products/actions";
import { uploadCoverAction } from "@/app/admin/blog/actions";
import { Markdown } from "@/components/markdown";
import {
  ShoppingBag,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  X,
  Lock,
  ShieldCheck,
  Tag,
} from "lucide-react";

export function ProductForm({
  product,
}: {
  product?: {
    id: string;
    title: string;
    type: string;
    description: string;
    price: number;
    cover_image_url: string | null;
    file_url: string | null;
    status?: string;
  } | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(product?.title ?? "");
  const [type, setType] = useState(product?.type ?? "pdf");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [description, setDescription] = useState(product?.description ?? "");
  const [coverUrl, setCoverUrl] = useState(product?.cover_image_url ?? "");
  const [fileUrl, setFileUrl] = useState(product?.file_url ?? "");

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [descPreview, setDescPreview] = useState(false);

  const id = product?.id ?? null;
  const isPublished = product?.status === "published";

  async function handleCoverUpload(file: File | null) {
    if (!file) return;
    setUploadingCover(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const res = await uploadCoverAction(fd);
      setUploadingCover(false);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
      } else if (res.url) {
        setCoverUrl(res.url);
        setMsg({ type: "success", text: "Cover thumbnail uploaded successfully." });
      }
    });
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return;
    if (!id) {
      setMsg({
        type: "error",
        text: "Please create/save the product record first, then attach the secure digital file.",
      });
      return;
    }

    setUploadingFile(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("file", file);

    startTransition(async () => {
      const res = await uploadProductFileAction(fd);
      if (res.error) {
        setMsg({ type: "error", text: res.error });
        setUploadingFile(false);
        return;
      }

      if (res.path) {
        const saved = await setProductFileAction(id, res.path);
        if (saved?.error) {
          setMsg({ type: "error", text: saved.error });
        } else {
          setFileUrl(res.path);
          setMsg({
            type: "success",
            text: "Secure digital product asset uploaded and linked to Paystack delivery.",
          });
          router.refresh();
        }
      }
      setUploadingFile(false);
    });
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("type", type);
    fd.append("price", String(price));
    fd.append("description", description);
    fd.append("cover_image_url", coverUrl);

    startTransition(async () => {
      const res = await saveProductAction(id, fd);
      if (res?.error) {
        setMsg({ type: "error", text: res.error });
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div
          className={`flex items-center gap-2 rounded-2xl border p-4 text-xs font-medium ${
            msg.type === "error"
              ? "border-crest-red/30 bg-crest-red/10 text-crest-red"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {msg.type === "error" ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Core Details & Pricing */}
        <div className="rounded-3xl border border-white/10 bg-[#120D09] p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-gold" />
              <h3 className="font-display text-lg font-bold text-parchment">
                Product Information &amp; Pricing
              </h3>
            </div>
            <span className="text-xs text-parchment/40">WooCommerce Digital Asset</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                Product Title *
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MLA Executive Mentorship Field Manual &amp; Playbook"
                className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-3 text-sm font-semibold text-parchment focus:border-gold focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                  Product Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                >
                  <option value="pdf">PDF Blueprint / Curriculum Handout</option>
                  <option value="ebook">eBook / Digital Publication</option>
                  <option value="software">Software / Code / Desktop Tool</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-parchment/60 font-semibold">
                  Price (₦ NGN) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gold">
                    ₦
                  </span>
                  <input
                    type="number"
                    min={100}
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="5000"
                    className="w-full rounded-xl border border-white/10 bg-[#0E0A08] py-2.5 pl-8 pr-4 text-xs font-semibold text-parchment focus:border-gold focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-parchment/40 mt-1">
                  Processed via Paystack checkout (minimum ₦100). Complimentary access is issued via Manual Licence in the License Manager.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Secure Digital Download Asset & Watermark Protection */}
        <div className="rounded-3xl border border-white/10 bg-[#120D09] p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-gold" />
              <h3 className="font-display text-lg font-bold text-parchment">
                Digital Download Asset (Private Storage)
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <ShieldCheck size={12} /> Anti-Piracy DRM
            </span>
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-parchment/70 font-semibold">
                Current Linked File:
              </span>
              {fileUrl ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <CheckCircle2 size={13} /> {fileUrl.split("/").pop()}
                </span>
              ) : (
                <span className="text-xs text-amber-300 font-mono">No file uploaded yet</span>
              )}
            </div>

            <p className="text-xs text-parchment/60 leading-relaxed">
              Files are stored in private Cloudflare/Supabase encrypted storage. Upon purchase, PDF files are <strong>dynamically watermarked with the buyer&apos;s full name and email</strong> to prevent unauthorized distribution, while software/zips are delivered via signed temporary download URLs.
            </p>

            <div className="pt-2">
              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-[#0E0A08] p-6 text-center hover:border-gold/40 cursor-pointer transition">
                <UploadCloud size={24} className="text-gold mb-1" />
                <span className="text-xs font-semibold text-parchment">
                  {uploadingFile ? "Encrypting & Uploading File..." : "Upload New Product Asset File"}
                </span>
                <span className="text-[10px] text-parchment/40 mt-1">
                  PDF, Word, Excel, PowerPoint, EPUB, audio/video or ZIP up to 50MB
                </span>
                <input
                  type="file"
                  disabled={uploadingFile || !id}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md,.rtf,.epub,.zip,.mp3,.m4a,.wav,.mp4,.webm,.jpeg,.jpg,.png,.webp"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
              {!id && (
                <p className="text-[11px] text-amber-300/80 text-center mt-2">
                  * Save the product details first before attaching the digital file asset.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Cover Thumbnail & Showcase */}
        <div className="rounded-3xl border border-white/10 bg-[#120D09] p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-gold" />
              <h3 className="font-display text-lg font-bold text-parchment">
                Product Cover &amp; Artwork
              </h3>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-12 items-center">
            <div className="sm:col-span-8 space-y-3">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="Paste external cover image URL or upload below..."
                className="w-full rounded-xl border border-white/10 bg-[#0E0A08] p-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
              />

              <label className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-parchment hover:border-gold hover:text-gold cursor-pointer transition">
                <UploadCloud size={14} className="text-gold" />
                <span>{uploadingCover ? "Uploading artwork..." : "Upload Cover Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoverUpload(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="sm:col-span-4 flex justify-center">
              {coverUrl ? (
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverUrl} alt="Cover" className="h-32 w-28 object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverUrl("")}
                    className="absolute top-1 right-1 rounded-full bg-black/80 p-1 text-white/80 hover:text-crest-red"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex h-32 w-28 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/30 text-xs text-parchment/40">
                  No Cover
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Editorial Description (Markdown) */}
        <div className="rounded-3xl border border-white/10 bg-[#120D09] p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-display text-lg font-bold text-parchment">
              Product Description &amp; Specifications
            </h3>
            <button
              type="button"
              onClick={() => setDescPreview(!descPreview)}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1 text-xs text-parchment hover:text-gold transition"
            >
              {descPreview ? <Edit3 size={13} /> : <Eye size={13} />}
              <span>{descPreview ? "Edit Mode" : "Preview Mode"}</span>
            </button>
          </div>

          {descPreview ? (
            <div className="min-h-[220px] rounded-2xl border border-white/10 bg-black/40 p-5 text-xs sm:text-sm">
              <Markdown>{description || "*No description entered.*"}</Markdown>
            </div>
          ) : (
            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what's included in this digital download: table of contents, software requirements, license scope, and benefits in Markdown..."
              className="w-full rounded-2xl border border-white/10 bg-[#0E0A08] p-4 font-mono text-xs leading-relaxed text-parchment focus:border-gold focus:outline-none"
            />
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-gold to-amber-500 px-6 py-2.5 text-xs font-bold text-midnight hover:brightness-110 shadow disabled:opacity-50 transition"
            >
              {pending ? "Saving..." : id ? "Save Changes" : "Create Product Record"}
            </button>

            <Link
              href="/admin/products"
              className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-parchment/70 hover:text-parchment"
            >
              Back to Catalog
            </Link>
          </div>

          {id && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await publishProductAction(id);
                    if (res?.error) alert(res.error);
                    else router.refresh();
                  });
                }}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition shadow ${
                  isPublished
                    ? "border border-white/10 bg-white/5 text-parchment hover:border-crest-red hover:text-crest-red"
                    : "bg-gradient-to-r from-crest-red to-amber-700 text-white hover:brightness-110"
                }`}
              >
                {isPublished ? "Unpublish to Draft" : "Publish to Public Shop"}
              </button>

              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!confirm("Permanently delete this product from the store? The stored file will also be removed.")) return;
                  startTransition(async () => {
                    const res = await deleteProductAction(id);
                    if (res?.error) setMsg({ type: "error", text: res.error });
                  });
                }}
                className="rounded-xl border border-crest-red/30 p-2 text-crest-red hover:bg-crest-red hover:text-white transition"
                title="Delete Product"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}