/**
 * Galeri artik `public/galeri/` klasorunden degil, Supabase'ten okunuyor
 * (bkz. `src/lib/content/read.ts`). Bu dosya eski cagri noktalarini ayakta
 * tutan ince bir yeniden disa aktarim.
 *
 * Klasordeki dosyalar bilerek duruyor: seed onlari kaynak olarak kullaniyor.
 */
export type { Photo } from "./content/types";
export { getPhotos } from "./content/read";
