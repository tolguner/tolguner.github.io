import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const guncelleme = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: guncelleme, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/cv/`, lastModified: guncelleme, changeFrequency: "monthly", priority: 0.8 },
  ];
}
