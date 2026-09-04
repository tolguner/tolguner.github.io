import type { MetadataRoute } from "next";

// output: "export" ile rota statik uretilmeli
export const dynamic = "force-static";

/** Statik export'ta /robots.txt olarak yazilir. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://tolguner.me/sitemap.xml",
  };
}
