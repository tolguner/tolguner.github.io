"use client";

import { useEffect, useRef, useState } from "react";

import { fotografEkle, fotografGuncelle, fotografSil, siralamayiKaydet, yayimDurumu } from "@/app/admin/eylemler";
import { tarayiciIstemcisi } from "@/lib/supabase/tarayici";
import Kirpici from "./Kirpici";
import Buyutec from "@/components/Buyutec";
import { AZAMI_BAYT, type Cikti } from "@/lib/admin/gorsel";

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

/**
 * Icerik adresli ad. Ozet ISLENMIS dosyadan aliniyor: ayni kaynaktan ayni
 * kirpma her zaman ayni yola gider, yukleme idempotent olur.
 */
async function icerikAdi(dosya: Blob) {
  const ozet = await crypto.subtle.digest("SHA-256", await dosya.arrayBuffer());
  return [...new Uint8Array(ozet)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32) + ".jpg";
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
  const [kuyruk, setKuyruk] = useState<File[]>([]);
  const [eklenen, setEklenen] = useState(0);
  const [buyutecSira, setBuyutecSira] = useState<number | null>(null);
  const dosyaRef = useRef<HTMLInputElement>(null);

  useEffect(() => setListe(fotograflar), [fotograflar]);

  const yayimdaSayisi = liste.filter((f) => f.is_published).length;
  const taslakSayisi = liste.length - yayimdaSayisi;

  const adres = (yol: string) => `${depoKoku}/storage/v1/object/public/gallery/${yol}`;

  /** Secilen dosyalar kirpma ekranindan tek tek geciyor. */
  function kuyrugaAl(dosyalar: FileList | null) {
    if (!dosyalar?.length) return;
    setHata(null);
    setNot(null);

    const kabul: File[] = [];
    const red: string[] = [];
    for (const d of Array.from(dosyalar)) {
      if (!IZINLI.includes(d.type)) red.push(`${d.name}: yalnızca JPEG, PNG, WebP ve AVIF yüklenebilir.`);
      else if (d.size === 0) red.push(`${d.name}: dosya boş.`);
      else kabul.push(d);
    }
    if (red.length) setHata(red.join(" "));
    setKuyruk(kabul);
    if (dosyaRef.current) dosyaRef.current.value = "";
  }

  /** Kirpma onaylandi: dosya tarayicidan dogrudan Storage'a gider. */
  async function kirpilaniYukle(cikti: Cikti) {
    const dosya = cikti.dosya;
    if (dosya.size > AZAMI_BAYT) {
      setHata(`${dosya.name}: kırpılan görsel ${(dosya.size / 1048576).toFixed(1)} MB — 5 MB sınırını aşıyor.`);
      return;
    }

    setYukleniyor(dosya.name);
    const hedef = await icerikAdi(dosya);

    // Vercel'de server action govdesi 4,5 MB ile sinirli; dosya bu yuzden
    // sunucudan degil, tarayicidan dogrudan Storage'a gidiyor.
    const { error } = await tarayiciIstemcisi().storage.from("gallery").upload(hedef, dosya, {
      contentType: "image/jpeg",
      cacheControl: "31536000, immutable",
      upsert: true,
    });
    if (error) {
      setYukleniyor(null);
      setHata(`${dosya.name}: ${error.message}`);
      return;
    }

    const baslik = adFromDosya(dosya.name);
    const sonuc = await fotografEkle({
      storagePath: hedef,
      captionTr: baslik,
      captionEn: baslik,
      width: cikti.en,
      height: cikti.boy,
    });
    setYukleniyor(null);
    if (!sonuc.ok) {
      setHata(`${dosya.name}: ${sonuc.hata}`);
      return;
    }
    setEklenen((n) => n + 1);
    sonrakiKare();
  }

  function sonrakiKare() {
    setKuyruk((k) => {
      const kalan = k.slice(1);
      // Kuyruk bitti: sayfayi bir kez tazele (yeni satirlar sunucudan gelsin).
      if (!kalan.length) setTimeout(() => location.reload(), 300);
      return kalan;
    });
  }

  async function altBaslik(id: string, dil: "tr" | "en", deger: string) {
    setListe((l) => l.map((f) => (f.id === id ? { ...f, [dil === "tr" ? "caption_tr" : "caption_en"]: deger } : f)));
  }

  async function altBasligiKaydet(f: Foto) {
    const sonuc = await fotografGuncelle(f.id, { caption_tr: f.caption_tr, caption_en: f.caption_en });
    if (!sonuc.ok) setHata(sonuc.hata);
    else setNot("Alt başlık kaydedildi.");
  }

  async function yayimiDegistir(f: Foto) {
    const yeni = !f.is_published;
    setListe((l) => l.map((x) => (x.id === f.id ? { ...x, is_published: yeni } : x)));
    const sonuc = await yayimDurumu([f.id], yeni);
    if (!sonuc.ok) {
      setHata(sonuc.hata);
      setListe((l) => l.map((x) => (x.id === f.id ? { ...x, is_published: f.is_published } : x)));
    }
  }

  async function hepsiniYayimla() {
    const idler = liste.filter((f) => !f.is_published).map((f) => f.id);
    if (!idler.length) return;
    setListe((l) => l.map((x) => ({ ...x, is_published: true })));
    const sonuc = await yayimDurumu(idler, true);
    if (!sonuc.ok) {
      setHata(sonuc.hata);
      location.reload();
      return;
    }
    setNot(`${idler.length} fotoğraf yayımlandı.`);
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
            {yayimdaSayisi} fotoğraf yayımda
            {taslakSayisi > 0 && ` · ${taslakSayisi} taslakta`} · ana sayfada Yolculuk bölümünün
            altındaki şeritte akar
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
            onChange={(e) => kuyrugaAl(e.target.files)}
          />
        </label>
      </div>

      {taslakSayisi > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2">
          <span className="text-[13px] text-ink">
            <b>{taslakSayisi}</b> fotoğraf taslakta — sitede görünmüyor.
          </span>
          <button
            type="button"
            onClick={() => void hepsiniYayimla()}
            className="rounded-full bg-accent px-3.5 py-1 text-[12.5px] font-semibold text-white transition hover:opacity-90"
          >
            Hepsini yayımla
          </button>
        </div>
      )}

      {hata && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-ink">
          {hata}
        </p>
      )}
      {not && <p className="mt-4 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13px] text-muted">{not}</p>}
      {eklenen > 0 && (
        <p className="mt-4 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13px] text-muted">
          {eklenen} fotoğraf eklendi.
        </p>
      )}

      <Buyutec
        fotograflar={liste.map((f) => ({ src: adres(f.storage_path), baslik: f.caption_tr }))}
        sira={buyutecSira}
        onKapat={() => setBuyutecSira(null)}
        onSira={setBuyutecSira}
      />

      {kuyruk.length > 0 && (
        <Kirpici
          key={`${kuyruk[0].name}-${kuyruk[0].lastModified}`}
          dosya={kuyruk[0]}
          kalan={{ sira: eklenen + 1, toplam: eklenen + kuyruk.length }}
          onIptal={sonrakiKare}
          onOnay={kirpilaniYukle}
        />
      )}

      <div className="mt-6 space-y-2">
        {liste.map((f, i) => (
          <div
            key={f.id}
            className={`flex flex-wrap items-start gap-3 rounded-xl border p-3 ${
              f.is_published ? "border-line bg-paper-2" : "border-accent/40 bg-accent/5"
            }`}
          >
            <button
              type="button"
              onClick={() => setBuyutecSira(i)}
              title="Büyüt"
              className="shrink-0 cursor-zoom-in rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={adres(f.storage_path)}
                alt={f.caption_tr}
                className="h-16 w-24 rounded-lg border border-line object-cover transition hover:border-accent"
                loading="lazy"
              />
            </button>

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
              <button
                type="button"
                onClick={() => void yayimiDegistir(f)}
                title={f.is_published ? "Yayımdan çıkar" : "Yayıma al"}
                className={`mr-2 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${
                  f.is_published
                    ? "border-line text-muted hover:text-ink"
                    : "border-accent/50 bg-accent/15 text-accent hover:bg-accent/25"
                }`}
              >
                {f.is_published ? "yayımda" : "taslak"}
              </button>
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
        Yeni fotoğraflar <b>taslak</b> olarak eklenir; “taslak” rozetine basıp yayıma alana kadar
        sitede görünmezler. Alt başlık, sıralama ve yayımdan çıkarma yayımdaki fotoğraflarda anında
        uygulanır.
      </p>
    </>
  );
}
