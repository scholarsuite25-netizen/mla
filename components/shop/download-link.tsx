"use client";

import { useEffect, useState } from "react";

function deviceFingerprint(): string {
  try {
    let id = localStorage.getItem("mla_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("mla_device_id", id);
    }
    return id;
  } catch {
    // Never fall back to a shared constant: a fixed value would collapse every
    // privacy-constrained user onto the same fingerprint and defeat seat counting.
    return crypto.randomUUID();
  }
}

export function DownloadLink({
  licenseId,
  title,
}: {
  licenseId: string;
  title: string;
}) {
  const [fp, setFp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFp(deviceFingerprint());
  }, []);

  if (!fp) return null;
  const fingerprint = fp;

  async function handleDownload(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const url = `/api/download?license=${licenseId}&d=${encodeURIComponent(fingerprint)}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        let message = "Download failed. Please try again.";
        try {
          const body = (await res.json()) as { error?: string };
          if (body.error) message = body.error;
        } catch {
          // non-JSON response body; keep the generic message
        }
        setError(message);
        setBusy(false);
        return;
      }
      // Success — hand over to the browser so the server can stream the
      // watermarked PDF or redirect to the signed URL.
      window.location.href = url;
    } catch {
      setError("Download unavailable. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <a
        href={`/api/download?license=${licenseId}&d=${encodeURIComponent(fp)}`}
        onClick={(e) => {
          if (!window.confirm("This will consume one device activation. Continue?")) return;
          handleDownload(e);
        }}
        className="rounded-sm bg-crest-red px-4 py-2 text-xs font-medium text-white hover:bg-crest-red/90 disabled:opacity-60"
      >
        {busy ? "Preparing download…" : `Download ${title}`}
      </a>
      {error && <p className="mt-2 text-xs text-crest-red">{error}</p>}
    </div>
  );
}