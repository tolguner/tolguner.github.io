"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BolumBasligi, SayfaBasligi } from "@/components/admin/duzen";
import { cevapKaydet, cevapOnayla } from "@/app/admin/eylemler";

export type Cevap = {
  key: string;
  category: string;
  question: string;
  hint: string | null;
  answer: string | null;
  answer_en: string | null;
  confirmed: boolean;
  sensitive: boolean;
  sort: number;
};

const KATEGORI: [string, string, string][] = [
  ["iletisim", "İletişim", "Formun ilk sayfası"],
  ["egitim", "Eğitim", "Neden hâlâ öğrenci olduğunu anlatan kısım"],
  ["staj", "Staj", "Zorunlu stajın koşulları"],
  ["calisma", "Çalışma koşulları", "Konum, çalışma şekli, izinler"],
  ["ucret", "Ücret", "Boş bırakırsan form geldiğinde sorarım"],
  ["dil", "Diller", ""],
  ["deneyim", "Deneyim", "LinkedIn'in \"kaç yıllık X deneyiminiz var\" soruları — sayı ister"],
  ["baglanti", "Bağlantılar", ""],
  ["kisisel", "Kişisel", "Yalnızca form ısrarla isterse"],
  ["tanitim", "Tanıtım", "Ön yazıların ve açık uçlu soruların temeli"],
];

type Durum = "onayli" | "oneri" | "bos";
function durum(c: Cevap): Durum {
  if (!c.answer) return "bos";
  return c.confirmed ? "onayli" : "oneri";
}

const FILTRE: { deger: "" | Durum; etiket: string }[] = [
  { deger: "", etiket: "Tümü" },
  { deger: "bos", etiket: "Boş" },
  { deger: "oneri", etiket: "Onay bekleyen" },
  { deger: "onayli", etiket: "Onaylı" },
];

const GIRDI =
  "w-full rounded-xl border border-line bg-paper px-3 py-2 text-[13.5px] text-ink outline-none transition placeholder:text-muted/60 focus:border-accent";

function Satir({ c }: { c: Cevap }) {
  const router = useRouter();
  const [tr, setTr] = useState(c.answer ?? "");
  const [en, setEn] = useState(c.answer_en ?? "");
  const [enAcik, setEnAcik] = useState(Boolean(c.answer_en));
  const [mesgul, setMesgul] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const kirli = tr !== (c.answer ?? "") || en !== (c.answer_en ?? "");
  const d = durum(c);
  const uzun = c.category === "tanitim";

  async function kaydet() {
    setHata(null);
    setMesgul(true);
    const s = await cevapKaydet(c.key, tr, en);
    setMesgul(false);
    if (!s.ok) return setHata(s.hata);
    router.refresh();
  }

  async function onayla() {
    setHata(null);
    setMesgul(true);
    const s = await cevapOnayla(c.key);
    setMesgul(false);
    if (!s.ok) return setHata(s.hata);
    router.refresh();
  }

  const serit = d === "onayli" ? "bg-accent" : d === "oneri" ? "bg-amber-500" : "bg-line";

  return (
    <div className="relative grid gap-3 border-t border-line py-4 pl-4 first:border-t-0 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-6">
      {/* Durumu renk seridi anlatiyor: yesil-mavi onayli, amber oneri, gri bos. */}
      <span aria-hidden className={`absolute bottom-4 left-0 top-4 w-[3px] rounded-full ${serit}`} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13.5px] font-semibold text-ink">{c.question}</span>
          {c.sensitive && (
            <span
              title="Onaylı olsa bile forma yazmadan önce sana söylerim"
              className="rounded-full border border-amber-500/50 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300"
            >
              hassas
            </span>
          )}
        </div>
        {c.hint && <p className="mt-1 text-[12px] leading-relaxed text-muted">{c.hint}</p>}
      </div>

      <div className="min-w-0">
        {uzun ? (
          <textarea value={tr} onChange={(e) => setTr(e.target.value)} rows={5} className={`${GIRDI} resize-y leading-relaxed`} />
        ) : (
          <input value={tr} onChange={(e) => setTr(e.target.value)} placeholder="Türkçe cevap" className={GIRDI} />
        )}

        {enAcik ? (
          uzun ? (
            <textarea
              value={en}
              onChange={(e) => setEn(e.target.value)}
              rows={5}
              placeholder="English answer"
              className={`${GIRDI} mt-2 resize-y leading-relaxed`}
            />
          ) : (
            <input value={en} onChange={(e) => setEn(e.target.value)} placeholder="English answer" className={`${GIRDI} mt-2`} />
          )
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {kirli ? (
            <button
              type="button"
              disabled={mesgul}
              onClick={() => void kaydet()}
              className="rounded-full bg-accent px-3.5 py-1 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {tr.trim() ? "Kaydet ve onayla" : "Boşalt"}
            </button>
          ) : d === "oneri" ? (
            <button
              type="button"
              disabled={mesgul}
              onClick={() => void onayla()}
              className="rounded-full border border-accent/60 px-3.5 py-1 text-[12px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-40"
            >
              Doğru, onayla
            </button>
          ) : d === "onayli" ? (
            <span className="text-[12px] font-semibold text-accent">✓ Onaylı</span>
          ) : (
            <span className="text-[12px] text-muted">Boş — form bu soruyu sorarsa sana danışırım</span>
          )}
          {!enAcik && (
            <button type="button" onClick={() => setEnAcik(true)} className="text-[12px] text-muted transition hover:text-ink">
              + İngilizcesi
            </button>
          )}
          {hata && <span className="text-[12px] text-red-600 dark:text-red-400">{hata}</span>}
        </div>
      </div>
    </div>
  );
}

export default function CevapBankasi({ cevaplar }: { cevaplar: Cevap[] }) {
  const [filtre, setFiltre] = useState<"" | Durum>("");

  const sayi = useMemo(
    () => ({
      toplam: cevaplar.length,
      onayli: cevaplar.filter((c) => durum(c) === "onayli").length,
      oneri: cevaplar.filter((c) => durum(c) === "oneri").length,
      bos: cevaplar.filter((c) => durum(c) === "bos").length,
    }),
    [cevaplar],
  );
  const oran = sayi.toplam ? Math.round((sayi.onayli / sayi.toplam) * 100) : 0;

  return (
    <>
      <SayfaBasligi
        etiket="Takip"
        baslik="Cevap bankası"
        aciklama={
          <>
            Başvuru formlarının hep sorduğu sorular. Başvuru sırasında <b className="text-ink-soft">yalnızca onayladığın</b>{" "}
            cevaplar kullanılır; boş ya da onaysız bir soru gelirse durup sana sorarım. Buradaki bilgiler
            yalnızca veritabanında durur, hiçbir depoya yazılmaz.
          </>
        }
        eylem={
          <a
            href="/admin/kesfet"
            className="whitespace-nowrap rounded-full border border-line px-4 py-1.5 text-[12.5px] font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            Keşfet&apos;e dön
          </a>
        }
      />

      <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[26px] font-bold leading-none text-ink">
              %{oran}
              <span className="ml-2 text-[13px] font-semibold text-muted">
                hazır · {sayi.onayli} / {sayi.toplam} onaylı
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-[12px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {sayi.oneri} onay bekleyen öneri
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-line" />
              {sayi.bos} boş
            </span>
          </div>
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-paper">
          <div className="bg-accent transition-all" style={{ width: `${(sayi.onayli / Math.max(sayi.toplam, 1)) * 100}%` }} />
          <div className="bg-amber-500/70 transition-all" style={{ width: `${(sayi.oneri / Math.max(sayi.toplam, 1)) * 100}%` }} />
        </div>
      </div>

      <div className="mt-5 flex rounded-full border border-line bg-paper-2 p-1 sm:w-fit">
        {FILTRE.map((f) => (
          <button
            key={f.deger}
            type="button"
            onClick={() => setFiltre(f.deger)}
            className={`flex-1 rounded-full px-3.5 py-1 text-[12.5px] font-semibold transition sm:flex-none ${
              filtre === f.deger ? "bg-accent text-white" : "text-muted hover:text-ink"
            }`}
          >
            {f.etiket}
          </button>
        ))}
      </div>

      {KATEGORI.map(([k, ad, alt]) => {
        const satirlar = cevaplar.filter((c) => c.category === k && (!filtre || durum(c) === filtre));
        if (!satirlar.length) return null;
        return (
          <section key={k}>
            <BolumBasligi>
              {ad}
              {alt && <span className="font-normal normal-case tracking-normal text-muted/80">— {alt}</span>}
            </BolumBasligi>
            <div className="mt-3 rounded-2xl border border-line bg-paper-2 px-4">
              {satirlar.map((c) => (
                // key'e cevabi da katiyoruz: kayittan sonra sunucudan gelen yeni
                // deger, satirin yerel taslagini sifirlasin.
                <Satir key={`${c.key}:${c.answer ?? ""}:${c.answer_en ?? ""}:${c.confirmed}`} c={c} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
