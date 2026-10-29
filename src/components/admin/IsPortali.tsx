"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { SayfaBasligi } from "@/components/admin/duzen";
import {
  portalSayfaEkle,
  portalSayfaGuncelle,
  portalSayfaSil,
  type PortalKategori,
  type PortalSayfaGirdi,
} from "@/app/admin/eylemler";

export type PortalSayfa = {
  slug: string;
  category: PortalKategori;
  title: string;
  summary: string | null;
  body_md: string;
  sort: number;
  verified: boolean;
  updated_at: string;
};

const KATEGORI: { deger: PortalKategori; ad: string }[] = [
  { deger: "genel", ad: "Genel" },
  { deger: "sistem", ad: "Sistemler" },
  { deger: "surec", ad: "Süreçler" },
  { deger: "ag", ad: "Ağ" },
  { deger: "sozluk", ad: "Sözlük" },
  { deger: "soru", ad: "Açık sorular" },
];
const KATEGORI_ADI = Object.fromEntries(KATEGORI.map((k) => [k.deger, k.ad])) as Record<PortalKategori, string>;

const TARIH = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" });

const GIRDI =
  "w-full rounded-xl border border-line bg-paper px-3 py-2 text-[13.5px] text-ink outline-none transition placeholder:text-muted/60 focus:border-accent";

/**
 * Markdown ogeleri panelin tipografisine baglaniyor. Ham HTML `skipHtml` ile
 * atlaniyor: icerik veritabanindan geliyor ve sayfa yonetim oturumunda calisiyor.
 */
const MD: Components = {
  h1: ({ node: _n, ...p }) => <h2 className="mt-6 text-[20px] font-bold text-ink first:mt-0" {...p} />,
  h2: ({ node: _n, ...p }) => <h3 className="mt-6 text-[17px] font-bold text-ink first:mt-0" {...p} />,
  h3: ({ node: _n, ...p }) => <h4 className="mt-5 text-[15px] font-semibold text-ink first:mt-0" {...p} />,
  p: ({ node: _n, ...p }) => <p className="mt-3 leading-relaxed first:mt-0" {...p} />,
  ul: ({ node: _n, ...p }) => <ul className="mt-3 list-disc space-y-1 pl-5" {...p} />,
  ol: ({ node: _n, ...p }) => <ol className="mt-3 list-decimal space-y-1 pl-5" {...p} />,
  a: ({ node: _n, ...p }) => <a className="text-accent underline-offset-2 hover:underline" target="_blank" rel="noreferrer" {...p} />,
  blockquote: ({ node: _n, ...p }) => <blockquote className="mt-3 border-l-2 border-accent/50 pl-3 text-muted" {...p} />,
  code: ({ node: _n, className, ...p }) => (
    <code className={`rounded bg-paper px-1 py-0.5 font-mono text-[12.5px] text-ink ${className ?? ""}`} {...p} />
  ),
  pre: ({ node: _n, ...p }) => (
    <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-paper p-3 font-mono text-[12.5px] [&_code]:bg-transparent [&_code]:p-0" {...p} />
  ),
  table: ({ node: _n, ...p }) => (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-left text-[12.5px]" {...p} />
    </div>
  ),
  th: ({ node: _n, ...p }) => <th className="border-b border-line px-2 py-1.5 font-semibold text-ink" {...p} />,
  td: ({ node: _n, ...p }) => <td className="border-b border-line px-2 py-1.5 align-top" {...p} />,
  hr: () => <hr className="my-5 border-line" />,
};

function Rozet() {
  return (
    <span
      title="Bu sayfadaki bilgiler doğrulanmadı"
      className="rounded-full border border-amber-500/50 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300"
    >
      doğrulanmadı
    </span>
  );
}

type Taslak = PortalSayfaGirdi & { slug: string };

function bosTaslak(): Taslak {
  return { slug: "", category: "genel", title: "", summary: null, body_md: "", sort: 0, verified: false };
}

/** Duzenleme ve yeni sayfa formu. `yeni` ise slug da soruluyor. */
function Form({
  ilk,
  yeni,
  onIptal,
  onKaydet,
}: {
  ilk: Taslak;
  yeni: boolean;
  onIptal: () => void;
  onKaydet: (t: Taslak) => Promise<string | null>;
}) {
  const [t, setT] = useState<Taslak>(ilk);
  const [onizleme, setOnizleme] = useState(false);
  const [mesgul, setMesgul] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    setHata(null);
    setMesgul(true);
    const h = await onKaydet(t);
    setMesgul(false);
    if (h) setHata(h);
  }

  return (
    <form onSubmit={kaydet} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_6rem]">
        <label className="block text-[12px] text-muted">
          Başlık
          <input required value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} className={`${GIRDI} mt-1`} />
        </label>
        <label className="block text-[12px] text-muted">
          Kategori
          <select
            value={t.category}
            onChange={(e) => setT({ ...t, category: e.target.value as PortalKategori })}
            className={`${GIRDI} mt-1`}
          >
            {KATEGORI.map((k) => (
              <option key={k.deger} value={k.deger}>
                {k.ad}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[12px] text-muted">
          Sıra
          <input
            type="number"
            value={t.sort}
            onChange={(e) => setT({ ...t, sort: Number(e.target.value) || 0 })}
            className={`${GIRDI} mt-1`}
          />
        </label>
      </div>

      {yeni && (
        <label className="block text-[12px] text-muted">
          Slug (kalıcı adres; küçük harf, rakam, tire)
          <input
            required
            pattern="[a-z0-9-]+"
            value={t.slug}
            onChange={(e) => setT({ ...t, slug: e.target.value.toLowerCase() })}
            className={`${GIRDI} mt-1 font-mono`}
          />
        </label>
      )}

      <label className="block text-[12px] text-muted">
        Özet (isteğe bağlı, listede görünür)
        <input
          value={t.summary ?? ""}
          onChange={(e) => setT({ ...t, summary: e.target.value || null })}
          className={`${GIRDI} mt-1`}
        />
      </label>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-muted">İçerik (Markdown, tablolar dahil)</span>
          <button type="button" onClick={() => setOnizleme((o) => !o)} className="text-[12px] font-semibold text-accent">
            {onizleme ? "Düzenle" : "Önizle"}
          </button>
        </div>
        {onizleme ? (
          <div className="mt-1 min-h-[16rem] rounded-xl border border-line bg-paper p-4 text-[13.5px] text-ink-soft">
            <Markdown remarkPlugins={[remarkGfm]} components={MD} skipHtml>
              {t.body_md || "_Boş_"}
            </Markdown>
          </div>
        ) : (
          <textarea
            value={t.body_md}
            onChange={(e) => setT({ ...t, body_md: e.target.value })}
            rows={18}
            spellCheck={false}
            className={`${GIRDI} mt-1 resize-y font-mono text-[12.5px] leading-relaxed`}
          />
        )}
      </div>

      <label className="flex items-center gap-2 text-[13px] text-ink">
        <input type="checkbox" checked={t.verified} onChange={(e) => setT({ ...t, verified: e.target.checked })} />
        Bilgiler doğrulandı
      </label>

      {hata && <p className="text-[12.5px] text-red-600 dark:text-red-400">{hata}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={mesgul}
          className="rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {mesgul ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={onIptal}
          className="rounded-full border border-line px-4 py-1.5 text-[12.5px] font-semibold text-ink transition hover:bg-paper"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}

export default function IsPortali({ sayfalar }: { sayfalar: PortalSayfa[] }) {
  const router = useRouter();
  const [arama, setArama] = useState("");
  const [secili, setSecili] = useState<string | null>(sayfalar[0]?.slug ?? null);
  const [mod, setMod] = useState<"gor" | "duzenle" | "yeni">("gor");
  const [silOnay, setSilOnay] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const gruplar = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr");
    const eslesen = q
      ? sayfalar.filter((s) =>
          [s.title, s.summary ?? "", s.body_md, s.slug].some((v) => v.toLocaleLowerCase("tr").includes(q)),
        )
      : sayfalar;
    return KATEGORI.map((k) => ({ ...k, sayfalar: eslesen.filter((s) => s.category === k.deger) })).filter(
      (g) => g.sayfalar.length,
    );
  }, [sayfalar, arama]);

  const sayfa = sayfalar.find((s) => s.slug === secili) ?? null;
  const dogrulanmamis = sayfalar.filter((s) => !s.verified).length;

  function sec(slug: string) {
    setSecili(slug);
    setMod("gor");
    setSilOnay(false);
    setHata(null);
  }

  async function sil() {
    if (!sayfa) return;
    const s = await portalSayfaSil(sayfa.slug);
    if (!s.ok) return setHata(s.hata);
    setSilOnay(false);
    setSecili(sayfalar.find((x) => x.slug !== sayfa.slug)?.slug ?? null);
    router.refresh();
  }

  return (
    <>
      <SayfaBasligi
        etiket="Staj"
        baslik="İş Portalı"
        aciklama={
          <>
            Staj sırasında tuttuğun bilgi bankası. İçerik yalnızca veritabanında durur, hiçbir depoya
            yazılmaz. {sayfalar.length} sayfa
            {dogrulanmamis > 0 && <> · {dogrulanmamis} doğrulanmamış</>}.
          </>
        }
        eylem={
          <button
            type="button"
            onClick={() => {
              setMod("yeni");
              setHata(null);
            }}
            className="whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-white transition hover:opacity-90"
          >
            Yeni sayfa
          </button>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* -------------------------------------------------------- liste */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <input
            type="search"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Sayfalarda ara…"
            className={GIRDI}
          />
          <nav className="mt-3 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            {gruplar.map((g) => (
              <div key={g.deger}>
                <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{g.ad}</div>
                <ul className="mt-1 space-y-0.5">
                  {g.sayfalar.map((s) => (
                    <li key={s.slug}>
                      <button
                        type="button"
                        onClick={() => sec(s.slug)}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] transition ${
                          s.slug === secili && mod !== "yeni"
                            ? "bg-accent/10 font-semibold text-accent"
                            : "text-ink-soft hover:bg-paper-2 hover:text-ink"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="truncate">{s.title}</span>
                          {!s.verified && <span aria-label="doğrulanmadı" className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {!gruplar.length && (
              <p className="px-1 text-[12.5px] text-muted">
                {sayfalar.length ? "Aramaya uyan sayfa yok." : "Henüz sayfa yok."}
              </p>
            )}
          </nav>
        </aside>

        {/* ------------------------------------------------------- icerik */}
        <section className="min-w-0 rounded-2xl border border-line bg-paper-2 p-5">
          {mod === "yeni" ? (
            <>
              <h2 className="mb-4 text-[17px] font-bold text-ink">Yeni sayfa</h2>
              <Form
                ilk={bosTaslak()}
                yeni
                onIptal={() => setMod("gor")}
                onKaydet={async (t) => {
                  const { slug, ...g } = t;
                  const s = await portalSayfaEkle(slug, g);
                  if (!s.ok) return s.hata;
                  setSecili(slug);
                  setMod("gor");
                  router.refresh();
                  return null;
                }}
              />
            </>
          ) : !sayfa ? (
            <p className="py-16 text-center text-[13.5px] text-muted">
              {sayfalar.length ? "Soldan bir sayfa seç." : "Henüz sayfa yok. \"Yeni sayfa\" ile başla."}
            </p>
          ) : mod === "duzenle" ? (
            <Form
              key={sayfa.slug + sayfa.updated_at}
              ilk={{ ...sayfa }}
              yeni={false}
              onIptal={() => setMod("gor")}
              onKaydet={async (t) => {
                const { slug: _s, ...g } = t;
                const s = await portalSayfaGuncelle(sayfa.slug, g);
                if (!s.ok) return s.hata;
                setMod("gor");
                router.refresh();
                return null;
              }}
            />
          ) : (
            <article>
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {KATEGORI_ADI[sayfa.category]}
                    </span>
                    {!sayfa.verified && <Rozet />}
                  </div>
                  <h2 className="mt-1 text-[22px] font-bold leading-tight text-ink">{sayfa.title}</h2>
                  {sayfa.summary && <p className="mt-1 text-[13px] text-muted">{sayfa.summary}</p>}
                  <p className="mt-1 text-[11.5px] text-muted">Güncellendi: {TARIH.format(new Date(sayfa.updated_at))}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMod("duzenle")}
                    className="rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold text-ink transition hover:border-accent hover:text-accent"
                  >
                    Düzenle
                  </button>
                  {silOnay ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void sil()}
                        className="rounded-full border border-red-500/50 px-3.5 py-1.5 text-[12px] font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                      >
                        Kalıcı olarak sil
                      </button>
                      <button type="button" onClick={() => setSilOnay(false)} className="text-[12px] text-muted hover:text-ink">
                        vazgeç
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSilOnay(true)}
                      aria-label="Sayfayı sil"
                      className="rounded-full border border-line px-2.5 py-1.5 text-[12px] text-muted transition hover:text-ink"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </header>
              {hata && <p className="mt-3 text-[12.5px] text-red-600 dark:text-red-400">{hata}</p>}
              <div className="mt-4 text-[13.5px] text-ink-soft">
                {sayfa.body_md.trim() ? (
                  <Markdown remarkPlugins={[remarkGfm]} components={MD} skipHtml>
                    {sayfa.body_md}
                  </Markdown>
                ) : (
                  <p className="text-muted">Bu sayfa boş.</p>
                )}
              </div>
            </article>
          )}
        </section>
      </div>
    </>
  );
}
