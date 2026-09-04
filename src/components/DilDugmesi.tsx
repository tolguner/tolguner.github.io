"use client";

import type { Lang } from "@/content";

/**
 * Dil degistirici — gunes/ay dugmesiyle ayni olcude yuvarlak dugme.
 * Uzerinde gecilecek dil yazar (TR'deyken "EN"), tema dugmesindeki
 * "hedefi goster" mantigiyla ayni. Gorunum cagiran tarafin verdigi
 * siniflarla belirlenir (CV'de belge paleti, portfolyoda uzay paleti).
 */
export default function DilDugmesi({
  lang,
  setLang,
  className = "",
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  className?: string;
}) {
  const hedef: Lang = lang === "tr" ? "en" : "tr";
  const ad = hedef === "tr" ? "Türkçe" : "English";

  return (
    <button type="button" onClick={() => setLang(hedef)} aria-label={ad} title={ad} className={className}>
      <span className="text-[11px] font-semibold uppercase tracking-wide">{hedef}</span>
    </button>
  );
}
