"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SayfaBasligi, YUZEY_SAKIN } from "@/components/admin/duzen";
import { ilanKarari, type IlanKarari } from "@/app/admin/eylemler";

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
  score: number | null;
  score_reasons: string[];
  areas: string[];
  decision: "yeni" | "listede" | "ilgilenmiyorum" | "basvuruldu";
  found_at: string;
};

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

/**
 * Puan rozeti. Renk bantlari bilincli olarak kaba: 70+ "guclu aday",
 * 50-69 "bakmaya deger", alti "zayif". Ince ayar puanin kendisinde.
 */
function Puan({ deger }: { deger: number | null }) {
  const renk =
    deger === null
      ? "border-line text-muted"
      : deger >= 70
        ? "border-accent bg-accent text-white"
        : deger >= 50
          ? "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : "border-line text-muted";
  return (
    <span
      title="CV'ne göre uygunluk puanı (0–100)"
      className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border text-center ${renk}`}
    >
      <span className="text-[17px] font-bold leading-none">{deger ?? "–"}</span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-80">puan</span>
    </span>
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
      guclu: ilanlar.filter((i) => i.decision === "yeni" && (i.score ?? 0) >= 70).length,
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
        .sort((a, b) => (b.score ?? -1) - (a.score ?? -1)),
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
            Günlük keşif görevinin bulduğu, henüz başvurmadığın ilanlar. Puan CV&apos;ndeki
            yetkinliklere, hedeflediğin alanlara ve pozisyon türüne göre veriliyor.{" "}
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
            ["Güçlü aday (70+)", ozet.guclu],
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
                <Puan deger={i.score} />

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
