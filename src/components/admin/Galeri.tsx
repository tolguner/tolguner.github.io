"use client";

import { useEffect, useRef, useState } from "react";

import { fotografEkle, fotografGuncelle, fotografSil, siralamayiKaydet } from "@/app/admin/eylemler";
import { tarayiciIstemcisi } from "@/lib/supabase/tarayici";

export type Foto = {
  id: string;
  storage_path: string;
  caption_tr: string;
  caption_en: string;
  width: number | null;
  height: number | null;
  sort_order: number;
  is_published: boolean;
};

const IZINLI = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const AZAMI = 10 * 1024 * 1024;

/** Icerik adresli ad: ayni dosya her zaman ayni yola gider, yukleme idempotent. */
async function icerikAdi(dosya: File) {
  const ozet = await crypto.subtle.digest("SHA-256", await dosya.arrayBuffer());
  const hex = [...new Uint8Array(ozet)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const uzanti = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif" }[dosya.type];
  return hex.slice(0, 32) + (uzanti ?? ".bin");
}

async function olcu(dosya: File) {
  try {
    const bmp = await createImageBitmap(dosya);
    const d = { width: bmp.width, height: bmp.height };
    bmp.close();
    return d;
  } catch {
    return { width: null, height: null };
  }
}

/** Dosya adindan alt baslik: "01-IT&MIS Hackathon.jpg" -> "IT&MIS Hackathon" */
function adFromDosya(ad: string) {
  return ad.replace(/\.[^.]+$/, "").replace(/^\d{1,3}\s*[-_.)]?\s*/, "").trim();
}

export default function Galeri({ fotograflar, depoKoku }: { fotograflar: Foto[]; depoKoku: string }) {
  const [liste, setListe] = useState(fotograflar);
  const [hata, setHata] = useState<string | null>(null);
  const [not, setNot] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState<string | null>(null);
  const dosyaRef = useRef<HTMLInputElement>(null);

  useEffect(() => setListe(fotograflar), [fotograflar]);

  const adres = (yol: string) => `${depoKoku}/storage/v1/object/public/gallery/${yol}`;

  async function yukle(dosyalar: FileList | null) {
    if (!dosyalar?.length) return;
    setHata(null);
    const db = tarayiciIstemcisi();

    for (const dosya of Array.from(dosyalar)) {
      if (!IZINLI.includes(dosya.type)) {
        setHata(`${dosya.name}: yalnızca JPEG, PNG, WebP ve AVIF yüklenebilir.`);
        continue;
      }
      if (dosya.size > AZAMI) {
        setHata(`${dosya.name}: dosya 10 MB sınırını aşıyor (${(dosya.size / 1048576).toFixed(1)} MB).`);
        continue;
      }
      if (dosya.size === 0) {
        setHata(`${dosya.name}: dosya boş.`);
        continue;
      }

      setYukleniyor(dosya.name);
      const hedef = await icerikAdi(dosya);
      const boyut = await olcu(dosya);

      // Tarayicidan DOGRUDAN Storage'a: Vercel'de server action govdesi 4,5 MB.
      const { error } = await db.storage.from("gallery").upload(hedef, dosya, {
        contentType: dosya.type,
        cacheControl: "31536000, immutable",
        upsert: true,
      });
      if (error) {
        setYukleniyor(null);
        setHata(`${dosya.name}: ${error.message}`);
        continue;
      }

      const baslik = adFromDosya(dosya.name);
      const sonuc = await fotografEkle({
        storagePath: hedef,
        captionTr: baslik,
        captionEn: baslik,
        width: boyut.width,
        height: boyut.height,
      });
      setYukleniyor(null);
      if (!sonuc.ok) {
        setHata(`${dosya.name}: ${sonuc.hata}`);
        continue;
      }
      setNot(`${dosya.name} eklendi.`);
      location.reload();
    }
    if (dosyaRef.current) dosyaRef.current.value = "";
  }

  async function altBaslik(id: string, dil: "tr" | "en", deger: string) {
    setListe((l) => l.map((f) => (f.id === id ? { ...f, [dil === "tr" ? "caption_tr" : "caption_en"]: deger } : f)));
  }

  async function altBasligiKaydet(f: Foto) {
    const sonuc = await fotografGuncelle(f.id, { caption_tr: f.caption_tr, caption_en: f.caption_en });
    if (!sonuc.ok) setHata(sonuc.hata);
    else setNot("Alt başlık kaydedildi.");
  }

  async function tasi(i: number, j: number) {
    if (j < 0 || j >= liste.length) return;
    const yeni = [...liste];
    [yeni[i], yeni[j]] = [yeni[j], yeni[i]];
    setListe(yeni);
    // Aralikli numaralandirma: araya fotograf eklemek yeniden numaralandirma
    // gerektirmesin diye 10'ar 10'ar.
    const sonuc = await siralamayiKaydet(yeni.map((f, k) => ({ id: f.id, sort_order: (k + 1) * 10 })));
    if (!sonuc.ok) setHata(sonuc.hata);
  }

  async function sil(f: Foto) {
    if (!confirm(`"${f.caption_tr || f.storage_path}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    const sonuc = await fotografSil(f.id, f.storage_path);
    if (!sonuc.ok) {
      setHata(sonuc.hata);
      return;
    }
    if ("uyari" in sonuc && sonuc.uyari) setNot(sonuc.uyari);
    setListe((l) => l.filter((x) => x.id !== f.id));
  }

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-serif text-[24px] font-bold tracking-tight text-ink">Galeri</h1>
          <p className="mt-1 text-[13px] text-muted">
            {liste.length} fotoğraf · ana sayfada Yolculuk bölümünün altındaki şeritte akar
          </p>
        </div>
        <label className="cursor-pointer rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">
          {yukleniyor ? `Yükleniyor: ${yukleniyor}` : "Fotoğraf ekle"}
          <input
            ref={dosyaRef}
            type="file"
            accept={IZINLI.join(",")}
            multiple
            hidden
            onChange={(e) => void yukle(e.target.files)}
          />
        </label>
      </div>

      {hata && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-ink">
          {hata}
        </p>
      )}
      {not && <p className="mt-4 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13px] text-muted">{not}</p>}

      <div className="mt-6 space-y-2">
        {liste.map((f, i) => (
          <div key={f.id} className="flex flex-wrap items-start gap-3 rounded-xl border border-line bg-paper-2 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={adres(f.storage_path)}
              alt={f.caption_tr}
              className="h-16 w-24 shrink-0 rounded-lg border border-line object-cover"
              loading="lazy"
            />

            <div className="flex min-w-[16rem] flex-1 flex-col gap-2 md:flex-row">
              <input
                value={f.caption_tr}
                onChange={(e) => void altBaslik(f.id, "tr", e.target.value)}
                onBlur={() => void altBasligiKaydet(f)}
                placeholder="Alt başlık (TR)"
                className="w-full rounded-lg border border-line bg-paper px-2.5 py-1.5 text-[13.5px] text-ink outline-none transition focus:border-accent"
              />
              <input
                value={f.caption_en}
                onChange={(e) => void altBaslik(f.id, "en", e.target.value)}
                onBlur={() => void altBasligiKaydet(f)}
                placeholder="Caption (EN)"
                className="w-full rounded-lg border border-line bg-paper px-2.5 py-1.5 text-[13.5px] text-ink outline-none transition focus:border-accent"
              />
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <span className="mr-2 text-[11.5px] text-muted">
                {f.width && f.height ? `${f.width}×${f.height}` : "—"}
              </span>
              <button
                type="button"
                title="Yukarı"
                disabled={i === 0}
                onClick={() => void tasi(i, i - 1)}
                className="rounded-md border border-line px-2 py-1 text-[12px] text-muted transition hover:text-ink disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                title="Aşağı"
                disabled={i === liste.length - 1}
                onClick={() => void tasi(i, i + 1)}
                className="rounded-md border border-line px-2 py-1 text-[12px] text-muted transition hover:text-ink disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                title="Sil"
                onClick={() => void sil(f)}
                className="rounded-md border border-line px-2 py-1 text-[12px] text-muted transition hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[11.5px] text-muted">
        Alt başlıklar alandan çıkınca kaydedilir. Sıralama ve silme anında uygulanır — galeride
        taslak/yayımla adımı yok.
      </p>
    </>
  );
}
