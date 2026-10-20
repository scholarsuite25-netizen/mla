"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";

function deviceFingerprint(): string {
  try {
    let id = localStorage.getItem("mla_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("mla_device_id", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function DownloadLink({
  licenseId,
  licenseKey,
  title,
  className,
  label = "Download Licensed Copy",
}: {
  licenseId: string;
  licenseKey?: string;
  title: string;
  className?: string;
  label?: string;
}) {
  const [fp, setFp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFp(deviceFingerprint());
  }, []);

  if (!fp) {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-parchment/40">
        <Loader2 size={13} className="animate-spin" />
        <span>Preparing download security...</span>
      </div>
    );
  }

  const fingerprint = fp;
  const keyQuery = licenseKey ? `&key=${encodeURIComponent(licenseKey)}` : "";
  const downloadUrl = `/api/download?license=${licenseId}&d=${encodeURIComponent(fingerprint)}${keyQuery}`;

  async function handleDownload(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(downloadUrl, { credentials: "include" });
      if (!res.ok) {
        let message = "Download failed. Please try again.";
        try {
          const body = (await res.json()) as { error?: string };
          if (body.error) message = body.error;
        } catch {}
        setError(message);
        setBusy(false);
        return;
      }
      // Success — stream file to browser
      window.location.href = downloadUrl;
      setTimeout(() => setBusy(false), 3000);
    } catch {
      setError("Download unavailable. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <a
        href={downloadUrl}
        onClick={(e) => {
          if (!window.confirm(`Download "${title}"? This will authenticate your device licence and apply forensic anti-piracy watermarking.`)) return;
          handleDownload(e);
        }}
        className={
          className ||
          "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-crest-red to-amber-700 px-5 py-3 text-xs font-semibold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
        }
      >
        {busy ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>Watermarking &amp; Preparing File...</span>
          </>
        ) : (
          <>
            <Download size={15} />
            <span>{label}</span>
          </>
        )}
      </a>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-crest-red font-medium">
          <AlertCircle size={12} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}