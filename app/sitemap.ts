import type { MetadataRoute } from "next";
import { getMissionSlugs } from "@/lib/missions";
import { siteUrl } from "@/lib/site";

/** Served at /sitemap.xml, generated at build time. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  const staticRoutes = ["", "/missions", "/control"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const missionRoutes = getMissionSlugs().map((slug) => ({
    url: `${base}/missions/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...missionRoutes];
}
