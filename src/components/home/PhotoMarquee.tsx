"use client";

import type { Photo } from "@/lib/gallery";
import type { Lang } from "@/content";

/**
 * Kendi kendine akan, sonsuz döngülü fotoğraf şeridi.
 * Liste iki kez basılır; şerit -%50 kaydırılınca dikişsiz başa döner.
 * Fareyle üstüne gelince durur, `prefers-reduced-motion` açıksa hiç akmaz.
 */
export default function PhotoMarquee({ photos, lang }: { photos: Photo[]; lang: Lang }) {
  if (!photos.length) return null;

  // Az sayıda fotoğrafta şerit ekranı doldurmayabilir; listeyi çoğaltıp doldururuz.
  const min = 8;
  const times = Math.max(1, Math.ceil(min / photos.length));
  const base = Array.from({ length: times }, () => photos).flat();
  const loop = [...base, ...base];
  const duration = Math.max(28, base.length * 6);

  return (
    <div
      className="marquee relative w-full overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
      }}
    >
      <ul className="marquee-track flex w-max gap-4" style={{ ["--dur" as string]: `${duration}s` }}>
        {loop.map((p, i) => (
          <li key={`${p.src}-${i}`} className="w-[clamp(8rem,17.33vh,13.34rem)] shrink-0" aria-hidden={i >= base.length}>
            <figure className="group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={(lang === "tr" ? p.tr : p.en) || ""}
                loading="lazy"
                className="h-[clamp(6rem,13vh,10rem)] w-full rounded-xl border border-white/10 object-cover transition group-hover:border-white/30"
              />
              {(lang === "tr" ? p.tr : p.en) && (
                <figcaption title={(lang === "tr" ? p.tr : p.en) || undefined} className="mt-2 line-clamp-2 text-center text-[11.5px] leading-snug text-white/45 transition group-hover:text-white/70">
                  {lang === "tr" ? p.tr : p.en}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
