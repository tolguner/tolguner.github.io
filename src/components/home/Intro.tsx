"use client";

import { useEffect, useRef, useState } from "react";

const AD = "Tolga Olguner";
const HARF_MS = 58;
const ILK_GECIKME_MS = 260;
const YAZIM_SONRASI_MS = 340;
/** "Olguner"in O'su — kürenin içinden çıkacağı harf. */
const ODAK = AD.indexOf("O", 1);

type Props = {
  /** Yazım bitince odak harfinin DOM düğümünü verir. */
  onYazimBitti: (harf: HTMLElement) => void;
  /** Uçuş başlayınca perde kapanır. */
  kapaniyor: boolean;
  atlaEtiketi: string;
  onAtla: () => void;
};

/**
 * Açılış perdesi: ad daktilo gibi yazılır, ardından "O" harfinin merkezinden
 * küre doğar. Uçuşu Home yönetir; burada yalnızca yazım ve perde vardır.
 */
export default function Intro({ onYazimBitti, kapaniyor, atlaEtiketi, onAtla }: Props) {
  const [n, setN] = useState(0);
  const odakRef = useRef<HTMLSpanElement>(null);
  const haberVerildi = useRef(false);

  useEffect(() => {
    if (n < AD.length) {
      const z = setTimeout(() => setN((v) => v + 1), n === 0 ? ILK_GECIKME_MS : HARF_MS);
      return () => clearTimeout(z);
    }
    if (haberVerildi.current) return;
    haberVerildi.current = true;
    const z = setTimeout(() => {
      if (odakRef.current) onYazimBitti(odakRef.current);
    }, YAZIM_SONRASI_MS);
    return () => clearTimeout(z);
  }, [n, onYazimBitti]);

  return (
    <div
      aria-hidden
      onClick={onAtla}
      className={`fixed inset-0 z-40 flex items-center justify-center bg-[#070b12] transition-opacity duration-700 ${
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
            ref={i === ODAK ? odakRef : undefined}
            className={`inline-block transition-opacity duration-150 ${i < n ? "opacity-100" : "opacity-0"}`}
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
