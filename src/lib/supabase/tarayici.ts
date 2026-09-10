"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Tarayici istemcisi. Oturumu cerezlerde tutar; middleware ayni cerezleri
 * tazeledigi icin sunucu ve istemci ayni oturumu gorur.
 */
export function tarayiciIstemcisi() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
