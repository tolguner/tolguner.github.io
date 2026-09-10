"use client";

import { useState } from "react";
import type { Alan } from "@/lib/content/alanlar";
import type { Ceviri } from "@/lib/content/types";

/* Yol yardimcilari — "experience.0.title.tr" gibi duz yollar. */

export function oku(kok: unknown, yol: string): unknown {
  return yol.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], kok);
}

/** Degismez yazma: yol boyunca yalnizca dokunulan dugumler kopyalanir. */
export function yaz<T>(kok: T, yol: string, deger: unknown): T {
  const [k, ...kalan] = yol.split(".");
  const mevcut = kok as unknown as Record<string, unknown>;
  const kopya: Record<string, unknown> = Array.isArray(kok)
    ? ([...(kok as unknown[])] as unknown as Record<string, unknown>)
    : { ...mevcut };
  kopya[k] = kalan.length ? yaz(mevcut[k], kalan.join("."), deger) : deger;
  return kopya as unknown as T;
}

const girdiSinifi =
  "w-full rounded-lg border border-line bg-paper-2 px-2.5 py-1.5 text-[13.5px] text-ink outline-none transition focus:border-accent";

type Yazar = (yol: string, deger: unknown) => void;

/* ------------------------------------------------------------- ilkeller */

/**
 * TR ve EN yan yana. `md` altinda alt alta iner.
 * Bu bilesen tek basina "iki dili yan yana duzenleme" gereksinimini karsiliyor:
 * form satiri dogrudan depolama dugumu.
 */
/**
 * MODUL SEVIYESINDE tanimli olmasi sart. Onceden `CiftDilli`nin govdesinde
 * tanimliydi: her tus vurusunda yeni bir bilesen TURU olusuyordu, React de
 * bunu farkli bir bilesen sayip <input>u soküp yeniden takiyordu. Sonuc:
 * her karakterden sonra odak ve imlec konumu kayboluyordu.
 */
function DilKutusu({
  dil,
  deger,
  yol,
  yazarak,
  satir,
}: {
  dil: "tr" | "en";
  deger: Ceviri;
  yol: string;
  yazarak: Yazar;
  satir?: number;
}) {
  const ortak = {
    value: deger?.[dil] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      yazarak(`${yol}.${dil}`, e.target.value),
  };
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">{dil}</div>
      {satir ? (
        <textarea rows={satir} {...ortak} className={`${girdiSinifi} resize-y leading-relaxed`} />
      ) : (
        <input type="text" {...ortak} className={girdiSinifi} />
      )}
    </div>
  );
}

function CiftDilli({
  etiket,
  deger,
  yol,
  yazarak,
  satir,
}: {
  etiket: string;
  deger: Ceviri;
  yol: string;
  yazarak: Yazar;
  satir?: number;
}) {
  return (
    <div className="py-2.5">
      <div className="mb-1.5 text-[12.5px] font-semibold text-ink-soft">{etiket}</div>
      <div className="flex flex-col gap-2.5 md:flex-row">
        <DilKutusu dil="tr" deger={deger} yol={yol} yazarak={yazarak} satir={satir} />
        <DilKutusu dil="en" deger={deger} yol={yol} yazarak={yazarak} satir={satir} />
      </div>
    </div>
  );
}

/** Cevrilmeyen skaler. "ortak" rozetiyle gorsel olarak ayrisir. */
function Duz({
  etiket,
  deger,
  yol,
  yazarak,
  girdi,
}: {
  etiket: string;
  deger: unknown;
  yol: string;
  yazarak: Yazar;
  girdi?: "metin" | "sayi" | "url";
}) {
  return (
    <div className="py-2.5">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-[12.5px] font-semibold text-ink-soft">{etiket}</span>
        <span className="rounded-full border border-line px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-muted">
          ortak
        </span>
      </div>
      <input
        type={girdi === "sayi" ? "number" : girdi === "url" ? "url" : "text"}
        step={girdi === "sayi" ? "any" : undefined}
        value={(deger as string | number | undefined) ?? ""}
        onChange={(e) =>
          yazarak(yol, girdi === "sayi" ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value)
        }
        className={`${girdiSinifi} md:max-w-md`}
      />
    </div>
  );
}

function ListeDugmeleri({
  index,
  uzunluk,
  tasi,
  sil,
}: {
  index: number;
  uzunluk: number;
  tasi: (a: number, b: number) => void;
  sil: (i: number) => void;
}) {
  const d = "rounded-md border border-line px-1.5 py-0.5 text-[11px] text-muted transition hover:text-ink disabled:opacity-30";
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" title="Yukarı" disabled={index === 0} onClick={() => tasi(index, index - 1)} className={d}>
        ↑
      </button>
      <button
        type="button"
        title="Aşağı"
        disabled={index === uzunluk - 1}
        onClick={() => tasi(index, index + 1)}
        className={d}
      >
        ↓
      </button>
      <button type="button" title="Sil" onClick={() => sil(index)} className={`${d} hover:text-red-400`}>
        ✕
      </button>
    </div>
  );
}

/** Cevrilebilir madde listesi: {id, value:{tr,en}}[] */
function CeviriListesi({
  etiket,
  tekil,
  deger,
  yol,
  yazarak,
}: {
  etiket: string;
  tekil: string;
  deger: { id: string; value: Ceviri }[];
  yol: string;
  yazarak: Yazar;
}) {
  const liste = deger ?? [];
  const yeniden = (yeni: typeof liste) => yazarak(yol, yeni);
  const tasi = (a: number, b: number) => {
    const k = [...liste];
    [k[a], k[b]] = [k[b], k[a]];
    yeniden(k);
  };

  return (
    <div className="py-2.5">
      <div className="mb-1.5 text-[12.5px] font-semibold text-ink-soft">{etiket}</div>
      <div className="space-y-2">
        {liste.map((oge, i) => (
          <div key={oge.id} className="flex items-start gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row">
              <input
                value={oge.value?.tr ?? ""}
                onChange={(e) => yazarak(`${yol}.${i}.value.tr`, e.target.value)}
                className={girdiSinifi}
                aria-label={`${tekil} ${i + 1} TR`}
              />
              <input
                value={oge.value?.en ?? ""}
                onChange={(e) => yazarak(`${yol}.${i}.value.en`, e.target.value)}
                className={girdiSinifi}
                aria-label={`${tekil} ${i + 1} EN`}
              />
            </div>
            <ListeDugmeleri
              index={i}
              uzunluk={liste.length}
              tasi={tasi}
              sil={(x) => yeniden(liste.filter((_, j) => j !== x))}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => yeniden([...liste, { id: crypto.randomUUID(), value: { tr: "", en: "" } }])}
        className="mt-2 rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-ink-soft transition hover:text-ink"
      >
        + {tekil} ekle
      </button>
    </div>
  );
}

/** Cevrilmeyen duz string dizisi (Card.tech). */
function DuzListe({
  etiket,
  tekil,
  deger,
  yol,
  yazarak,
}: {
  etiket: string;
  tekil: string;
  deger: string[];
  yol: string;
  yazarak: Yazar;
}) {
  const liste = deger ?? [];
  const yeniden = (yeni: string[]) => yazarak(yol, yeni);
  const tasi = (a: number, b: number) => {
    const k = [...liste];
    [k[a], k[b]] = [k[b], k[a]];
    yeniden(k);
  };

  return (
    <div className="py-2.5">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-[12.5px] font-semibold text-ink-soft">{etiket}</span>
        <span className="rounded-full border border-line px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-muted">
          ortak
        </span>
      </div>
      <div className="space-y-2">
        {liste.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={v}
              onChange={(e) => yazarak(`${yol}.${i}`, e.target.value)}
              className={`${girdiSinifi} md:max-w-sm`}
              aria-label={`${tekil} ${i + 1}`}
            />
            <ListeDugmeleri
              index={i}
              uzunluk={liste.length}
              tasi={tasi}
              sil={(x) => yeniden(liste.filter((_, j) => j !== x))}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => yeniden([...liste, ""])}
        className="mt-2 rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-ink-soft transition hover:text-ink"
      >
        + {tekil} ekle
      </button>
    </div>
  );
}

/**
 * Kimlikli nesne listesi. Varsayilan KAPALI: 11 yolculuk duragi acikken
 * ekranda kaybolursun.
 */
function NesneListesi({
  alan,
  kok,
  yazarak,
}: {
  alan: Extract<Alan, { tur: "nesneListesi" }>;
  kok: unknown;
  yazarak: Yazar;
}) {
  const liste = (oku(kok, alan.yol) as Record<string, unknown>[]) ?? [];
  const [acik, setAcik] = useState<Record<string, boolean>>({});
  const yeniden = (yeni: typeof liste) => yazarak(alan.yol, yeni);
  const tasi = (a: number, b: number) => {
    const k = [...liste];
    [k[a], k[b]] = [k[b], k[a]];
    yeniden(k);
  };

  return (
    <div className="py-2.5">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] font-semibold text-ink-soft">{alan.etiket}</span>
        <span className="text-[11.5px] text-muted">{liste.length} kayıt</span>
      </div>

      <div className="space-y-2">
        {liste.map((oge, i) => {
          const id = String(oge.id ?? i);
          const acikMi = acik[id] ?? false;
          return (
            <div key={id} className="rounded-lg border border-line bg-paper-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setAcik((a) => ({ ...a, [id]: !acikMi }))}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="text-[11px] text-muted">{acikMi ? "▾" : "▸"}</span>
                  <span className="truncate text-[13.5px] text-ink">{alan.ozet(oge)}</span>
                </button>
                <ListeDugmeleri
                  index={i}
                  uzunluk={liste.length}
                  tasi={tasi}
                  sil={(x) => yeniden(liste.filter((_, j) => j !== x))}
                />
              </div>
              {acikMi && (
                <div className="border-t border-line px-3 pb-3">
                  {alan.alanlar.map((alt, j) => (
                    <AlanCiz key={j} alan={alt} kok={kok} yazarak={yazarak} onek={`${alan.yol}.${i}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          const yeni = alan.yeni();
          yeniden([...liste, yeni]);
          setAcik((a) => ({ ...a, [String(yeni.id)]: true }));
        }}
        className="mt-2 rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-ink-soft transition hover:text-ink"
      >
        + {alan.tekil} ekle
      </button>
    </div>
  );
}

/* ------------------------------------------------------------ cizim */

export function AlanCiz({
  alan,
  kok,
  yazarak,
  onek = "",
}: {
  alan: Alan;
  kok: unknown;
  yazarak: Yazar;
  onek?: string;
}) {
  if (alan.tur === "grup") {
    return (
      <section className="mt-5 rounded-xl border border-line bg-paper-2/40 p-4 sm:p-5">
        <h2 className="text-[15px] font-bold text-ink">{alan.baslik}</h2>
        {alan.aciklama && <p className="mt-1 text-[12.5px] text-muted">{alan.aciklama}</p>}
        <div className="mt-2 divide-y divide-line/60">
          {alan.alanlar.map((a, i) => (
            <AlanCiz key={i} alan={a} kok={kok} yazarak={yazarak} onek={onek} />
          ))}
        </div>
      </section>
    );
  }

  const yol = onek ? `${onek}.${alan.yol}` : alan.yol;

  switch (alan.tur) {
    case "metin":
      return <CiftDilli etiket={alan.etiket} yol={yol} deger={oku(kok, yol) as Ceviri} yazarak={yazarak} />;
    case "paragraf":
      return (
        <CiftDilli
          etiket={alan.etiket}
          yol={yol}
          deger={oku(kok, yol) as Ceviri}
          yazarak={yazarak}
          satir={alan.satir ?? 3}
        />
      );
    case "duz":
      return <Duz etiket={alan.etiket} yol={yol} deger={oku(kok, yol)} yazarak={yazarak} girdi={alan.girdi} />;
    case "liste":
      return (
        <CeviriListesi
          etiket={alan.etiket}
          tekil={alan.tekil}
          yol={yol}
          deger={oku(kok, yol) as { id: string; value: Ceviri }[]}
          yazarak={yazarak}
        />
      );
    case "duzListe":
      return (
        <DuzListe etiket={alan.etiket} tekil={alan.tekil} yol={yol} deger={oku(kok, yol) as string[]} yazarak={yazarak} />
      );
    case "nesneListesi":
      return <NesneListesi alan={{ ...alan, yol }} kok={kok} yazarak={yazarak} />;
  }
}
