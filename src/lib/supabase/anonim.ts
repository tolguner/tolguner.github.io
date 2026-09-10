import { createClient } from "@supabase/supabase-js";

/**
 * Herkese acik okumalar icin istemci. Cerez baglamiyor; bu yuzden ciktisi
 * kullaniciya gore degismez ve `unstable_cache` ile guvenle sarilabilir.
 *
 * Publishable key tarayiciya da gonderilebilen, gizli olmayan bir degerdir;
 * guvenligi saglayan sey RLS politikalari (bkz. supabase/migrations).
 */
export function anonimIstemci() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY tanimli degil");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Public kovadaki bir dosyanin kalici adresi. */
export function depolamaAdresi(kova: string, yol: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${kova}/${yol}`;
}
