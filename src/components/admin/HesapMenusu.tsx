"use client";

import { useEffect, useRef, useState } from "react";

import { cikisYap } from "@/app/admin/eylemler";

const OGELER = [
  { href: "/admin/profil", etiket: "Profil", aciklama: "Hesap bilgileri ve parola" },
  { href: "/admin/guvenlik", etiket: "Güvenlik", aciklama: "İki adımlı doğrulama" },
];

/**
 * Baslik cubugundaki hesap menusu.
 *
 * Yalnizca hover ile acilan menu dokunmatikte ve klavyeyle erisilemez olur;
 * bu yuzden uc yol birden acik: uzerine gelme (kapanmasi 150ms gecikmeli,
 * yoksa hapla menu arasindaki bosluga girince kapaniyor), tiklama ve odak.
 */
export default function HesapMenusu({ eposta }: { eposta?: string }) {
  const [acik, setAcik] = useState(false);
  const kap = useRef<HTMLDivElement>(null);
  const zamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!acik) return;

    const disariTiklama = (e: MouseEvent) => {
      if (kap.current && !kap.current.contains(e.target as Node)) setAcik(false);
    };
    const kacis = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAcik(false);
    };

    document.addEventListener("mousedown", disariTiklama);
    document.addEventListener("keydown", kacis);
    return () => {
      document.removeEventListener("mousedown", disariTiklama);
      document.removeEventListener("keydown", kacis);
    };
  }, [acik]);

  useEffect(() => () => {
    if (zamanlayici.current) clearTimeout(zamanlayici.current);
  }, []);

  function gecikmeliKapat() {
    if (zamanlayici.current) clearTimeout(zamanlayici.current);
    zamanlayici.current = setTimeout(() => setAcik(false), 150);
  }

  function hemenAc() {
    if (zamanlayici.current) clearTimeout(zamanlayici.current);
    setAcik(true);
  }

  return (
    <div
      ref={kap}
      className="relative"
      onMouseEnter={hemenAc}
      onMouseLeave={gecikmeliKapat}
      onFocus={hemenAc}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setAcik(false);
      }}
    >
      {/* Sitedeki birincil hapla ayni olcu: min-w-[92px], px-4 py-1.5, 12.5px */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={acik}
        onClick={() => setAcik((a) => !a)}
        className="flex min-w-[92px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-white transition hover:opacity-90"
      >
        Profil
        <span aria-hidden className={`text-[9px] transition ${acik ? "rotate-180" : ""}`}>▼</span>
      </button>

      {acik && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-60 overflow-hidden rounded-2xl border border-line bg-paper shadow-lg"
        >
          {eposta && (
            <div className="border-b border-line px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-muted">Oturum</div>
              <div className="mt-0.5 truncate text-[12.5px] text-ink" title={eposta}>
                {eposta}
              </div>
            </div>
          )}

          {OGELER.map((o) => (
            <a
              key={o.href}
              role="menuitem"
              href={o.href}
              onClick={() => setAcik(false)}
              className="block px-4 py-2.5 transition hover:bg-paper-2"
            >
              <div className="text-[13px] font-semibold text-ink">{o.etiket}</div>
              <div className="text-[11.5px] text-muted">{o.aciklama}</div>
            </a>
          ))}

          <form action={cikisYap} className="border-t border-line">
            <button
              role="menuitem"
              type="submit"
              className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-ink transition hover:bg-paper-2"
            >
              Çıkış
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
