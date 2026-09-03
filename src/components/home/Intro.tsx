"use client";

import { useEffect, useState } from "react";

const AD = "Tolga Olguner";
const HARF_MS = 58;
const ILK_GECIKME_MS = 260;
const YAZIM_SONRASI_MS = 340;
type Props = {
  /** Yazım tamamlandığında çağrılır; küreyi Home açar. */
  onYazimBitti: () => void;
  /** Uçuş başlayınca perde kapanır. */
  kapaniyor: boolean;
  atlaEtiketi: string;
  onAtla: () => void;
};

/**
 * Açılış perdesi: ad daktilo gibi yazılır, ardından perde açılırken kamera
 * kürenin içinden dışarı çekilir. Kamerayı Home yönetir; burada yazım ve
 * perdeden başka bir şey yok.
 *
 * Harfler tek bir durum değişimiyle, her birine sabit `transition-delay`
 * verilerek açılır. Zincirlenmiş setTimeout ya da rAF sayacı kullanılmıyor:
 * ikisinde de adımlar kare sınırlarına yuvarlanıp ritimde tökezleme yapıyordu.
 */
export default function Intro({ onYazimBitti, kapaniyor, atlaEtiketi, onAtla }: Props) {
  const [basladi, setBasladi] = useState(false);

  useEffect(() => {
    const z = setTimeout(() => setBasladi(true), ILK_GECIKME_MS);
    return () => clearTimeout(z);
  }, []);

  useEffect(() => {
    if (!basladi) return;
    const sure = (AD.length - 1) * HARF_MS + YAZIM_SONRASI_MS;
    const z = setTimeout(onYazimBitti, sure);
    return () => clearTimeout(z);
  }, [basladi, onYazimBitti]);

  return (
    <div
      aria-hidden
      onClick={onAtla}
      className={`fixed inset-0 z-40 flex items-center justify-center bg-[#030a16] transition-opacity duration-700 ${
        kapaniyor ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <p
        className={`font-display select-none px-6 text-center text-[clamp(2.1rem,8.5vw,5.5rem)] font-medium leading-none tracking-tight text-white transition-[opacity,filter,transform] duration-500 ${
          kapaniyor ? "scale-[1.04] opacity-0 blur-[3px]" : "opacity-100 blur-0"
        }`}
      >
        {AD.split("").map((h, i) => (
          <span
            key={i}
            style={{ transitionDelay: basladi ? `${i * HARF_MS}ms` : "0ms" }}
            className={`inline-block transition-opacity duration-100 ${basladi ? "opacity-100" : "opacity-0"}`}
          >
            {h === " " ? " " : h}
          </span>
        ))}
      </p>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onAtla(); }}
        className={`absolute bottom-8 right-8 text-[11.5px] uppercase tracking-[0.22em] text-white/35 transition hover:text-white/70 ${
          kapaniyor ? "opacity-0" : "opacity-100"
        }`}
      >
        {atlaEtiketi}
      </button>
    </div>
  );
}
