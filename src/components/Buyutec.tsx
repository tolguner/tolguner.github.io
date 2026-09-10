"use client";

import { useCallback, useEffect, useRef } from "react";

export type BuyutecFoto = { src: string; baslik?: string };

/**
 * Fotografi tam ekranda gosteren katman. Ana sayfadaki serit ve yonetim
 * panelindeki galeri ayni bileseni kullaniyor.
 *
 * Erisilebilirlik: acilinca odak kapatma dugmesine tasinir, Esc kapatir, ok
 * tuslari gezinir, kapaninca odak tetikleyen ogeye geri doner.
 */
export default function Buyutec({
  fotograflar,
  sira,
  onKapat,
  onSira,
}: {
  fotograflar: BuyutecFoto[];
  /** Acik fotografin sirasi; null ise katman kapali. */
  sira: number | null;
  onKapat: () => void;
  onSira: (yeni: number) => void;
}) {
  const kapatRef = useRef<HTMLButtonElement>(null);
  const oncekiOdak = useRef<HTMLElement | null>(null);

  const acik = sira !== null && fotograflar.length > 0;
  const toplam = fotograflar.length;

  const gez = useCallback(
    (adim: number) => {
      if (sira === null) return;
      onSira((sira + adim + toplam) % toplam);
    },
    [sira, toplam, onSira],
  );

  useEffect(() => {
    if (!acik) return;

    oncekiOdak.current = document.activeElement as HTMLElement | null;
    kapatRef.current?.focus();

    // Arkadaki sayfa kaymasin.
    const eskiTasma = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const tus = (e: KeyboardEvent) => {
      if (e.key === "Escape") onKapat();
      else if (e.key === "ArrowRight") gez(1);
      else if (e.key === "ArrowLeft") gez(-1);
    };
    window.addEventListener("keydown", tus);

    return () => {
      window.removeEventListener("keydown", tus);
      document.body.style.overflow = eskiTasma;
      oncekiOdak.current?.focus?.();
    };
  }, [acik, gez, onKapat]);

  if (!acik) return null;

  const foto = fotograflar[sira];
  if (!foto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={foto.baslik || "Fotoğraf"}
      onClick={onKapat}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-4 bg-black/85 p-4 backdrop-blur-sm sm:p-8"
    >
      <button
        ref={kapatRef}
        type="button"
        onClick={onKapat}
        aria-label="Kapat"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition hover:border-white/60 hover:text-white"
      >
        ✕
      </button>

      {toplam > 1 && (
        <>
          <Ok yon="sol" onClick={() => gez(-1)} />
          <Ok yon="sag" onClick={() => gez(1)} />
        </>
      )}

      {/* Katmana tiklayinca kapaniyor; goruntunun kendisi bunu yutmali. */}
      <figure onClick={(e) => e.stopPropagation()} className="flex max-h-full min-h-0 flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foto.src}
          alt={foto.baslik || ""}
          className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />
        {(foto.baslik || toplam > 1) && (
          <figcaption className="flex flex-wrap items-center justify-center gap-x-3 text-center text-[13px] text-white/75">
            {foto.baslik && <span>{foto.baslik}</span>}
            {toplam > 1 && (
              <span className="tabular-nums text-white/45">
                {sira + 1} / {toplam}
              </span>
            )}
          </figcaption>
        )}
      </figure>
    </div>
  );
}

function Ok({ yon, onClick }: { yon: "sol" | "sag"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={yon === "sol" ? "Önceki fotoğraf" : "Sonraki fotoğraf"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-[18px] text-white/80 transition hover:border-white/60 hover:text-white ${
        yon === "sol" ? "left-3 sm:left-6" : "right-3 sm:right-6"
      }`}
    >
      {yon === "sol" ? "‹" : "›"}
    </button>
  );
}
