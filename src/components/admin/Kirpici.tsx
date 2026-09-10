"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  CERCEVE,
  asgariOlcek,
  ciktiGenisligi,
  kadrajiSinirla,
  kadrajiUret,
  kaynagiAc,
  ortalaKadraj,
  type Cikti,
  type Kadraj,
  type Kaynak,
} from "@/lib/admin/gorsel";

/**
 * Kirpma ekrani.
 *
 * Onizleme ile ciktinin BIREBIR ayni olmasi icin butun hesap CERCEVE
 * koordinatlarinda yapiliyor; ekranda daralan cerceve yalnizca CSS ile
 * olcekleniyor (`gosterimOlcegi`), matematik degismiyor. Cikti cozunurlugu
 * ise kadrajin kaynaktaki gercek boyutundan geliyor (bkz. ciktiGenisligi).
 */
export default function Kirpici({
  dosya,
  kalan,
  onIptal,
  onOnay,
}: {
  dosya: File;
  /** Kuyrukta bekleyen dosya sayisi — basliktaki "2/5" bilgisi icin. */
  kalan: { sira: number; toplam: number };
  onIptal: () => void;
  onOnay: (uretilen: Cikti) => Promise<void>;
}) {
  const [kaynak, setKaynak] = useState<Kaynak | null>(null);
  const [kadraj, setKadraj] = useState<Kadraj | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const [gosterimOlcegi, setGosterimOlcegi] = useState(1);

  // Her render'da yeni bir nesne URL'i uretmek bellegi sizdirir; bir kez uret.
  const [onizlemeUrl, setOnizlemeUrl] = useState<string>("");
  useEffect(() => {
    const u = URL.createObjectURL(dosya);
    setOnizlemeUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [dosya]);

  const cerceveRef = useRef<HTMLDivElement>(null);
  const surukleme = useRef<{ x: number; y: number; kadrajX: number; kadrajY: number } | null>(null);

  useEffect(() => {
    let iptal = false;
    setKaynak(null);
    setHata(null);
    kaynagiAc(dosya)
      .then((k) => {
        if (iptal) return;
        setKaynak(k);
        setKadraj(ortalaKadraj(k));
      })
      .catch(() => !iptal && setHata("Görsel açılamadı — dosya bozuk olabilir."));
    return () => {
      iptal = true;
    };
  }, [dosya]);

  // Cerceve dar ekranda kuculur; surukleme farklarini bu olcege bolmemiz gerek.
  useLayoutEffect(() => {
    const el = cerceveRef.current;
    if (!el) return;
    const olc = () => setGosterimOlcegi(el.clientWidth / CERCEVE.en);
    olc();
    const g = new ResizeObserver(olc);
    g.observe(el);
    return () => g.disconnect();
  }, [kaynak]);

  /** Yakinlastirirken imlecin altindaki nokta yerinde kalsin. */
  const olcekle = useCallback(
    (yeniOlcek: number, merkez?: { x: number; y: number }) => {
      if (!kaynak) return;
      setKadraj((k) => {
        if (!k) return k;
        const m = merkez ?? { x: CERCEVE.en / 2, y: CERCEVE.boy / 2 };
        const oran = yeniOlcek / k.olcek;
        return kadrajiSinirla(kaynak, {
          olcek: yeniOlcek,
          x: m.x - (m.x - k.x) * oran,
          y: m.y - (m.y - k.y) * oran,
        });
      });
    },
    [kaynak],
  );

  if (hata) {
    return (
      <Perde>
        <p className="text-[14px] text-ink">{hata}</p>
        <div className="mt-4 flex justify-end">
          <Dugme onClick={onIptal}>Kapat</Dugme>
        </div>
      </Perde>
    );
  }

  if (!kaynak || !kadraj) {
    return (
      <Perde>
        <p className="text-[14px] text-muted">Görsel açılıyor…</p>
      </Perde>
    );
  }

  const asgari = asgariOlcek(kaynak.en, kaynak.boy);
  const azami = asgari * 4;
  const kucuk = kaynak.en < CERCEVE.en || kaynak.boy < CERCEVE.boy;
  const ciktiEn = ciktiGenisligi(kadraj);
  const ciktiBoy = Math.round((ciktiEn * CERCEVE.boy) / CERCEVE.en);

  return (
    <Perde>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[16px] font-bold text-ink">
          Kırpma
          {kalan.toplam > 1 && (
            <span className="ml-2 text-[12.5px] font-normal text-muted">
              {kalan.sira}/{kalan.toplam}
            </span>
          )}
        </h2>
        <span className="max-w-[18rem] truncate text-[12.5px] text-muted" title={kaynak.ad}>
          {kaynak.ad} · {kaynak.en}×{kaynak.boy}
        </span>
      </div>

      <p className="mt-1 text-[12.5px] text-muted">
        Sürükleyerek konumlandır, tekerlek veya kaydırıcıyla yakınlaştır. Çerçevede gördüğün,
        kaydedilenin aynısıdır — oran her zaman 4:3, kaydedilecek çözünürlük{" "}
        <b className="text-ink-soft">
          {ciktiEn}×{ciktiBoy}
        </b>
        .
      </p>

      {kucuk && (
        <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-[12.5px] text-ink">
          Bu görsel {CERCEVE.en}×{CERCEVE.boy}’ten küçük; büyütüleceği için netliği düşebilir.
        </p>
      )}

      <div
        ref={cerceveRef}
        className="relative mx-auto mt-3 w-full max-w-[500px] cursor-grab overflow-hidden rounded-lg border border-line bg-black/40 active:cursor-grabbing"
        style={{ aspectRatio: `${CERCEVE.en} / ${CERCEVE.boy}`, touchAction: "none" }}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          surukleme.current = { x: e.clientX, y: e.clientY, kadrajX: kadraj.x, kadrajY: kadraj.y };
        }}
        onPointerMove={(e) => {
          const s = surukleme.current;
          if (!s) return;
          const dx = (e.clientX - s.x) / gosterimOlcegi;
          const dy = (e.clientY - s.y) / gosterimOlcegi;
          setKadraj(kadrajiSinirla(kaynak, { ...kadraj, x: s.kadrajX + dx, y: s.kadrajY + dy }));
        }}
        onPointerUp={() => (surukleme.current = null)}
        onPointerCancel={() => (surukleme.current = null)}
        onWheel={(e) => {
          const kutu = cerceveRef.current!.getBoundingClientRect();
          const merkez = {
            x: (e.clientX - kutu.left) / gosterimOlcegi,
            y: (e.clientY - kutu.top) / gosterimOlcegi,
          };
          const hedefOlcek = kadraj.olcek * (e.deltaY < 0 ? 1.12 : 1 / 1.12);
          olcekle(Math.min(azami, Math.max(asgari, hedefOlcek)), merkez);
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ transform: `scale(${gosterimOlcegi})`, width: CERCEVE.en, height: CERCEVE.boy }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={onizlemeUrl}
            alt=""
            draggable={false}
            className="absolute select-none"
            style={{
              left: kadraj.x,
              top: kadraj.y,
              width: kaynak.en * kadraj.olcek,
              height: kaynak.boy * kadraj.olcek,
              maxWidth: "none",
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-[12px] text-muted">Yakınlaştır</span>
        <input
          type="range"
          min={asgari}
          max={azami}
          step={(azami - asgari) / 100 || 0.01}
          value={kadraj.olcek}
          onChange={(e) => olcekle(Number(e.target.value))}
          className="flex-1 accent-[var(--color-accent)]"
        />
        <button
          type="button"
          onClick={() => setKadraj(ortalaKadraj(kaynak))}
          className="text-[12px] text-accent hover:underline"
        >
          sıfırla
        </button>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Dugme onClick={onIptal} disabled={mesgul}>
          {kalan.toplam > 1 ? "Bu fotoğrafı atla" : "Vazgeç"}
        </Dugme>
        <button
          type="button"
          disabled={mesgul}
          onClick={async () => {
            setMesgul(true);
            try {
              await onOnay(await kadrajiUret(kaynak, kadraj));
            } catch (e) {
              setHata(e instanceof Error ? e.message : "görsel üretilemedi");
            } finally {
              setMesgul(false);
            }
          }}
          className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {mesgul ? "Yükleniyor…" : "Kırp ve ekle"}
        </button>
      </div>
    </Perde>
  );
}

function Perde({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-xl overflow-auto rounded-2xl border border-line bg-paper p-5 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function Dugme({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-paper-2 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
