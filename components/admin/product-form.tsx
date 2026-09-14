"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveProductAction, uploadProductFileAction, setProductFileAction } from "@/app/admin/products/actions";
import { uploadCoverAction } from "@/app/admin/blog/actions";

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
  } | null;
}) {
  const [pending] = useTransition();
  const [coverUrl, setCoverUrl] = useState(product?.cover_image_url ?? "");
  const [fileUrl, setFileUrl] = useState(product?.file_url ?? "");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        const res = await saveProductAction(product?.id ?? null, formData);
        if (res?.error) alert(res.error);
        else router.refresh();
      }}
      className="mt-8 space-y-5"
    >
      <input type="hidden" name="cover_image_url" value={coverUrl} />

      <div>
        <label htmlFor="title" className="mb-1 block text-sm text-parchment/70">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          defaultValue={product?.title}
          className="w-full rounded-sm border border-parchment/10 bg-panel px-3 py-2 text-parchment outline-none focus:border-gold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="mb-1 block text-sm text-parchment/70">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={product?.type ?? "pdf"}
            className="w-full rounded-sm border border-parchment/10 bg-panel px-3 py-2 text-parchment outline-none focus:border-gold"
          >
            <option value="pdf">PDF</option>
            <option value="ebook">Ebook</option>
            <option value="software">Software</option>
          </select>
        </div>
        <div>
          <label htmlFor="price" className="mb-1 block text-sm text-parchment/70">
            Price (₦)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={product?.price ?? "0"}
            className="w-full rounded-sm border border-parchment/10 bg-panel px-3 py-2 text-parchment outline-none focus:border-gold"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm text-parchment/70"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={8}
          maxLength={10000}
          defaultValue={product?.description}
          className="w-full rounded-sm border border-parchment/10 bg-panel px-3 py-2 text-parchment outline-none focus:border-gold"
        />
      </div>

      <div className="rounded-md border border-parchment/10 bg-panel/50 p-4">
        <label htmlFor="cover-upload" className="block text-sm text-parchment/70">
          Cover image (optional)
        </label>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-parchment/80">
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("file", file);
                const res = await uploadCoverAction(fd);
                if (res.error) {
                  setMsg(res.error);
                } else if (res.url) {
                  setCoverUrl(res.url);
                  setMsg("Cover uploaded.");
                }
                e.target.value = "";
              }}
              className="text-xs text-parchment/60 file:mr-2 file:rounded-sm file:border-0 file:bg-panel file:px-2 file:py-1 file:text-xs file:text-parchment"
            />
          </div>
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="Cover" className="h-16 w-12 rounded-sm object-cover" />
          )}
        </div>
      </div>

      <div className="rounded-md border border-parchment/10 bg-panel/50 p-4">
        <label htmlFor="file-upload" className="block text-sm text-parchment/70">
          Product file{" "}
          <span className="text-parchment/50">(stored privately, max 50MB)</span>
        </label>
        {fileUrl && (
          <p className="mt-2 truncate text-xs text-gold">{fileUrl.split("/").pop()}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-sm text-parchment/80">
          <input
            id="file-upload"
            type="file"
            disabled={uploadingFile}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (!product?.id) {
                setMsg("Save the product first, then upload its file.");
                e.target.value = "";
                return;
              }
              setUploadingFile(true);
              const fd = new FormData();
              fd.append("file", file);
              const res = await uploadProductFileAction(fd);
              if (res.error) {
                setMsg(res.error);
              } else if (res.path) {
                const saved = await setProductFileAction(product.id, res.path);
                if (saved?.error) {
                  setMsg(saved.error);
                } else {
                  setFileUrl(res.path);
                  setMsg("Product file uploaded.");
                }
              }
              setUploadingFile(false);
              e.target.value = "";
            }}
            className="text-xs text-parchment/60 file:mr-2 file:rounded-sm file:border-0 file:bg-panel file:px-2 file:py-1 file:text-xs file:text-parchment"
          />
          {uploadingFile && <span className="text-xs text-parchment/50">Uploading…</span>}
        </div>
      </div>

      {msg && <p className="text-sm text-parchment/70">{msg}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-crest-red px-6 py-2.5 text-sm font-medium text-white hover:bg-crest-red/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
        <Link
          href="/admin/products"
          className="text-sm text-parchment/60 hover:text-gold"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}