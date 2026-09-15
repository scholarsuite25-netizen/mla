import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MLA — Mentorship & Leadership Academy",
    short_name: "MLA Academy",
    description:
      "Learn, mentor, and lead across Nigerian higher institutions and independent communities. AI Literacy, vibe coding, 1-on-1 mentorship, and digital resources.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0806",
    theme_color: "#0A0806",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
