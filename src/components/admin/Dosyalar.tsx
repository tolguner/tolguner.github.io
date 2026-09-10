"use client";

import { useState } from "react";

import { medyayiGuncelle } from "@/app/admin/eylemler";
import { tarayiciIstemcisi } from "@/lib/supabase/tarayici";

export type Medya = { key: "cv_tr" | "cv_en"; storage_path: string; byte_size: number; version: number; updated_at: string };

const ADLAR: Record<Medya["key"], string> = { cv_tr: "CV — Türkçe", cv_en: "CV — İngilizce" };
const AZAMI = 20 * 1024 * 1024;

const TARIH = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" });

async function icerikAdi(dosya: File) {
  const ozet = await crypto.subtle.digest("SHA-256", await dosya.arrayBuffer());
  return [...new Uint8Array(ozet)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32) + ".pdf";
}

export default function Dosyalar({ medya, depoKoku }: { medya: Medya[]; depoKoku: string }) {
  const [hata, setHata] = useState<string | null>(null);
  const [not, setNot] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState<string | null>(null);

  const adres = (yol: string) => `${depoKoku}/storage/v1/object/public/documents/${yol}`;

  async function yukle(key: Medya["key"], dosya: File | undefined) {
    if (!dosya) return;
    setHata(null);
    setNot(null);

    // Uzantisi degistirilmis sahte PDF'i eleyelim: gercek PDF "%PDF-" ile baslar.
    const bas = new Uint8Array(await dosya.slice(0, 5).arrayBuffer());
    const imza = String.fromCharCode(...bas);
    if (dosya.type !== "application/pdf" || imza !== "%PDF-") {
      setHata(`${dosya.name}: geçerli bir PDF değil.`);
      return;
    }
    if (dosya.size > AZAMI) {
      setHata(`${dosya.name}: dosya 20 MB sınırını aşıyor.`);
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
    setNot(`${ADLAR[key]} güncellendi. /cv sayfasındaki bağlantı yeni dosyayı gösteriyor.`);
    location.reload();
  }

  return (
    <>
      <h1 className="font-serif text-[24px] font-bold tracking-tight text-ink">Dosyalar</h1>
      <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">
        CV sayfasındaki “CV (PDF)” düğmesi buradaki dosyayı gösterir. Yeni dosya yüklendiğinde eskisi{" "}
        <b>silinmez</b>: daha önce paylaştığın bağlantılar çalışmaya devam etsin diye. Dosya adları
        içeriğe göre üretildiği için bayat önbellek sorunu da oluşmaz.
      </p>

      {hata && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-ink">
          {hata}
        </p>
      )}
      {not && <p className="mt-4 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13px] text-muted">{not}</p>}

      <div className="mt-6 space-y-3">
        {(["cv_tr", "cv_en"] as const).map((key) => {
          const m = medya.find((x) => x.key === key);
          return (
            <div key={key} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper-2 p-4">
              <div className="min-w-0">
                <div className="text-[15px] font-bold text-ink">{ADLAR[key]}</div>
                {m ? (
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    sürüm {m.version} · {(m.byte_size / 1024).toFixed(0)} KB ·{" "}
                    {TARIH.format(new Date(m.updated_at))} ·{" "}
                    <a href={adres(m.storage_path)} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      aç
                    </a>
                  </p>
                ) : (
                  <p className="mt-0.5 text-[12.5px] text-muted">henüz yüklenmemiş</p>
                )}
              </div>

              <label className="cursor-pointer rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-paper">
                {mesgul === key ? "Yükleniyor…" : "Yeni PDF yükle"}
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => void yukle(key, e.target.files?.[0])}
                />
              </label>
            </div>
          );
        })}
      </div>
    </>
  );
}
