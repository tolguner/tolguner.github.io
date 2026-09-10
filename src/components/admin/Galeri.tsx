"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  depodanSil,
  fotografEkle,
  fotografGeriAl,
  fotografGuncelle,
  fotografSil,
  siralamayiKaydet,
  yayimDurumu,
} from "@/app/admin/eylemler";
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
 * Sutun duzeni: gorsel · TR · EN · durum · olcu · islem.
 * `lg` altinda tek sutuna dusuyor; alti sutun dar ekranda okunmaz oluyor,
 * o zaman baslik satiri gizleniyor ve etiketler satir icine geri geliyor.
 */
const IZGARA = "lg:grid-cols-[5.5rem_1fr_1fr_auto_auto_auto]";

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
  /** Satir ici onay bekleyen fotograf. */
  const [silinecek, setSilinecek] = useState<string | null>(null);
  const [siliniyor, setSiliniyor] = useState<string | null>(null);
  const [geriAlinabilir, setGeriAlinabilir] = useState<{
    satir: Foto;
    zamanlayici: ReturnType<typeof setTimeout>;
  } | null>(null);
  const dosyaRef = useRef<HTMLInputElement>(null);
  /** Suruklenen satirin kimligi (gorsel geri bildirim). */
  const [suruklenen, setSuruklenen] = useState<string | null>(null);
  /** Olay isleyicileri en guncel listeyi gormeli; state kapanislari bayat kalir. */
  const listeRef = useRef(fotograflar);
  /** FLIP animasyonu icin satir ogeleri ve onceki konumlari. */
  const satirOgeleri = useRef(new Map<string, HTMLElement>());
  const oncekiYerler = useRef(new Map<string, number>());
  /** Birakma sonrasi FLIP calismasin: satirlar zaten dogru yerde. */
  const flipAtla = useRef(false);

  useEffect(() => {
    setListe(fotograflar);
    listeRef.current = fotograflar;
  }, [fotograflar]);

  const yayimdaSayisi = liste.filter((f) => f.is_published).length;
  const taslakSayisi = liste.length - yayimdaSayisi;

  /**
   * Sira degisiminde FLIP animasyonu.
   *
   * Yeniden dizilim React tarafinda aninda oluyor; kartlar animasyonsuz
   * zipliyordu ve neyin nereye gittigi anlasilmiyordu. Burada her yerlesim
   * sonrasi satirlarin ESKI konumu geri veriliyor (ters donusum), sonraki
   * karede sifira animasyonlaniyor — yani kartlar eski yerlerinden yenisine
   * kayiyormus gibi gorunuyor.
   *
   * `offsetTop` kullaniliyor, `getBoundingClientRect().top` degil: ikincisi
   * gorunume gore olctugu icin sayfa kaydiginda tum satirlar yer degistirmis
   * gibi gorunur ve bosuna animasyon tetiklenirdi.
   */
  useLayoutEffect(() => {
    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches || flipAtla.current;
    flipAtla.current = false;
    const yeniYerler = new Map<string, number>();

    for (const [id, el] of satirOgeleri.current) {
      const ust = el.offsetTop;
      yeniYerler.set(id, ust);
      const onceki = oncekiYerler.current.get(id);
      if (azalt || onceki === undefined || Math.abs(onceki - ust) < 1) continue;

      el.style.transition = "none";
      el.style.transform = `translateY(${onceki - ust}px)`;
      requestAnimationFrame(() => {
        el.style.transition = "transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)";
        el.style.transform = "";
      });
    }

    oncekiYerler.current = yeniYerler;
  }, [liste]);

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
    setListe((l) => {
      const y = l.map((f) => (f.id === id ? { ...f, [dil === "tr" ? "caption_tr" : "caption_en"]: deger } : f));
      listeRef.current = y;
      return y;
    });
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

  /** Guncel siralamayi yazar. Aralikli numaralandirma: araya fotograf eklemek
      yeniden numaralandirma gerektirmesin diye 10'ar 10'ar. */
  const siralamayiYaz = useCallback(async () => {
    const sonuc = await siralamayiKaydet(listeRef.current.map((f, k) => ({ id: f.id, sort_order: (k + 1) * 10 })));
    if (!sonuc.ok) setHata(sonuc.hata);
  }, []);

  /** Klavye ile tasima — surukleme fareye bagli kalmasin diye tutuluyor. */
  async function tasi(i: number, j: number) {
    if (j < 0 || j >= listeRef.current.length) return;
    const yeni = [...listeRef.current];
    [yeni[i], yeni[j]] = [yeni[j], yeni[i]];
    setListe(yeni);
    listeRef.current = yeni;
    await siralamayiYaz();
  }

  /**
   * Surukleyerek siralama.
   *
   * Onceki surum her `pointermove`da React state'ini degistiriyordu: liste
   * yeniden diziliyor, duzen bastan hesaplaniyor ve ucustaki FLIP animasyonu
   * kesiliyordu — titreme ve sicrama bundandi. Ayrica imlec komsu satira 1
   * piksel girdiginde takas oluyor, satirlar kayinca imlec eski satirin uzerine
   * dusuyor ve ileri geri salinim basliyordu.
   *
   * Simdi surukleme boyunca HIC yeniden cizim yok. Baslangicta satirlarin
   * konumlari olculuyor; hareket ederken yalnizca `transform` yaziliyor:
   * suruklenen satir imleci birebir izliyor, digerleri hedef yuvalarina
   * gecisle kayiyor. Sira degisimi olcume gore hesaplandigi icin salinim da
   * olmuyor. Liste yalnizca birakildiginda bir kez guncelleniyor.
   */
  const surukleRef = useRef<{
    id: string;
    baslangicY: number;
    kutular: { id: string; ust: number; yukseklik: number }[];
    araliklar: number[];
    ilkIndex: number;
    sonIndex: number;
  } | null>(null);

  /** Verilen tasimadan sonra her satirin yeni ust konumu. */
  const yeniKonumlar = useCallback((kutular: { id: string; ust: number; yukseklik: number }[], araliklar: number[], from: number, to: number) => {
    const sirali = [...kutular];
    const [tasinan] = sirali.splice(from, 1);
    sirali.splice(to, 0, tasinan);

    const konum = new Map<string, number>();
    let y = kutular[0].ust;
    for (let i = 0; i < sirali.length; i++) {
      konum.set(sirali[i].id, y);
      y += sirali[i].yukseklik + (araliklar[i] ?? 0);
    }
    return konum;
  }, []);

  const surukleHareket = useCallback(
    (e: PointerEvent) => {
      const d = surukleRef.current;
      if (!d) return;

      const dy = e.clientY - d.baslangicY;
      const kaynakKutu = d.kutular[d.ilkIndex];
      const merkez = kaynakKutu.ust + kaynakKutu.yukseklik / 2 + dy;

      // Hedef yuva: suruklenen satirin merkezi hangi satirlarin merkezini
      // gectiyse. Olcume dayali oldugu icin salinim yok.
      let hedef = 0;
      for (let i = 0; i < d.kutular.length; i++) {
        if (i === d.ilkIndex) continue;
        const k = d.kutular[i];
        if (merkez > k.ust + k.yukseklik / 2) hedef++;
      }

      if (hedef !== d.sonIndex) {
        d.sonIndex = hedef;
        const konum = yeniKonumlar(d.kutular, d.araliklar, d.ilkIndex, hedef);
        for (const k of d.kutular) {
          if (k.id === d.id) continue;
          const el = satirOgeleri.current.get(k.id);
          if (!el) continue;
          el.style.transition = "transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)";
          el.style.transform = `translateY(${(konum.get(k.id) ?? k.ust) - k.ust}px)`;
        }
      }

      // Suruklenen satir imleci birebir izler: gecis yok, gecikme yok.
      const el = satirOgeleri.current.get(d.id);
      if (el) {
        el.style.transition = "none";
        el.style.transform = `translateY(${dy}px)`;
      }
    },
    [yeniKonumlar],
  );

  const surukleBitir = useCallback(() => {
    window.removeEventListener("pointermove", surukleHareket);
    document.body.style.userSelect = "";

    const d = surukleRef.current;
    surukleRef.current = null;
    setSuruklenen(null);
    if (!d) return;

    const el = satirOgeleri.current.get(d.id);
    const konum = yeniKonumlar(d.kutular, d.araliklar, d.ilkIndex, d.sonIndex);
    const hedefKayma = (konum.get(d.id) ?? 0) - d.kutular[d.ilkIndex].ust;

    // Birakilan satir once yuvasina otursun, sonra listeyi guncelleyelim;
    // aksi halde son bir sicrama gorunuyor.
    if (el) {
      el.style.transition = "transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)";
      el.style.transform = `translateY(${hedefKayma}px)`;
    }

    const yeni = [...listeRef.current];
    const [tasinan] = yeni.splice(d.ilkIndex, 1);
    yeni.splice(d.sonIndex, 0, tasinan);

    setTimeout(() => {
      for (const k of d.kutular) {
        const e2 = satirOgeleri.current.get(k.id);
        if (!e2) continue;
        e2.style.transition = "";
        e2.style.transform = "";
      }
      // Yeni duzen zaten gozle gorunen yerde; FLIP burada calisirsa geri
      // ziplama animasyonu uretir.
      flipAtla.current = true;
      listeRef.current = yeni;
      setListe(yeni);
      void siralamayiYaz();
    }, 200);
  }, [surukleHareket, siralamayiYaz, yeniKonumlar]);

  function surukleBasla(e: React.PointerEvent, id: string) {
    // Metin secimini ve dokunmatikte sayfa kaydirmasini engelle.
    e.preventDefault();

    const kutular = listeRef.current
      .map((f) => {
        const el = satirOgeleri.current.get(f.id);
        return el ? { id: f.id, ust: el.offsetTop, yukseklik: el.offsetHeight } : null;
      })
      .filter((k): k is { id: string; ust: number; yukseklik: number } => k !== null);

    const index = kutular.findIndex((k) => k.id === id);
    if (index < 0) return;

    // Yuvalar arasi bosluklar duzene gore degisiyor (lg'de bitisik, altinda
    // aralikli); olcumden cikariyoruz ki her iki duzende de dogru olsun.
    const araliklar = kutular.map((k, i) =>
      i < kutular.length - 1 ? kutular[i + 1].ust - (k.ust + k.yukseklik) : 0,
    );

    surukleRef.current = { id, baslangicY: e.clientY, kutular, araliklar, ilkIndex: index, sonIndex: index };
    setSuruklenen(id);
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", surukleHareket);
    window.addEventListener("pointerup", surukleBitir, { once: true });
    window.addEventListener("pointercancel", surukleBitir, { once: true });
  }

  /**
   * Silme iki asamali. Yerel `confirm()` KULLANILMIYOR: ortamlara gore
   * otomatik reddedilebiliyor (bu projede oldu — dugmeye basiliyor, hicbir sey
   * olmuyordu) ve panelin geri kalaniyla da tutarsiz.
   *
   * Once satir siliniyor, depodaki dosya duruyor; 10 saniye "geri al" hakki
   * var. Sure dolunca dosya da siliniyor.
   */
  async function silOnayla(f: Foto) {
    setSilinecek(null);
    setSiliniyor(f.id);
    setHata(null);

    const sonuc = await fotografSil(f.id);
    setSiliniyor(null);
    if (!sonuc.ok) {
      setHata(`Silinemedi: ${sonuc.hata}`);
      return;
    }

    setListe((l) => l.filter((x) => x.id !== f.id));

    const zamanlayici = setTimeout(() => {
      void depodanSil(sonuc.satir.storage_path);
      setGeriAlinabilir((g) => (g?.satir.storage_path === sonuc.satir.storage_path ? null : g));
    }, 10_000);

    setGeriAlinabilir({ satir: sonuc.satir, zamanlayici });
  }

  async function geriAl() {
    const g = geriAlinabilir;
    if (!g) return;
    clearTimeout(g.zamanlayici);
    setGeriAlinabilir(null);

    const { id: _atilan, ...alanlar } = g.satir;
    const sonuc = await fotografGeriAl(alanlar);
    if (!sonuc.ok) {
      setHata(`Geri alınamadı: ${sonuc.hata}`);
      return;
    }
    location.reload();
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

      {geriAlinabilir && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper-2 px-3 py-2">
          <span className="text-[13px] text-ink">
            <b>{geriAlinabilir.satir.caption_tr || "Fotoğraf"}</b> silindi.
          </span>
          <button
            type="button"
            onClick={() => void geriAl()}
            className="rounded-full border border-accent/50 px-3.5 py-1 text-[12.5px] font-semibold text-accent transition hover:bg-accent/10"
          >
            Geri al
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

      {/* Sutun basligi: etiketleri her satirda tekrarlamak yerine bir kez.
          `lg` altinda basliklar gizlenip satirlar yiginlaniyor ve etiketler
          satir icine geri geliyor — dar ekranda alti sutun okunmaz oluyor. */}
      <div className={`mt-6 hidden gap-3 border-b border-line px-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted lg:grid ${IZGARA}`}>
        <span>Görsel</span>
        <span>Türkçe açıklama</span>
        <span>İngilizce açıklama</span>
        <span>Durum</span>
        <span>Ölçü</span>
        <span className="text-right">Sıra ve silme</span>
      </div>

      <div className="mt-2 space-y-2 lg:mt-0 lg:space-y-0">
        {liste.map((f, i) => (
          <div
            key={f.id}
            data-foto={f.id}
            ref={(el) => {
              if (el) satirOgeleri.current.set(f.id, el);
              else satirOgeleri.current.delete(f.id);
            }}
            className={`relative grid grid-cols-1 items-center gap-3 rounded-xl border p-3 lg:border-x-0 lg:border-t-0 ${IZGARA} ${
              f.is_published ? "border-line bg-paper-2 lg:bg-transparent" : "border-accent/40 bg-accent/5"
            } ${
              suruklenen === f.id
                ? "z-20 cursor-grabbing border-accent bg-surface shadow-[0_14px_32px_rgba(0,0,0,0.5)] ring-2 ring-accent/60"
                : "lg:rounded-none"
            }`}
          >
              <button
                type="button"
                onClick={() => setBuyutecSira(i)}
                title="Büyüt"
                className="w-fit shrink-0 cursor-zoom-in rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={adres(f.storage_path)}
                  alt={f.caption_tr}
                  className="h-14 w-[5.5rem] rounded-lg border border-line object-cover transition hover:border-accent"
                  loading="lazy"
                />
              </button>

              {(["tr", "en"] as const).map((dil) => (
                <label key={dil} className="flex min-w-0 items-center gap-2">
                  {/* Baslik satiri gorunmedigi zaman etiket satir ici doner. */}
                  <span className="w-5 shrink-0 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted lg:hidden">
                    {dil}
                  </span>
                  <input
                    value={dil === "tr" ? f.caption_tr : f.caption_en}
                    onChange={(e) => void altBaslik(f.id, dil, e.target.value)}
                    onBlur={() => void altBasligiKaydet(f)}
                    placeholder={dil === "tr" ? "Alt başlık" : "Caption"}
                    className="w-full min-w-0 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-[13.5px] text-ink outline-none transition focus:border-accent"
                  />
                </label>
              ))}

              <button
                type="button"
                onClick={() => void yayimiDegistir(f)}
                title={f.is_published ? "Yayımdan çıkar" : "Yayıma al"}
                className={`w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${
                  f.is_published
                    ? "border-line text-muted hover:text-ink"
                    : "border-accent/50 bg-accent/15 text-accent hover:bg-accent/25"
                }`}
              >
                {f.is_published ? "yayımda" : "taslak"}
              </button>

              <span className="text-[11.5px] tabular-nums text-muted">
                {f.width && f.height ? `${f.width}×${f.height}` : "—"}
              </span>

              <div className="flex items-center justify-end gap-1">
                {/* Surukleme tutamagi. Klavye erisimi kaybolmasin diye ayni
                    dugme ok tuslariyla da tasiyor. */}
                <button
                  type="button"
                  title="Sürükleyerek sırala (ok tuşlarıyla da taşınır)"
                  aria-label={`Sırayı değiştir: ${f.caption_tr || "fotoğraf"}, ${i + 1}. sırada`}
                  onPointerDown={(e) => surukleBasla(e, f.id)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      void tasi(i, i - 1);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      void tasi(i, i + 1);
                    }
                  }}
                  style={{ touchAction: "none" }}
                  className="cursor-grab rounded-md border border-line px-2 py-1 text-[13px] leading-none text-muted transition hover:text-ink active:cursor-grabbing"
                >
                  ⠿
                </button>
                {silinecek === f.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void silOnayla(f)}
                      disabled={siliniyor === f.id}
                      className="rounded-md border border-red-500/50 bg-red-500/15 px-2 py-1 text-[11.5px] font-semibold text-red-300 transition hover:bg-red-500/25 disabled:opacity-50"
                    >
                      {siliniyor === f.id ? "siliniyor…" : "sil"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSilinecek(null)}
                      className="rounded-md border border-line px-2 py-1 text-[11.5px] text-muted transition hover:text-ink"
                    >
                      vazgeç
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    title="Sil"
                    onClick={() => setSilinecek(f.id)}
                    className="rounded-md border border-line px-2 py-1 text-[12px] text-muted transition hover:border-red-500/50 hover:text-red-400"
                  >
                    ✕
                  </button>
                )}
              </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[11.5px] text-muted">
        Sıralamak için <b>⠿</b> tutamağını basılı tutup sürükleyin (tutamak seçiliyken ok tuşları da
        çalışır). Yeni fotoğraflar <b>taslak</b> olarak eklenir; “taslak” rozetine basıp yayıma alana kadar
        sitede görünmezler. Alt başlık, sıralama ve yayımdan çıkarma yayımdaki fotoğraflarda anında
        uygulanır.
      </p>
    </>
  );
}
