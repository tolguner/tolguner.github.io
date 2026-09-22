"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SayfaBasligi, YUZEY_SAKIN } from "@/components/admin/duzen";
import { ilanKarari, onYaziKaydet, onYaziOnayla, type IlanKarari } from "@/app/admin/eylemler";

export type Ilan = {
  id: string;
  platform: "linkedin" | "kariyernet" | "youthall" | "diger";
  company: string;
  position: string;
  location: string | null;
  work_mode: "is_yerinde" | "hibrit" | "uzaktan" | null;
  job_url: string;
  kind: "staj" | "yeni_mezun" | "belirsiz";
  easy_apply: boolean | null;
  deadline: string | null;
  summary: string | null;
  /** Eski 0-100 puan; yalnizca 22.09.2026 oncesi kayitlarda dolu. */
  score: number | null;
  fit: number | null;
  fit_cv: number | null;
  fit_goal: number | null;
  red_flags: string[];
  warnings: string[];
  requirements: Sart[] | null;
  score_reasons: string[];
  areas: string[];
  decision: "yeni" | "listede" | "ilgilenmiyorum" | "basvuruldu";
  found_at: string;
  cover_letter: string | null;
  cover_letter_lang: "tr" | "en" | null;
  cover_letter_confirmed: boolean;
};

export type Sart = {
  sart: string;
  onem: "kritik" | "yuksek" | "anlamli" | "tercih" | "dusuk";
  kaynak: "acik" | "yapisal" | "tahmin";
  alinti?: string;
  eslesme: "var" | "kismi" | "yok";
  not?: string;
};

const ONEM: Record<Sart["onem"], string> = {
  kritik: "Kritik",
  yuksek: "Yüksek",
  anlamli: "Anlamlı",
  tercih: "Tercih",
  dusuk: "Düşük sinyal",
};
const KAYNAK: Record<Sart["kaynak"], string> = { acik: "İlan açıkça", yapisal: "İlanın yapısı", tahmin: "Tahmin" };
const ESLESME: Record<Sart["eslesme"], string> = { var: "✓ Var", kismi: "~ Kısmi", yok: "✗ Yok" };

const PLATFORM: Record<Ilan["platform"], string> = {
  linkedin: "LinkedIn",
  kariyernet: "Kariyer.net",
  youthall: "Youthall",
  diger: "Diğer",
};
const CALISMA: Record<NonNullable<Ilan["work_mode"]>, string> = {
  is_yerinde: "İş yerinde",
  hibrit: "Hibrit",
  uzaktan: "Uzaktan",
};
const TUR: Record<Ilan["kind"], string> = { staj: "Staj", yeni_mezun: "Yeni mezun / MT", belirsiz: "Tür belirsiz" };
const ALAN: Record<string, string> = { veri: "Veri", urun: "Ürün / Proje", yazilim: "Yazılım / IT", erp: "ERP / İş analizi" };

type Sekme = "yeni" | "listede" | "ilgilenmiyorum";
const SEKMELER: { deger: Sekme; etiket: string }[] = [
  { deger: "yeni", etiket: "Karar bekleyen" },
  { deger: "listede", etiket: "Başvuru listem" },
  { deger: "ilgilenmiyorum", etiket: "İlgilenmediklerim" },
];

const GUN = 86_400_000;
const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });

function kalanGun(tarih: string | null) {
  if (!tarih) return null;
  const bugun = new Date(new Date().toISOString().slice(0, 10)).getTime();
  return Math.round((new Date(tarih).getTime() - bugun) / GUN);
}

const ONDALIK = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Puan rozeti, 1-5 butunsel puan (career-ops bantlari): 4,0+ basvurmaya deger,
 * 3,5-3,9 ancak ozel bir sebep varsa, alti onerilmez. 22.09.2026 oncesi
 * kayitlarda yalnizca eski 0-100 puan var; o soluk ve "eski" etiketiyle gorunur.
 */
function Puan({ ilan }: { ilan: Ilan }) {
  const { fit, score } = ilan;
  const renk =
    fit === null
      ? "border-line text-muted"
      : fit >= 4
        ? "border-accent bg-accent text-white"
        : fit >= 3.5
          ? "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : "border-line text-muted";
  const eski = fit === null && score !== null;
  return (
    <span
      title={eski ? "Eski 0–100 puan; yeni modelle puanlanmadı" : "Genel uyum puanı (1–5)"}
      className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border text-center ${renk}`}
    >
      <span className={`font-bold leading-none ${eski ? "text-[14px] opacity-60" : "text-[17px]"}`}>
        {fit !== null ? ONDALIK.format(fit) : (score ?? "–")}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-80">
        {eski ? "eski" : "/ 5"}
      </span>
    </span>
  );
}

/** Sart tablosu: yalnizca "Listeye al" denen ilanlarda, basvurudan once doldurulur. */
function Sartlar({ satirlar }: { satirlar: Sart[] }) {
  const eksik = satirlar.filter((s) => s.eslesme !== "var" && (s.onem === "kritik" || s.onem === "yuksek")).length;
  return (
    <details className="mt-3 rounded-xl border border-line bg-paper px-3 py-2">
      <summary className="cursor-pointer text-[12.5px] font-semibold text-ink">
        Şart tablosu · {satirlar.length} şart
        {eksik > 0 && <span className="text-red-600 dark:text-red-400"> · {eksik} kritik/yüksek eksik</span>}
      </summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-[12px]">
          <thead className="text-muted">
            <tr>
              <th className="py-1 pr-3 font-semibold">Şart</th>
              <th className="py-1 pr-3 font-semibold">Önem</th>
              <th className="py-1 pr-3 font-semibold">Dayanak</th>
              <th className="py-1 font-semibold">Sende</th>
            </tr>
          </thead>
          <tbody className="text-ink-soft">
            {satirlar.map((s, n) => (
              <tr key={n} className="border-t border-line align-top">
                <td className="py-1.5 pr-3">
                  <div className="text-ink">{s.sart}</div>
                  {s.alinti && <div className="mt-0.5 italic text-muted">&ldquo;{s.alinti}&rdquo;</div>}
                  {s.not && <div className="mt-0.5">{s.not}</div>}
                </td>
                <td className="whitespace-nowrap py-1.5 pr-3">{ONEM[s.onem]}</td>
                <td className="whitespace-nowrap py-1.5 pr-3">{KAYNAK[s.kaynak]}</td>
                <td
                  className={`whitespace-nowrap py-1.5 font-semibold ${
                    s.eslesme === "var" ? "text-accent" : s.eslesme === "yok" ? "text-red-600 dark:text-red-400" : ""
                  }`}
                >
                  {ESLESME[s.eslesme]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function Rozet({ children, vurgu }: { children: React.ReactNode; vurgu?: "accent" | "uyari" }) {
  const renk =
    vurgu === "accent"
      ? "border-accent/40 bg-accent/10 text-accent"
      : vurgu === "uyari"
        ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
        : "border-line text-muted";
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${renk}`}>{children}</span>;
}

/**
 * On yazi. Taslak Claude'dan gelir (onaysiz); Tolga okur, duzenler, onaylar.
 * Basvuruda yalnizca onayli metin kullanilir. Kartlar uzamasin diye kapali baslar.
 */
function OnYazi({ ilan }: { ilan: Ilan }) {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [metin, setMetin] = useState(ilan.cover_letter ?? "");
  const [mesgul, setMesgul] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const kirli = metin !== (ilan.cover_letter ?? "");
  const kelime = metin.trim() ? metin.trim().split(/\s+/).length : 0;

  async function calistir(is: () => Promise<{ ok: true } | { ok: false; hata: string }>) {
    setHata(null);
    setMesgul(true);
    const s = await is();
    setMesgul(false);
    if (!s.ok) return setHata(s.hata);
    router.refresh();
  }

  if (!ilan.cover_letter) {
    return (
      <p className="mt-3 rounded-xl border border-dashed border-line px-3 py-2 text-[12px] text-muted">
        Ön yazı taslağı yok. Sohbette <b className="text-ink-soft">&quot;ön yazıları hazırla&quot;</b> de.
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-line bg-paper">
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
          Ön yazı
          <span className="rounded-full border border-line px-1.5 py-px text-[10px] uppercase text-muted">
            {ilan.cover_letter_lang ?? "?"}
          </span>
          {ilan.cover_letter_confirmed ? (
            <span className="text-[11.5px] font-semibold text-accent">✓ Onaylı</span>
          ) : (
            <span className="text-[11.5px] font-semibold text-amber-700 dark:text-amber-300">Taslak — onayını bekliyor</span>
          )}
        </span>
        <span aria-hidden className={`text-[10px] text-muted transition ${acik ? "rotate-180" : ""}`}>▼</span>
      </button>

      {acik && (
        <div className="border-t border-line px-3 pb-3 pt-2">
          <textarea
            value={metin}
            onChange={(e) => setMetin(e.target.value)}
            rows={10}
            className="w-full resize-y rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13px] leading-relaxed text-ink outline-none transition focus:border-accent"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {kirli ? (
              <button
                type="button"
                disabled={mesgul}
                onClick={() => void calistir(() => onYaziKaydet(ilan.id, metin))}
                className="rounded-full bg-accent px-3.5 py-1 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                Kaydet ve onayla
              </button>
            ) : !ilan.cover_letter_confirmed ? (
              <button
                type="button"
                disabled={mesgul}
                onClick={() => void calistir(() => onYaziOnayla(ilan.id))}
                className="rounded-full border border-accent/60 px-3.5 py-1 text-[12px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-40"
              >
                Olduğu gibi onayla
              </button>
            ) : null}
            {kirli && (
              <button type="button" onClick={() => setMetin(ilan.cover_letter ?? "")} className="text-[12px] text-muted hover:text-ink">
                değişikliği geri al
              </button>
            )}
            <span className="ml-auto text-[11.5px] text-muted">{kelime} kelime</span>
            {hata && <span className="w-full text-[12px] text-red-600 dark:text-red-400">{hata}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Kesfet({ ilanlar }: { ilanlar: Ilan[] }) {
  const router = useRouter();
  const [sekme, setSekme] = useState<Sekme>("yeni");
  const [platform, setPlatform] = useState<"" | Ilan["platform"]>("");
  const [alan, setAlan] = useState("");
  const [tur, setTur] = useState<"" | Ilan["kind"]>("");
  const [bekleyen, setBekleyen] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const ozet = useMemo(() => {
    const dun = Date.now() - GUN;
    return {
      yeni: ilanlar.filter((i) => i.decision === "yeni").length,
      listede: ilanlar.filter((i) => i.decision === "listede").length,
      guclu: ilanlar.filter((i) => i.decision === "yeni" && (i.fit ?? 0) >= 4).length,
      bugun: ilanlar.filter((i) => new Date(i.found_at).getTime() > dun).length,
      acil: ilanlar.filter((i) => {
        const k = kalanGun(i.deadline);
        return i.decision !== "ilgilenmiyorum" && k !== null && k >= 0 && k <= 7;
      }).length,
    };
  }, [ilanlar]);

  const liste = useMemo(
    () =>
      ilanlar
        .filter((i) => i.decision === sekme)
        .filter((i) => !platform || i.platform === platform)
        .filter((i) => !alan || i.areas.includes(alan))
        .filter((i) => !tur || i.kind === tur)
        .sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0) || (b.score ?? -1) - (a.score ?? -1)),
    [ilanlar, sekme, platform, alan, tur],
  );

  async function karar(id: string, yeni: IlanKarari) {
    setHata(null);
    setBekleyen(id);
    const sonuc = await ilanKarari(id, yeni);
    setBekleyen(null);
    if (!sonuc.ok) return setHata(sonuc.hata);
    router.refresh();
  }

  const SECIM =
    "rounded-full border border-line bg-paper-2 px-3 py-1.5 text-[12.5px] text-ink outline-none transition focus:border-accent";

  return (
    <>
      <SayfaBasligi
        etiket="Takip"
        baslik="Keşfet"
        aciklama={
          <>
            Günlük keşif görevinin bulduğu, henüz başvurmadığın ilanlar. Puan 1–5: 4,0 ve üstü
            başvurmaya değer, 3,5–3,9 ancak özel bir sebep varsa. Uyarılar puanı etkilemez.{" "}
            <b className="text-ink-soft">Hiçbir başvuru senin sohbette verdiğin onay olmadan gönderilmez.</b>
          </>
        }
        eylem={
          <a
            href="/admin/cevaplar"
            className="whitespace-nowrap rounded-full border border-line px-4 py-1.5 text-[12.5px] font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            Cevap bankası →
          </a>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {(
          [
            ["Karar bekleyen", ozet.yeni],
            ["Güçlü aday (4,0+)", ozet.guclu],
            ["Başvuru listem", ozet.listede],
            ["Son 24 saatte", ozet.bugun],
            ["Son tarihi ≤ 7 gün", ozet.acil],
          ] as const
        ).map(([etiket, deger]) => (
          <div key={etiket} className="rounded-2xl border border-line bg-paper-2 px-3 py-2.5">
            <div className="text-[20px] font-bold leading-none text-ink">{deger}</div>
            <div className="mt-1 text-[11.5px] text-muted">{etiket}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-line bg-paper-2 p-1">
          {SEKMELER.map((s) => (
            <button
              key={s.deger}
              type="button"
              onClick={() => setSekme(s.deger)}
              className={`rounded-full px-3.5 py-1 text-[12.5px] font-semibold transition ${
                sekme === s.deger ? "bg-accent text-white" : "text-muted hover:text-ink"
              }`}
            >
              {s.etiket}
            </button>
          ))}
        </div>
        <select value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)} className={SECIM}>
          <option value="">Tüm platformlar</option>
          {Object.entries(PLATFORM).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={alan} onChange={(e) => setAlan(e.target.value)} className={SECIM}>
          <option value="">Tüm alanlar</option>
          {Object.entries(ALAN).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={tur} onChange={(e) => setTur(e.target.value as typeof tur)} className={SECIM}>
          <option value="">Tüm türler</option>
          {Object.entries(TUR).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {sekme === "listede" && liste.length > 0 && (
        <p className="mt-4 rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
          Başvurmak için sohbette <b className="text-ink">&quot;listemdeki ilanlara başvuralım&quot;</b> de. Her
          ilanda formu doldurup son adımda dururum; LinkedIn&apos;de &quot;Gönder&quot;e sen basarsın,
          diğerlerinde özeti gösterip onayını beklerim.
        </p>
      )}

      {hata && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-ink">
          {hata}
        </p>
      )}

      <p className="mt-4 text-[12.5px] text-muted">{liste.length} ilan</p>

      <div className="mt-2 space-y-2.5">
        {liste.map((i) => {
          const kalan = kalanGun(i.deadline);
          const mesgul = bekleyen === i.id;
          return (
            <article key={i.id} className={`${YUZEY_SAKIN} p-4 transition hover:border-accent/50`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <Puan ilan={i} />

                <div className="min-w-0 flex-1">
                  <h2 className="text-[15px] font-bold leading-snug text-ink">{i.position}</h2>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {i.company}
                    {i.location && ` · ${i.location}`}
                    {i.work_mode && ` · ${CALISMA[i.work_mode]}`}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Rozet>{PLATFORM[i.platform]}</Rozet>
                    <Rozet vurgu={i.kind === "belirsiz" ? undefined : "accent"}>{TUR[i.kind]}</Rozet>
                    {i.easy_apply && <Rozet vurgu="accent">Platform içi başvuru</Rozet>}
                    {i.areas.map((a) => (
                      <Rozet key={a}>{ALAN[a] ?? a}</Rozet>
                    ))}
                    {kalan !== null && kalan >= 0 && (
                      <Rozet vurgu={kalan <= 3 ? "uyari" : undefined}>
                        Son başvuru {TARIH.format(new Date(i.deadline!))}
                        {kalan <= 7 && ` · ${kalan === 0 ? "bugün" : `${kalan} gün`}`}
                      </Rozet>
                    )}
                  </div>

                  {i.warnings.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {i.warnings.map((u) => (
                        <span
                          key={u}
                          className="rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300"
                        >
                          ⚠ {u}
                        </span>
                      ))}
                    </div>
                  )}

                  {(i.fit_cv !== null || i.fit_goal !== null) && (
                    <p className="mt-2 text-[12px] text-muted">
                      {i.fit_cv !== null && (
                        <>
                          CV uyumu <b className="text-ink-soft">{i.fit_cv}/5</b>
                        </>
                      )}
                      {i.fit_cv !== null && i.fit_goal !== null && " · "}
                      {i.fit_goal !== null && (
                        <>
                          Hedef uyumu <b className="text-ink-soft">{i.fit_goal}/5</b>
                        </>
                      )}
                      {" · "}
                      {i.red_flags.length ? (
                        <span className="text-red-600 dark:text-red-400">{i.red_flags.length} kırmızı bayrak</span>
                      ) : (
                        "kırmızı bayrak yok"
                      )}
                    </p>
                  )}

                  {i.red_flags.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-[12.5px] leading-relaxed text-red-600 dark:text-red-400">
                      {i.red_flags.map((b) => (
                        <li key={b} className="flex gap-2">
                          <span aria-hidden>✗</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  {i.score_reasons.length > 0 && (
                    <ul className="mt-2.5 space-y-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                      {i.score_reasons.map((n) => (
                        <li key={n} className="flex gap-2">
                          <span aria-hidden className="text-accent">
                            •
                          </span>
                          {n}
                        </li>
                      ))}
                    </ul>
                  )}

                  {i.summary && (
                    <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-muted">{i.summary}</p>
                  )}

                  {sekme === "listede" && i.requirements && i.requirements.length > 0 && (
                    <Sartlar satirlar={i.requirements} />
                  )}

                  {sekme === "listede" && (
                    // key: kayittan sonra sunucudan gelen metin yerel taslagi sifirlasin.
                    <OnYazi key={`${i.cover_letter ?? ""}:${i.cover_letter_confirmed}`} ilan={i} />
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                  {sekme === "yeni" && (
                    <>
                      <button
                        type="button"
                        disabled={mesgul}
                        onClick={() => void karar(i.id, "listede")}
                        className="whitespace-nowrap rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                      >
                        Listeye al
                      </button>
                      <button
                        type="button"
                        disabled={mesgul}
                        onClick={() => void karar(i.id, "ilgilenmiyorum")}
                        className="whitespace-nowrap rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold text-ink transition hover:bg-paper disabled:opacity-40"
                      >
                        İlgilenmiyorum
                      </button>
                    </>
                  )}
                  {sekme === "listede" && (
                    <button
                      type="button"
                      disabled={mesgul}
                      onClick={() => void karar(i.id, "yeni")}
                      className="whitespace-nowrap rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold text-ink transition hover:bg-paper disabled:opacity-40"
                    >
                      Listeden çıkar
                    </button>
                  )}
                  {sekme === "ilgilenmiyorum" && (
                    <button
                      type="button"
                      disabled={mesgul}
                      onClick={() => void karar(i.id, "yeni")}
                      className="whitespace-nowrap rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold text-ink transition hover:bg-paper disabled:opacity-40"
                    >
                      Geri al
                    </button>
                  )}
                  <a
                    href={i.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="whitespace-nowrap rounded-full border border-line px-3.5 py-1.5 text-center text-[12px] font-semibold text-ink transition hover:border-accent hover:text-accent"
                  >
                    İlana git ↗
                  </a>
                </div>
              </div>
            </article>
          );
        })}

        {!liste.length && (
          <p className="rounded-2xl border border-line bg-paper-2 p-6 text-center text-[13.5px] text-muted">
            {sekme === "yeni"
              ? "Karar bekleyen ilan yok. Keşif görevi her sabah yeni ilanları buraya ekler."
              : sekme === "listede"
                ? "Başvuru listen boş. Karar bekleyenlerden beğendiklerini \"Listeye al\"."
                : "İlgilenmediğin ilan yok."}
          </p>
        )}
      </div>
    </>
  );
}
