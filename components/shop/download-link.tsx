"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";

function getFingerprint(): string {
  try {
    let id = localStorage.getItem("mla_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("mla_device_id", id);
    }
    return id;
  } catch {
    return "browser_guest";
  }
}

export function DownloadLink({
  licenseId,
  licenseKey,
  orderId,
  buyerEmail,
  title,
  className,
  label = "Download Licensed Copy",
}: {
  licenseId: string;
  licenseKey?: string;
  orderId?: string;
  buyerEmail?: string;
  title?: string;
  className?: string;
  label?: string;
}) {
  const [fp, setFp] = useState<string>("browser");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFp(getFingerprint());
  }, []);

  const params = new URLSearchParams();
  params.set("license", licenseId);
  if (fp) params.set("d", fp);
  if (licenseKey) params.set("key", licenseKey);
  if (orderId) params.set("order", orderId);
  if (buyerEmail) params.set("email", buyerEmail);

  const downloadUrl = `/api/download?${params.toString()}`;

  function handleTriggerDownload() {
    if (downloading) return;
    setDownloading(true);
    setError(null);
    // Directly navigate to stream the file
    window.location.href = downloadUrl;
    setTimeout(() => {
      setDownloading(false);
    }, 4500);
  }

  return (
    <div className="space-y-1.5 inline-block">
      <button
        type="button"
        disabled={downloading}
        onClick={handleTriggerDownload}
        title={title ? `Download ${title}` : "Download file"}
        className={
          className ||
          "inline-flex items-center justify-center gap-2 rounded-xl bg-[#00D2FF] px-5 py-2.5 text-xs font-bold text-[#0A0E2A] shadow-md shadow-cyan-500/20 hover:bg-[#38BDF8] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
        }
      >
        {downloading ? (
          <>
            <Loader2 size={14} className="animate-spin text-[#0A0E2A]" />
            <span>Watermarking &amp; Downloading...</span>
          </>
        ) : (
          <>
            <Download size={14} />
            <span>{label}</span>
          </>
        )}
      </button>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
          <AlertCircle size={12} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}