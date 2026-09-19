import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://mla.org.ng";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/about",
        "/blog",
        "/courses",
        "/shop",
        "/events",
        "/institutions",
      ],
      disallow: [
        "/admin",
        "/admin/",
        "/dashboard",
        "/dashboard/",
        "/settings",
        "/sentry-example-page",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}