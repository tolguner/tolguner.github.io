"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AlanCiz, yaz } from "./alanlar";
import { ALANLAR } from "@/lib/content/alanlar";
import { farkSayisi } from "@/lib/content/fark";
import { onizlemeyiAc, taslagiKaydet, taslakSurumu, yayimla } from "@/app/admin/eylemler";

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

const SAAT = new Intl.DateTimeFormat("tr-TR", { timeStyle: "medium", timeZone: "Europe/Istanbul" });

type KayitDurumu = "temiz" | "bekliyor" | "kaydediliyor" | "kaydedildi" | "yayimlandi";

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
  const router = useRouter();
  const [durum, gonder] = useReducer(indirge, { veri: taslak, kirli: false });
  const [kayit, setKayit] = useState<KayitDurumu>("temiz");
  const [zaman, setZaman] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [yayimMesguL, setYayimMesgul] = useState(false);
  const [onay, setOnay] = useState(false);

  /**
   * Surum SADECE ref'te tutuluyor ve yalnizca kaydet() icinde guncelleniyor.
   * Onceden render sirasinda `surumRef.current = surum` yaziliyordu; kaydetme
   * hemen ardindan yayimlanirsa React henuz yeniden render etmedigi icin
   * RPC'ye BAYAT surum gidiyor ve yayimlama sessizce surum uyusmazligina
   * dusuyordu. (Yayimlama hic calismamasinin sebebi buydu.)
   */
  const surumRef = useRef(lockVersion);
  const [surum, setSurum] = useState(lockVersion);

  const yazarak = useCallback((yol: string, deger: unknown) => gonder({ tip: "yaz", yol, deger }), []);

  const kaydet = useCallback(
    async (veri: Belge): Promise<number | null> => {
      setKayit("kaydediliyor");
      setHata(null);
      const sonuc = await taslagiKaydet(slug, veri, surumRef.current);
      if (!sonuc.ok) {
        setKayit("bekliyor");
        setHata(sonuc.hata);
        return null;
      }
      surumRef.current = sonuc.lockVersion;
      setSurum(sonuc.lockVersion);
      setZaman(SAAT.format(new Date(sonuc.kaydedildi)));
      setKayit("kaydedildi");
      gonder({ tip: "temizlendi" });
      return sonuc.lockVersion;
    },
    [slug],
  );

  // Yazarken degil, yazmaya ARA VERINCE kaydeder. Odak kaybi artik yok
  // (bkz. alanlar.tsx / DilKutusu), bu yuzden yazmayi kesmiyor.
  useEffect(() => {
    if (!durum.kirli) return;
    setKayit("bekliyor");
    const z = setTimeout(() => void kaydet(durum.veri), 2500);
    return () => clearTimeout(z);
  }, [durum.kirli, durum.veri, kaydet]);

  // Ctrl/Cmd+S ile elle kaydet.
  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (durum.kirli) void kaydet(durum.veri);
      }
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, [durum.kirli, durum.veri, kaydet]);

  useEffect(() => {
    if (!durum.kirli) return;
    const uyar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", uyar);
    return () => window.removeEventListener("beforeunload", uyar);
  }, [durum.kirli]);

  const bekleyen = useMemo(() => farkSayisi(durum.veri, yayimlanan), [durum.veri, yayimlanan]);

  async function yayimlaTikla() {
    setHata(null);
    setOnay(false);

    // Kaydetme sonucu dogrudan kullaniliyor; state'in guncellenmesini beklemek
    // yok, dolayisiyla bayat surum de yok.
    let v = surumRef.current;
    if (durum.kirli) {
      const yeni = await kaydet(durum.veri);
      if (yeni === null) return;
      v = yeni;
    }

    setYayimMesgul(true);
    let sonuc = await yayimla(slug, v);

    // Surum uyusmazliginda kendini onarir: veritabanindaki guncel surumu alip
    // bir kez daha dener. Tek yazarli bir panelde kullaniciyi "sayfayi
    // yenileyin" hatasiyla bas basa birakmanin anlami yok.
    if (!sonuc.ok && sonuc.hata.includes("surum uyusmazligi")) {
      const taze = await taslakSurumu(slug);
      if (taze.ok) {
        surumRef.current = taze.lockVersion;
        setSurum(taze.lockVersion);
        sonuc = await yayimla(slug, taze.lockVersion);
      }
    }

    setYayimMesgul(false);

    if (!sonuc.ok) {
      setHata(`Yayımlanamadı: ${sonuc.hata}`);
      return;
    }

    setKayit("yayimlandi");
    setZaman(SAAT.format(new Date()));
    setHata(null);
    // Sunucu bileseni yeniden calissin: `yayimlanan` prop'u tazelensin ki
    // bekleyen sayaci sifirlansin.
    router.refresh();
  }

  const durumYazisi =
    kayit === "kaydediliyor"
      ? "kaydediliyor…"
      : kayit === "bekliyor"
        ? "kaydedilmemiş değişiklik"
        : kayit === "kaydedildi"
          ? `taslak kaydedildi · ${zaman}`
          : kayit === "yayimlandi"
            ? `yayımlandı · ${zaman}`
            : "taslak güncel";

  return (
    <>
      <div className="sticky top-[57px] z-20 -mx-5 mb-2 border-b border-line bg-paper/90 px-5 py-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-[22px] font-bold tracking-tight text-ink">{baslik}</h1>
            <p className="mt-0.5 text-[12px] text-muted">
              {durumYazisi}
              {bekleyen > 0 && ` · ${bekleyen} alan yayımlanmayı bekliyor`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/admin/revizyonlar/${slug}`}
              className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-paper-2"
            >
              Geçmiş
            </a>
            <button
              type="button"
              disabled={kayit === "kaydediliyor" || !durum.kirli}
              onClick={() => void kaydet(durum.veri)}
              title="Ctrl+S"
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
              disabled={yayimMesguL || onay}
              onClick={() => {
                setHata(null);
                if (bekleyen === 0 && !durum.kirli) {
                  setHata("Yayımlanacak değişiklik yok.");
                  return;
                }
                setOnay(true);
              }}
              className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {yayimMesguL ? "Yayımlanıyor…" : "Yayımla"}
            </button>
          </div>
        </div>

        {onay && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2">
            <span className="text-[13px] text-ink">
              <b>{bekleyen}</b> alan yayımlanacak. Site birkaç saniye içinde güncellenir.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOnay(false)}
                className="rounded-full border border-line px-3 py-1 text-[12.5px] font-semibold text-ink transition hover:bg-paper-2"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => void yayimlaTikla()}
                className="rounded-full bg-accent px-3.5 py-1 text-[12.5px] font-semibold text-white transition hover:opacity-90"
              >
                Onayla ve yayımla
              </button>
            </div>
          </div>
        )}

        {hata && (
          <p
            role="alert"
            className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] font-medium text-ink"
          >
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
