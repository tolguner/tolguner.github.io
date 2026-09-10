"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { AlanCiz, yaz } from "./alanlar";
import { ALANLAR } from "@/lib/content/alanlar";
import { onizlemeyiAc, taslagiKaydet, yayimla } from "@/app/admin/eylemler";

type Slug = "home" | "cv";
type Belge = Record<string, unknown>;

type Durum = { veri: Belge; kirli: boolean };
type Eylem = { tip: "yaz"; yol: string; deger: unknown } | { tip: "temizlendi" };

function indirge(durum: Durum, e: Eylem): Durum {
  switch (e.tip) {
    case "yaz":
      return { veri: yaz(durum.veri, e.yol, e.deger), kirli: true };
    case "temizlendi":
      return { ...durum, kirli: false };
  }
}

/** Iki agacta farkli yaprak sayisi — yayimlama onayinda gosterilir. */
function farkSayisi(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return 1;

  if (Array.isArray(a) || Array.isArray(b)) {
    const x = (a as unknown[]) ?? [];
    const y = (b as unknown[]) ?? [];
    let n = Math.abs(x.length - y.length);
    for (let i = 0; i < Math.min(x.length, y.length); i++) n += farkSayisi(x[i], y[i]);
    return n;
  }

  const x = a as Record<string, unknown>;
  const y = b as Record<string, unknown>;
  let n = 0;
  for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) n += farkSayisi(x[k], y[k]);
  return n;
}

const SAAT = new Intl.DateTimeFormat("tr-TR", { timeStyle: "medium", timeZone: "Europe/Istanbul" });

export default function Duzenleyici({
  slug,
  baslik,
  taslak,
  yayimlanan,
  lockVersion,
  yayimliSurum,
}: {
  slug: Slug;
  baslik: string;
  taslak: Belge;
  yayimlanan: Belge;
  lockVersion: number;
  yayimliSurum: number;
}) {
  const [durum, gonder] = useReducer(indirge, { veri: taslak, kirli: false });
  const [surum, setSurum] = useState(lockVersion);
  const [not, setNot] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);

  const surumRef = useRef(surum);
  surumRef.current = surum;

  const yazarak = useCallback((yol: string, deger: unknown) => gonder({ tip: "yaz", yol, deger }), []);

  const kaydet = useCallback(
    async (veri: Belge) => {
      setMesgul(true);
      setHata(null);
      const sonuc = await taslagiKaydet(slug, veri, surumRef.current);
      setMesgul(false);
      if (!sonuc.ok) {
        setHata(sonuc.hata);
        return false;
      }
      setSurum(sonuc.lockVersion);
      setNot(`Taslak kaydedildi · ${SAAT.format(new Date(sonuc.kaydedildi))}`);
      gonder({ tip: "temizlendi" });
      return true;
    },
    [slug],
  );

  // 2 sn bosta otomatik taslak kaydi. Tum dokuman yaziliyor (~80 KB, tek
  // yazar); bu sayede lock_version ile catisma tespiti onemsiz dogru oluyor.
  useEffect(() => {
    if (!durum.kirli) return;
    const z = setTimeout(() => void kaydet(durum.veri), 2000);
    return () => clearTimeout(z);
  }, [durum.kirli, durum.veri, kaydet]);

  // Kaydedilmemis degisiklikle sayfadan cikma.
  useEffect(() => {
    if (!durum.kirli) return;
    const uyar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", uyar);
    return () => window.removeEventListener("beforeunload", uyar);
  }, [durum.kirli]);

  const bekleyen = useMemo(() => farkSayisi(durum.veri, yayimlanan), [durum.veri, yayimlanan]);

  async function yayimlaTikla() {
    if (durum.kirli && !(await kaydet(durum.veri))) return;
    if (bekleyen === 0) {
      setNot("Yayımlanacak değişiklik yok.");
      return;
    }
    if (!confirm(`${bekleyen} alan değişti. Yayımlansın mı?`)) return;

    setMesgul(true);
    const sonuc = await yayimla(slug, surumRef.current);
    setMesgul(false);
    if (!sonuc.ok) {
      setHata(sonuc.hata);
      return;
    }
    setNot("Yayımlandı. Site birkaç saniye içinde güncellenir.");
    // published artik taslakla ayni; sayacin sifirlanmasi icin yeniden yukle.
    setTimeout(() => location.reload(), 1200);
  }

  return (
    <>
      <div className="sticky top-[57px] z-20 -mx-5 mb-2 border-b border-line bg-paper/90 px-5 py-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif text-[22px] font-bold tracking-tight text-ink">{baslik}</h1>
            <p className="mt-0.5 text-[12px] text-muted">
              {durum.kirli ? "kaydedilmemiş değişiklik var" : (not ?? "taslak güncel")}
              {bekleyen > 0 && ` · ${bekleyen} alan yayımlanmayı bekliyor`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={mesgul || !durum.kirli}
              onClick={() => void kaydet(durum.veri)}
              className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-paper-2 disabled:opacity-40"
            >
              Kaydet
            </button>
            <form action={() => onizlemeyiAc(slug)}>
              <button
                type="submit"
                className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-paper-2"
              >
                Önizle
              </button>
            </form>
            <button
              type="button"
              disabled={mesgul}
              onClick={() => void yayimlaTikla()}
              className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              Yayımla
            </button>
          </div>
        </div>

        {hata && (
          <p role="alert" className="mt-2 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13px] text-ink">
            {hata}
          </p>
        )}
      </div>

      {ALANLAR[slug].map((alan, i) => (
        <AlanCiz key={i} alan={alan} kok={durum.veri} yazarak={yazarak} />
      ))}

      <p className="mt-8 text-[11.5px] text-muted">
        Taslak sürümü {surum} · yayımdaki sürüm {yayimliSurum}
      </p>
    </>
  );
}
