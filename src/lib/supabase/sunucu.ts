import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Giris yapmis kullanicinin oturumuyla calisan sunucu istemcisi.
 *
 * Notlar (bu API yakin zamanda degisti, bayat rehber cok):
 *  - `@supabase/auth-helpers-nextjs` DEPRECATED. `createServerComponentClient`
 *    gecen her ornek eski.
 *  - Yalnizca `getAll` / `setAll` var; tekil `get/set/remove` kaldirildi.
 *  - `cookies()` Next 15'te async; await edilmeli.
 *  - Server Component icinden cerez yazilamaz. Oturum tazeleme middleware'in
 *    isi; buradaki `setAll` bu yuzden sessizce yutuyor.
 */
export async function sunucuIstemcisi() {
  const cerezler = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return cerezler.getAll();
      },
      setAll(yazilacaklar) {
        try {
          for (const { name, value, options } of yazilacaklar) cerezler.set(name, value, options);
        } catch {
          // Server Component baglami: middleware zaten tazeliyor.
        }
      },
    },
  });
}
