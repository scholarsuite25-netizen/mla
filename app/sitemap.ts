import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://mla.org.ng";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: posts }, { data: courses }, { data: products }, { data: events }] =
    await Promise.all([
      supabase
        .from("blog_posts")
        .select("slug,updated_at")
        .eq("status", "published"),
      supabase
        .from("courses")
        .select("id,updated_at")
        .eq("status", "published"),
      supabase
        .from("digital_products")
        .select("id,updated_at")
        .eq("status", "published"),
      supabase
        .from("events")
        .select("id,created_at")
        .gte("start_time", new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()),
    ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/about`, lastModified: new Date() },
    { url: `${SITE_URL}/blog`, lastModified: new Date() },
    { url: `${SITE_URL}/courses`, lastModified: new Date() },
    { url: `${SITE_URL}/shop`, lastModified: new Date() },
    { url: `${SITE_URL}/events`, lastModified: new Date() },
    { url: `${SITE_URL}/institutions`, lastModified: new Date() },
    { url: `${SITE_URL}/register`, lastModified: new Date() },
    { url: `${SITE_URL}/login`, lastModified: new Date() },
  ];

  return [
    ...staticRoutes,
    ...(posts ?? []).map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...(courses ?? []).map((c) => ({
      url: `${SITE_URL}/courses/${c.id}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(products ?? []).map((d) => ({
      url: `${SITE_URL}/shop/${d.id}`,
      lastModified: new Date(d.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(events ?? []).map((e) => ({
      url: `${SITE_URL}/events/${e.id}`,
      lastModified: new Date(e.created_at),
      changeFrequency: "daily" as const,
      priority: 0.5,
    })),
  ];
}