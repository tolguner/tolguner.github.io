/**
 * Sitenin mutlak adresi. Onceden 5+ yerde "https://tolguner.me" sabit yaziliydi;
 * Vercel'de preview deploy'lari farkli adreste calistigi icin (ve oralarda
 * production canonical'i yaymamak icin) tek yerden cozuluyor.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

/** Yalnizca production deploy'unda true; preview ve yerelde false. */
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production";
