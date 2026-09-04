import type { MetadataRoute } from "next";

// output: "export" ile rota statik uretilmeli
export const dynamic = "force-static";

/** Statik export'ta /sitemap.xml olarak yazilir. */
export default function sitemap(): MetadataRoute.Sitemap {
  const guncelleme = new Date();
  return [
    { url: "https://tolguner.me/", lastModified: guncelleme, changeFrequency: "monthly", priority: 1 },
    { url: "https://tolguner.me/cv/", lastModified: guncelleme, changeFrequency: "monthly", priority: 0.8 },
  ];
}
