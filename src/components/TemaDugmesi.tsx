"use client";

import { useTema } from "@/lib/tema";

/**
 * Gunes/ay degistirici. Iki sayfada da ayni bilesen kullanilir; gorunum
 * cagiran tarafin verdigi siniflarla belirlenir (CV'de belge paleti,
 * portfolyoda uzay paleti).
 */
export default function TemaDugmesi({
  className = "",
  etiket,
}: {
  className?: string;
  etiket: { light: string; dark: string };
}) {
  const { tema, degistir, hazir } = useTema();
  const koyu = tema === "dark";

  return (
    <button
      type="button"
      onClick={degistir}
      aria-label={koyu ? etiket.light : etiket.dark}
      title={koyu ? etiket.light : etiket.dark}
      className={className}
    >
      {/* Hazir olmadan once ikon secmiyoruz: sunucu ciktisi ile ilk
          istemci karesi arasinda uyusmazlik olmasin. */}
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {hazir && koyu ? (
          /* Gunes: acik temaya gec */
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          /* Ay: koyu temaya gec */
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </svg>
    </button>
  );
}
