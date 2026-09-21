"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { basvuruEkle, basvuruGuncelle, basvuruSil, type BasvuruGirdi } from "@/app/admin/eylemler";

export type Basvuru = {
  id: string;
  platform: BasvuruGirdi["platform"];
  company: string;
  position: string;
  location: string | null;
  work_mode: "is_yerinde" | "hibrit" | "uzaktan" | null;
  job_url: string | null;
  applied_at: string | null;
  status: NonNullable<BasvuruGirdi["status"]>;
  posting_status: NonNullable<BasvuruGirdi["posting_status"]>;
  notes: string | null;
  source: "senkron" | "elle";
  synced_at: string | null;
};

const PLATFORM: Record<Basvuru["platform"], string> = {
  linkedin: "LinkedIn",
  kariyernet: "Kariyer.net",
  youthall: "Youthall",
  diger: "Diğer",
};

/** Sira bilincli: soldan saga surecin ilerleyisi. */
const DURUM: Record<Basvuru["status"], string> = {
  devam_ediyor: "Devam ediyor",
  basvuruldu: "Başvuruldu",
  goruntulendi: "Görüntülendi",
  mulakat: "Mülakat",
  teklif: "Teklif",
  olumsuz: "Olumsuz",
  geri_cekildi: "Geri çekildi",
};

const DURUM_RENGI: Record<Basvuru["status"], string> = {
  devam_ediyor: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  basvuruldu: "border-line text-muted",
  goruntulendi: "border-accent/50 text-accent",
  mulakat: "border-violet-500/50 text-violet-600 dark:text-violet-400",
  teklif: "border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
  olumsuz: "border-red-500/40 text-red-600 dark:text-red-400",
  geri_cekildi: "border-line text-muted line-through",
};

const CALISMA: Record<NonNullable<Basvuru["work_mode"]>, string> = {
  is_yerinde: "İş yerinde",
  hibrit: "Hibrit",
  uzaktan: "Uzaktan",
};

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
const gun = (t: string | null) => (t ? TARIH.format(new Date(t)) : "—");

/** Kac gundur sessiz — yanit bekleyenleri one cikarmak icin. */
function gecenGun(t: string | null) {
  if (!t) return null;
  return Math.floor((Date.now() - new Date(t).getTime()) / 86_400_000);
}

const BOS: BasvuruGirdi = {
  platform: "diger",
  company: "",
  position: "",
  location: "",
  job_url: "",
  applied_at: new Date().toISOString().slice(0, 10),
  status: "basvuruldu",
  posting_status: "bilinmiyor",
  notes: "",
};

export default function Basvurular({ kayitlar }: { kayitlar: Basvuru[] }) {
  const router = useRouter();
  const [platform, setPlatform] = useState<"hepsi" | Basvuru["platform"]>("hepsi");
  const [durum, setDurum] = useState<"hepsi" | "acik" | Basvuru["status"]>("hepsi");
  const [ara, setAra] = useState("");
  const [ekleAcik, setEkleAcik] = useState(false);
  const [yeni, setYeni] = useState<BasvuruGirdi>(BOS);
  const [hata, setHata] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const [silinecek, setSilinecek] = useState<string | null>(null);

  const ozet = useMemo(() => {
    const aktif = kayitlar.filter((k) => !["olumsuz", "geri_cekildi"].includes(k.status));
    return {
      toplam: kayitlar.length,
      aktif: aktif.length,
      goruntulenen: kayitlar.filter((k) => k.status === "goruntulendi").length,
      mulakat: kayitlar.filter((k) => ["mulakat", "teklif"].includes(k.status)).length,
      yarim: kayitlar.filter((k) => k.status === "devam_ediyor").length,
      kapanan: kayitlar.filter((k) => k.posting_status === "kapali" && !["olumsuz", "geri_cekildi"].includes(k.status)).length,
    };
  }, [kayitlar]);

  const liste = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase("tr");
    return kayitlar.filter((k) => {
      if (platform !== "hepsi" && k.platform !== platform) return false;
      // "acik" ayri bir durum degil: sonuclanmamis her basvuru.
      if (durum === "acik" && ["olumsuz", "geri_cekildi"].includes(k.status)) return false;
      if (durum !== "hepsi" && durum !== "acik" && k.status !== durum) return false;
      if (!q) return true;
      return `${k.company} ${k.position} ${k.location ?? ""} ${k.notes ?? ""}`.toLocaleLowerCase("tr").includes(q);
    });
  }, [kayitlar, platform, durum, ara]);

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    setHata(null);
    setMesgul(true);
    const sonuc = await basvuruEkle({
      ...yeni,
      company: yeni.company.trim(),
      position: yeni.position.trim(),
      job_url: yeni.job_url?.trim() || null,
      location: yeni.location?.trim() || null,
      notes: yeni.notes?.trim() || null,
    });
    setMesgul(false);
    if (!sonuc.ok) return setHata(sonuc.hata);
    setYeni(BOS);
    setEkleAcik(false);
    router.refresh();
  }

  async function durumDegistir(id: string, yeniDurum: Basvuru["status"]) {
    const sonuc = await basvuruGuncelle(id, { status: yeniDurum });
    if (!sonuc.ok) return setHata(sonuc.hata);
    router.refresh();
  }

  async function sil(id: string) {
    setMesgul(true);
    const sonuc = await basvuruSil(id);
    setMesgul(false);
    setSilinecek(null);
    if (!sonuc.ok) return setHata(sonuc.hata);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">Başvurular</h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">
            LinkedIn, Kariyer.net ve Youthall listeleri tarayıcı üzerinden senkronlanır. Firmaların
            kendi kariyer sayfalarından yaptıkların “Diğer” olarak elle eklenir.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEkleAcik((a) => !a)}
          className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90"
        >
          {ekleAcik ? "Vazgeç" : "Başvuru ekle"}
        </button>
      </div>

      {hata && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-ink">
          {hata}
        </p>
      )}

      {/* ------------------------------------------------------------ ozet */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Toplam", ozet.toplam],
          ["Süreçte", ozet.aktif],
          ["Görüntülendi", ozet.goruntulenen],
          ["Mülakat+", ozet.mulakat],
          ["Yarım kalan", ozet.yarim],
          ["İlan kapandı", ozet.kapanan],
        ].map(([etiket, deger]) => (
          <div key={etiket as string} className="rounded-2xl border border-line bg-paper-2 px-3 py-2.5">
            <div className="text-[20px] font-bold leading-none text-ink">{deger as number}</div>
            <div className="mt-1 text-[11.5px] text-muted">{etiket as string}</div>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------------- ekleme */}
      {ekleAcik && (
        <form onSubmit={kaydet} className="mt-5 rounded-2xl border border-line bg-paper-2 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Alan etiket="Şirket" zorunlu>
              <input required value={yeni.company} onChange={(e) => setYeni({ ...yeni, company: e.target.value })} className={GIRDI} />
            </Alan>
            <Alan etiket="Pozisyon" zorunlu>
              <input required value={yeni.position} onChange={(e) => setYeni({ ...yeni, position: e.target.value })} className={GIRDI} />
            </Alan>
            <Alan etiket="Platform">
              <select value={yeni.platform} onChange={(e) => setYeni({ ...yeni, platform: e.target.value as Basvuru["platform"] })} className={GIRDI}>
                {Object.entries(PLATFORM).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Alan>
            <Alan etiket="Başvuru tarihi">
              <input type="date" value={yeni.applied_at ?? ""} onChange={(e) => setYeni({ ...yeni, applied_at: e.target.value })} className={GIRDI} />
            </Alan>
            <Alan etiket="Konum">
              <input value={yeni.location ?? ""} onChange={(e) => setYeni({ ...yeni, location: e.target.value })} className={GIRDI} />
            </Alan>
            <Alan etiket="Çalışma şekli">
              <select
                value={yeni.work_mode ?? ""}
                onChange={(e) => setYeni({ ...yeni, work_mode: (e.target.value || null) as Basvuru["work_mode"] })}
                className={GIRDI}
              >
                <option value="">—</option>
                {Object.entries(CALISMA).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Alan>
            <Alan etiket="İlan bağlantısı" genis>
              <input type="url" placeholder="https://…" value={yeni.job_url ?? ""} onChange={(e) => setYeni({ ...yeni, job_url: e.target.value })} className={GIRDI} />
            </Alan>
            <Alan etiket="Not" genis>
              <textarea rows={2} value={yeni.notes ?? ""} onChange={(e) => setYeni({ ...yeni, notes: e.target.value })} className={GIRDI} />
            </Alan>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={mesgul}
              className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {mesgul ? "Ekleniyor…" : "Ekle"}
            </button>
          </div>
        </form>
      )}

      {/* ---------------------------------------------------------- filtre */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Secim deger={platform} ayarla={setPlatform} secenekler={[["hepsi", "Tüm platformlar"], ...Object.entries(PLATFORM)]} />
        <Secim
          deger={durum}
          ayarla={setDurum}
          secenekler={[["hepsi", "Tüm durumlar"], ["acik", "Sonuçlanmamış"], ...Object.entries(DURUM)]}
        />
        <input
          value={ara}
          onChange={(e) => setAra(e.target.value)}
          placeholder="Şirket, pozisyon, not…"
          className="min-w-[12rem] flex-1 rounded-full border border-line bg-paper-2 px-3.5 py-1.5 text-[13px] text-ink outline-none transition focus:border-accent"
        />
      </div>

      {/* ---------------------------------------------------------- liste */}
      <p className="mt-3 text-[12.5px] text-muted">
        {liste.length} kayıt{liste.length !== kayitlar.length && ` (${kayitlar.length} içinden)`}
      </p>

      <div className="mt-2 space-y-2">
        {liste.map((k) => {
          const bekleme = gecenGun(k.applied_at);
          return (
            <div key={k.id} className="rounded-2xl border border-line bg-paper-2 p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14.5px] font-bold text-ink">{k.position}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${DURUM_RENGI[k.status]}`}>
                      {DURUM[k.status]}
                    </span>
                    {k.posting_status === "kapali" && (
                      <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">ilan kapandı</span>
                    )}
                  </div>
                  <div className="mt-1 text-[12.5px] text-muted">
                    {k.company}
                    {k.location && ` · ${k.location}`}
                    {k.work_mode && ` · ${CALISMA[k.work_mode]}`}
                  </div>
                  <div className="mt-1 text-[12px] text-muted">
                    {PLATFORM[k.platform]} · {gun(k.applied_at)}
                    {bekleme !== null && !["olumsuz", "geri_cekildi", "teklif"].includes(k.status) && (
                      <> · <span className={bekleme > 21 ? "text-amber-600 dark:text-amber-400" : ""}>{bekleme} gündür yanıt yok</span></>
                    )}
                    {k.source === "elle" && " · elle eklendi"}
                  </div>
                  {k.notes && <p className="mt-1.5 text-[12.5px] text-ink-soft">{k.notes}</p>}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <select
                    value={k.status}
                    onChange={(e) => void durumDegistir(k.id, e.target.value as Basvuru["status"])}
                    className="rounded-full border border-line bg-paper px-2.5 py-1 text-[12px] text-ink outline-none transition focus:border-accent"
                  >
                    {Object.entries(DURUM).map(([d, v]) => (
                      <option key={d} value={d}>{v}</option>
                    ))}
                  </select>
                  {k.job_url && (
                    <a
                      href={k.job_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-ink transition hover:bg-paper"
                    >
                      İlana git ↗
                    </a>
                  )}
                  {silinecek === k.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void sil(k.id)}
                        className="rounded-full border border-red-500/50 px-3 py-1 text-[12px] font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                      >
                        Sil
                      </button>
                      <button type="button" onClick={() => setSilinecek(null)} className="text-[12px] text-muted hover:text-ink">
                        vazgeç
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSilinecek(k.id)}
                      aria-label="Sil"
                      className="rounded-full border border-line px-2.5 py-1 text-[12px] text-muted transition hover:text-ink"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!liste.length && (
          <p className="rounded-2xl border border-line bg-paper-2 p-6 text-center text-[13.5px] text-muted">
            {kayitlar.length ? "Bu filtreye uyan kayıt yok." : "Henüz kayıt yok. Senkron çalıştır ya da elle ekle."}
          </p>
        )}
      </div>
    </>
  );
}

const GIRDI =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13.5px] text-ink outline-none transition focus:border-accent";

function Alan({ etiket, children, zorunlu, genis }: { etiket: string; children: React.ReactNode; zorunlu?: boolean; genis?: boolean }) {
  return (
    <label className={genis ? "sm:col-span-2" : undefined}>
      <span className="block text-[12px] font-semibold text-ink-soft">
        {etiket}
        {zorunlu && <span className="text-accent"> *</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Secim<T extends string>({
  deger,
  ayarla,
  secenekler,
}: {
  deger: T;
  ayarla: (v: T) => void;
  secenekler: [string, string][];
}) {
  return (
    <select
      value={deger}
      onChange={(e) => ayarla(e.target.value as T)}
      className="rounded-full border border-line bg-paper-2 px-3 py-1.5 text-[13px] text-ink outline-none transition focus:border-accent"
    >
      {secenekler.map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  );
}
