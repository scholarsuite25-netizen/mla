"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Coins,
} from "lucide-react";
import { uploadSingleProductInBulkAction } from "@/app/admin/products/bulk/actions";

export interface QueueItem {
  id: string;
  file: File;
  title: string;
  type: "ebook" | "lecture_slides" | "training_manual" | "monograph" | "pdf" | "software";
  price: number;
  status: "published" | "draft";
  description: string;
  excerpt: string;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  errorMessage?: string;
  createdProductId?: string;
}

function guessProductType(fileName: string): QueueItem["type"] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pptx") || lower.endsWith(".ppt") || lower.includes("slide") || lower.includes("deck")) {
    return "lecture_slides";
  }
  if (lower.includes("manual") || lower.includes("handbook") || lower.includes("training") || lower.includes("prompt") || lower.includes("guide")) {
    return "training_manual";
  }
  if (lower.includes("monograph") || lower.includes("discourse") || lower.includes("remarks") || lower.endsWith(".docx")) {
    return "monograph";
  }
  if (lower.endsWith(".pdf") || lower.endsWith(".epub")) {
    return "ebook";
  }
  return "pdf";
}

function cleanTitleFromFilename(fileName: string): string {
  return fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\(\d+\)/g, "")
    .replace(/\s\d+$/, "")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function BulkUploader() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const newItems: QueueItem[] = Array.from(files).map((f) => {
      const guessedType = guessProductType(f.name);
      const cleanTitle = cleanTitleFromFilename(f.name);
      return {
        id: crypto.randomUUID(),
        file: f,
        title: cleanTitle,
        type: guessedType,
        price: 0, // default ₦0.00 Free as requested
        status: "published",
        description: `Official digital publication of "${cleanTitle}", authored by S. B. Omotoso.`,
        excerpt: "",
        uploadStatus: "idle",
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
  }

  function updateItem(id: string, updates: Partial<QueueItem>) {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function removeItem(id: string) {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }

  function setAllFree() {
    setQueue((prev) => prev.map((item) => ({ ...item, price: 0 })));
  }

  function setAllPublished() {
    setQueue((prev) => prev.map((item) => ({ ...item, status: "published" })));
  }

  function clearCompleted() {
    setQueue((prev) => prev.filter((item) => item.uploadStatus !== "success"));
  }

  async function handleStartBulkUpload() {
    if (isProcessing) return;
    setIsProcessing(true);

    const pendingItems = queue.filter((item) => item.uploadStatus !== "success");

    for (const item of pendingItems) {
      updateItem(item.id, { uploadStatus: "uploading", errorMessage: undefined });

      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("title", item.title);
        formData.append("type", item.type);
        formData.append("price", String(item.price));
        formData.append("status", item.status);
        formData.append("description", item.description);
        formData.append("excerpt", item.excerpt);

        const res = await uploadSingleProductInBulkAction(formData);

        if (res.success && res.productId) {
          updateItem(item.id, {
            uploadStatus: "success",
            createdProductId: res.productId,
          });
        } else {
          updateItem(item.id, {
            uploadStatus: "error",
            errorMessage: res.error || "Upload failed.",
          });
        }
      } catch (err) {
        updateItem(item.id, {
          uploadStatus: "error",
          errorMessage: err instanceof Error ? err.message : "Network error during upload.",
        });
      }
    }

    setIsProcessing(false);
  }

  const completedCount = queue.filter((i) => i.uploadStatus === "success").length;
  const errorCount = queue.filter((i) => i.uploadStatus === "error").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-gold hover:underline"
            >
              &larr; Back to Products
            </Link>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-parchment">
            Bulk Publication &amp; Material Uploader
          </h1>
          <p className="mt-1 text-xs text-parchment/60 max-w-2xl">
            Upload multiple books, keynote slides, and lecture notes simultaneously. Each file automatically becomes a distinct product in your catalog with configurable pricing, DRM watermarking, and instant store delivery.
          </p>
        </div>

        {queue.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              disabled={isProcessing}
              onClick={setAllFree}
              className="rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-2 text-xs font-semibold text-gold hover:bg-gold/20 transition-all flex items-center gap-1.5"
            >
              <Coins size={14} />
              <span>Set All to ₦0 (Free)</span>
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={setAllPublished}
              className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-parchment hover:bg-white/10 transition-all"
            >
              Set All Published
            </button>
          </div>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer relative overflow-hidden rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
          isDragging
            ? "border-gold bg-gold/10 scale-[1.01]"
            : "border-white/20 bg-[#120D09] hover:border-gold/50 hover:bg-[#16100B]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.pptx,.ppt,.epub,.txt"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold mb-4 border border-gold/20">
          <UploadCloud size={32} />
        </div>

        <h3 className="font-display text-lg font-bold text-parchment">
          Drop multiple books, lecture decks, or documents here
        </h3>
        <p className="mt-1 text-xs text-parchment/60">
          or click to browse from your device. Supports PDF, DOCX, PPTX, EPUB (up to 50MB per file).
        </p>

        <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-[11px] text-parchment/50">
          <span>Anti-Piracy DRM Enabled</span>
          <span>•</span>
          <span>Automatic Title Parsing</span>
          <span>•</span>
          <span>Free (₦0) Delivery Support</span>
        </div>
      </div>

      {/* Upload Queue Section */}
      {queue.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-lg font-bold text-parchment">
                Queue ({queue.length} {queue.length === 1 ? "Material" : "Materials"})
              </h2>
              {completedCount > 0 && (
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold">
                  {completedCount} Uploaded
                </span>
              )}
              {errorCount > 0 && (
                <span className="rounded-full bg-crest-red/20 text-crest-red border border-crest-red/30 px-2.5 py-0.5 text-xs font-semibold">
                  {errorCount} Failed
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="text-xs text-parchment/60 hover:text-parchment transition-colors"
                >
                  Clear Completed
                </button>
              )}
              <button
                type="button"
                disabled={isProcessing || queue.every((i) => i.uploadStatus === "success")}
                onClick={handleStartBulkUpload}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-crest-red to-amber-700 px-6 py-2.5 text-xs font-semibold text-white shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Uploading Batch ({completedCount}/{queue.length})…</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={15} />
                    <span>Upload &amp; Publish All Materials</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Queue Items List */}
          <div className="space-y-4">
            {queue.map((item, idx) => {
              const fileSizeKb = (item.file.size / 1024).toFixed(1);
              const fileSizeMb = (item.file.size / (1024 * 1024)).toFixed(2);
              const displaySize = item.file.size > 1024 * 1024 ? `${fileSizeMb} MB` : `${fileSizeKb} KB`;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-5 transition-all bg-[#120D09] space-y-4 ${
                    item.uploadStatus === "success"
                      ? "border-emerald-500/30 bg-emerald-950/10"
                      : item.uploadStatus === "error"
                      ? "border-crest-red/40 bg-crest-red/5"
                      : item.uploadStatus === "uploading"
                      ? "border-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                      : "border-white/10"
                  }`}
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-gold">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-parchment/80 truncate">
                          {item.file.name}
                        </p>
                        <p className="text-[11px] text-parchment/40">
                          {displaySize} • {item.file.type || "file"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {item.uploadStatus === "uploading" && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gold font-semibold">
                          <Loader2 size={14} className="animate-spin" />
                          <span>Uploading…</span>
                        </span>
                      )}
                      {item.uploadStatus === "success" && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                            <CheckCircle2 size={15} />
                            <span>Published</span>
                          </span>
                          {item.createdProductId && (
                            <Link
                              href={`/admin/products/${item.createdProductId}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gold hover:underline"
                            >
                              <span>Edit Product</span>
                              <ExternalLink size={11} />
                            </Link>
                          )}
                        </div>
                      )}
                      {item.uploadStatus === "error" && (
                        <span className="inline-flex items-center gap-1 text-xs text-crest-red font-semibold">
                          <AlertCircle size={15} />
                          <span>Error</span>
                        </span>
                      )}
                      {item.uploadStatus !== "uploading" && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg p-1.5 text-parchment/40 hover:bg-white/10 hover:text-crest-red transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {item.errorMessage && (
                    <div className="rounded-xl border border-crest-red/30 bg-crest-red/10 p-2.5 text-xs text-crest-red">
                      {item.errorMessage}
                    </div>
                  )}

                  {/* Editable Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                    {/* Title */}
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-medium text-parchment/60 mb-1">
                        Product Title (In Store)
                      </label>
                      <input
                        type="text"
                        disabled={item.uploadStatus === "success" || item.uploadStatus === "uploading"}
                        value={item.title}
                        onChange={(e) => updateItem(item.id, { title: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                        placeholder="Enter clear title"
                      />
                    </div>

                    {/* Category Type */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-medium text-parchment/60 mb-1">
                        Category / Type
                      </label>
                      <select
                        disabled={item.uploadStatus === "success" || item.uploadStatus === "uploading"}
                        value={item.type}
                        onChange={(e) => updateItem(item.id, { type: e.target.value as QueueItem["type"] })}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                      >
                        <option value="ebook">Published E-Book</option>
                        <option value="lecture_slides">Keynote / Lecture Slides</option>
                        <option value="training_manual">Training Manual / Guide</option>
                        <option value="monograph">Monograph / Address</option>
                        <option value="pdf">General Document</option>
                        <option value="software">Software / Code</option>
                      </select>
                    </div>

                    {/* Price */}
                    <div className="sm:col-span-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-parchment/60">
                          Price (₦ NGN)
                        </label>
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, { price: 0 })}
                          className={`text-[10px] font-semibold uppercase ${
                            item.price === 0 ? "text-emerald-400" : "text-gold hover:underline"
                          }`}
                        >
                          {item.price === 0 ? "✓ Free" : "Set Free (₦0)"}
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        disabled={item.uploadStatus === "success" || item.uploadStatus === "uploading"}
                        value={item.price}
                        onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-parchment focus:border-gold focus:outline-none"
                        placeholder="0 for Free"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-12">
                      <label className="block text-[11px] font-medium text-parchment/60 mb-1">
                        Store Description
                      </label>
                      <input
                        type="text"
                        disabled={item.uploadStatus === "success" || item.uploadStatus === "uploading"}
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-parchment focus:border-gold focus:outline-none"
                        placeholder="Brief overview of lecture or publication contents"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
