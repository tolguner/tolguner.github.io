"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { medyayaDon, medyayiGuncelle } from "@/app/admin/eylemler";
import { tarayiciIstemcisi } from "@/lib/supabase/tarayici";

export type Medya = {
  key: "cv_tr" | "cv_en";
  storage_path: string;
  byte_size: number;
  version: number;
  updated_at: string;
};

export type Surum = {
  id: string;
  key: string;
  storage_path: string;
  byte_size: number;
  version: number;
  created_at: string;
};

const ADLAR: Record<Medya["key"], string> = { cv_tr: "CV — Türkçe", cv_en: "CV — İngilizce" };
const ANAHTARLAR = ["cv_tr", "cv_en"] as const;
const AZAMI = 20 * 1024 * 1024;

const TARIH = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" });

const kb = (b: number) => `${(b / 1024).toFixed(0)} KB`;

async function icerikAdi(dosya: File) {
  const ozet = await crypto.subtle.digest("SHA-256", await dosya.arrayBuffer());
  return [...new Uint8Array(ozet)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32) + ".pdf";
}

export default function Dosyalar({
  medya,
  surumler,
  depoKoku,
}: {
  medya: Medya[];
  surumler: Surum[];
  depoKoku: string;
}) {
  const router = useRouter();
  const [hata, setHata] = useState<string | null>(null);
  const [not, setNot] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState<string | null>(null);
  const [acikGecmis, setAcikGecmis] = useState<string | null>(null);

  const adres = (yol: string) => `${depoKoku}/storage/v1/object/public/documents/${yol}`;

  async function yukle(key: Medya["key"], dosya: File | undefined) {
    if (!dosya) return;
    setHata(null);
    setNot(null);

    // Uzantisi degistirilmis sahte PDF'i eleyelim: gercek PDF "%PDF-" ile baslar.
    const bas = new Uint8Array(await dosya.slice(0, 5).arrayBuffer());
    if (dosya.type !== "application/pdf" || String.fromCharCode(...bas) !== "%PDF-") {
      setHata(`${dosya.name}: geçerli bir PDF değil.`);
      return;
    }
    if (dosya.size > AZAMI) {
      setHata(`${dosya.name}: dosya ${(dosya.size / 1048576).toFixed(1)} MB — 20 MB sınırını aşıyor.`);
      return;
    }

    setMesgul(key);
    const hedef = await icerikAdi(dosya);

    const { error } = await tarayiciIstemcisi().storage.from("documents").upload(hedef, dosya, {
      contentType: "application/pdf",
      cacheControl: "31536000, immutable",
      upsert: true,
    });
    if (error) {
      setMesgul(null);
      setHata(`${dosya.name}: ${error.message}`);
      return;
    }

    const sonuc = await medyayiGuncelle(key, hedef, dosya.size);
    setMesgul(null);
    if (!sonuc.ok) {
      setHata(sonuc.hata);
      return;
    }
    // `location.reload()` yerine router.refresh(): sayfa yenilenince asagidaki
    // bilgi mesaji hic gorunmeden kayboluyordu.
    setNot(`${ADLAR[key]} güncellendi (sürüm ${sonuc.version}). /cv sayfasındaki bağlantı yeni dosyayı gösteriyor.`);
    router.refresh();
  }

  async function surumeDon(s: Surum) {
    setHata(null);
    setMesgul(s.key);
    const sonuc = await medyayaDon(s.id);
    setMesgul(null);
    if (!sonuc.ok) {
      setHata(sonuc.hata);
      return;
    }
    setNot(`${ADLAR[s.key as Medya["key"]]} sürüm ${s.version}'e döndürüldü.`);
    router.refresh();
  }

  return (
    <>
      <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">Dosyalar</h1>
      <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">
        CV sayfasındaki “CV (PDF)” düğmesi buradaki dosyayı gösterir. Yeni dosya yüklendiğinde eskisi{" "}
        <b>silinmez</b>: daha önce paylaştığın bağlantılar çalışmaya devam etsin diye. Dosya adları
        içeriğe göre üretildiği için bayat önbellek sorunu da oluşmaz — ve eski sürümler durduğu için
        istediğin an geri dönebilirsin.
      </p>

      {hata && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-ink">
          {hata}
        </p>
      )}
      {not && <p className="mt-4 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13px] text-muted">{not}</p>}

      <div className="mt-6 space-y-3">
        {ANAHTARLAR.map((key) => {
          const m = medya.find((x) => x.key === key);
          const gecmis = surumler.filter((s) => s.key === key);
          const acik = acikGecmis === key;

          return (
            <div key={key} className="rounded-2xl border border-line bg-paper-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[15px] font-bold text-ink">{ADLAR[key]}</div>
                  {m ? (
                    <p className="mt-0.5 text-[12.5px] text-muted">
                      sürüm {m.version} · {kb(m.byte_size)} · {TARIH.format(new Date(m.updated_at))} ·{" "}
                      <a href={adres(m.storage_path)} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                        aç
                      </a>
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[12.5px] text-muted">henüz yüklenmemiş</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {gecmis.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setAcikGecmis(acik ? null : key)}
                      className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft transition hover:text-ink"
                    >
                      {acik ? "Geçmişi gizle" : `Geçmiş (${gecmis.length})`}
                    </button>
                  )}
                  <label className="cursor-pointer rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-paper">
                    {mesgul === key ? "Yükleniyor…" : "Yeni PDF yükle"}
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(e) => {
                        const d = e.target.files?.[0];
                        e.target.value = "";
                        void yukle(key, d);
                      }}
                    />
                  </label>
                </div>
              </div>

              {acik && (
                <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                  {gecmis.map((s) => {
                    const guncel = m?.storage_path === s.storage_path;
                    return (
                      <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 text-[12.5px]">
                        <span className="text-muted">
                          <span className="text-ink-soft">sürüm {s.version}</span> · {kb(s.byte_size)} ·{" "}
                          {TARIH.format(new Date(s.created_at))} ·{" "}
                          <a href={adres(s.storage_path)} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                            aç
                          </a>
                          {guncel && <span className="ml-2 text-accent">şu an yayında</span>}
                        </span>
                        <button
                          type="button"
                          disabled={guncel || mesgul === key}
                          onClick={() => void surumeDon(s)}
                          className="rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-ink transition hover:bg-paper disabled:opacity-35"
                        >
                          Bu sürüme dön
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
