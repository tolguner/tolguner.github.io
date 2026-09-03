"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Photo } from "@/lib/gallery";
import type { Lang } from "@/content";

const HIZ = 42; // px/sn — kendiliğinden akış hızı
const SURTUNME = 0.94; // bırakınca hızın sönümlenme katsayısı (60 fps başına)

/**
 * Sonsuz döngüde akan fotoğraf şeridi.
 * Liste iki kez basılır; şerit yarı genişlik kadar kayınca dikişsiz başa döner.
 * Fareyle (ya da parmakla) sağa-sola sürüklenebilir; bırakıldığında savrulma
 * hızıyla devam edip kendi akışına döner. `prefers-reduced-motion` açıksa
 * kendiliğinden akmaz, yalnızca sürüklenir.
 */
export default function PhotoMarquee({ photos, lang }: { photos: Photo[]; lang: Lang }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const offset = useRef(0);
  const hiz = useRef(0); // sürükleme sonrası kalan hız (px/sn)
  const suruklu = useRef(false);
  const sonX = useRef(0);
  const sonT = useRef(0);

  const hepsi = photos.length;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let onceki = performance.now();

    const adim = (t: number) => {
      const dt = Math.min((t - onceki) / 1000, 0.05); // sekme arka plandayken sıçramasın
      onceki = t;
      const yari = el.scrollWidth / 2;

      if (yari > 0) {
        if (!suruklu.current) {
          const taban = azalt ? 0 : -HIZ;
          offset.current += (taban + hiz.current) * dt;
          hiz.current *= Math.pow(SURTUNME, dt * 60);
          if (Math.abs(hiz.current) < 1) hiz.current = 0;
        }
        // dikişsiz döngü
        if (offset.current <= -yari) offset.current += yari;
        else if (offset.current > 0) offset.current -= yari;

        el.style.transform = `translate3d(${offset.current}px, 0, 0)`;
      }
      raf = requestAnimationFrame(adim);
    };

    raf = requestAnimationFrame(adim);
    return () => cancelAnimationFrame(raf);
  }, [hepsi]);

  const basla = useCallback((e: React.PointerEvent) => {
    suruklu.current = true;
    hiz.current = 0;
    sonX.current = e.clientX;
    sonT.current = performance.now();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* bazı tarayıcılarda yakalama reddedilebilir; sürükleme yine çalışır */
    }
  }, []);

  const hareket = useCallback((e: React.PointerEvent) => {
    if (!suruklu.current) return;
    const simdi = performance.now();
    const dx = e.clientX - sonX.current;
    const dt = simdi - sonT.current;
    offset.current += dx;
    if (dt > 0) hiz.current = (dx / dt) * 1000; // px/sn
    sonX.current = e.clientX;
    sonT.current = simdi;
  }, []);

  const bitir = useCallback((e: React.PointerEvent) => {
    if (!suruklu.current) return;
    suruklu.current = false;
    // çok eski bir hareketin hızını taşımayalım
    if (performance.now() - sonT.current > 120) hiz.current = 0;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* yakalama zaten bırakılmış olabilir */
    }
  }, []);

  if (!hepsi) return null;

  // Az fotoğrafta şerit ekranı doldurmayabilir; listeyi çoğaltırız.
  const enAz = 8;
  const kat = Math.max(1, Math.ceil(enAz / hepsi));
  const taban = Array.from({ length: kat }, () => photos).flat();
  const dongu = [...taban, ...taban];

  return (
    <div
      className="marquee relative w-full cursor-grab overflow-hidden active:cursor-grabbing"
      style={{
        maskImage: "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
        touchAction: "pan-y",
      }}
      onPointerDown={basla}
      onPointerMove={hareket}
      onPointerUp={bitir}
      onPointerCancel={bitir}
    >
      <ul ref={trackRef} className="flex w-max select-none gap-5 will-change-transform">
        {dongu.map((p, i) => (
          <li key={`${p.src}-${i}`} className="w-[clamp(8rem,18.67vh,14.5rem)] shrink-0" aria-hidden={i >= taban.length}>
            <figure className="group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={(lang === "tr" ? p.tr : p.en) || ""}
                loading="lazy"
                draggable={false}
                className="h-[clamp(6rem,14vh,10.875rem)] w-full rounded-xl border border-white/10 object-cover transition group-hover:border-white/30"
              />
              {(lang === "tr" ? p.tr : p.en) && (
                <figcaption
                  title={(lang === "tr" ? p.tr : p.en) || undefined}
                  className="mt-2 line-clamp-2 text-center text-[12px] leading-snug text-white/45 transition group-hover:text-white/70"
                >
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
