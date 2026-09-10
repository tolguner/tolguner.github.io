import type { MetadataRoute } from "next";
import { SITE_URL, IS_PRODUCTION } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Preview deploy'lari herkese acik adreste calisiyor; arama motorlarina
  // production'in kopyasi olarak indexlenmemeleri icin tamamen kapatiliyor.
  if (!IS_PRODUCTION) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
