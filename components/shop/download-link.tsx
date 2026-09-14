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
    return "browser";
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

  useEffect(() => {
    setFp(deviceFingerprint());
  }, []);

  if (!fp) return null;

  return (
    <div>
      <a
        href={`/api/download?license=${licenseId}&d=${encodeURIComponent(fp)}`}
        onClick={(e) => {
          // Fallback if the activation was rejected (blocked, revoked…).
          const ok = window.confirm(
            "Download links consume one device activation. Continue?"
          );
          if (!ok) e.preventDefault();
        }}
        onError={() => setError("Download unavailable.")}
        className="rounded-sm bg-crest-red px-4 py-2 text-xs font-medium text-white hover:bg-crest-red/90"
      >
        Download {title}
      </a>
      {error && <p className="mt-2 text-xs text-crest-red">{error}</p>}
    </div>
  );
}