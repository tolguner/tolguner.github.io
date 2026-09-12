import { notFound } from "next/navigation";

import { revizyonaDon } from "../../../eylemler";
import { farkSayisi } from "@/lib/content/fark";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

const ADLAR = { home: "Ana sayfa", cv: "CV" } as const;
type Slug = keyof typeof ADLAR;

const TARIH = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

const TURLER: Record<string, string> = {
  seed: "ilk aktarım",
  publish: "yayım",
  restore: "geri alma",
};

/** Kac revizyon listelenecek. Her satir tum dokumani tasidigi icin sinirli. */
const SINIR = 25;

export default async function RevizyonSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ hata?: string }>;
}) {
  const { slug } = await params;
  const { hata } = await searchParams;
  if (slug !== "home" && slug !== "cv") notFound();

  const db = await sunucuIstemcisi();
  const [revizyonlar, dokuman] = await Promise.all([
    db
      .from("content_revisions")
      .select("id, kind, created_at, data")
      .eq("slug", slug)
      .order("created_at", { ascending: false })
      .limit(SINIR),
    db.from("content_documents").select("published, published_at").eq("slug", slug).single(),
  ]);

  if (revizyonlar.error || dokuman.error) {
    return (
      <p className="rounded-xl border border-line bg-paper-2 p-5 text-[14px] text-ink">
        Revizyonlar okunamadı: {revizyonlar.error?.message ?? dokuman.error?.message}
      </p>
    );
  }

  // Fark sunucuda hesaplaniyor: her revizyonun tam govdesini istemciye
  // gondermenin anlami yok (~23 KB × 25).
  const satirlar = revizyonlar.data.map((r) => ({
    id: r.id as string,
    kind: r.kind as string,
    createdAt: r.created_at as string,
    farkli: farkSayisi(r.data, dokuman.data.published),
  }));

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">
          {ADLAR[slug as Slug]} — geçmiş
        </h1>
        <a href={`/admin/icerik/${slug}`} className="text-[13px] text-accent hover:underline">
          düzenleyiciye dön
        </a>
      </div>
      <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">
        Her yayımda o anın tam kopyası saklanır. Bir sürüme dönmek onu <b>taslağa</b> yükler; site
        değişmeden önce düzenleyicide görüp yayımlarsın.
      </p>

      {hata && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-ink">
          Geri alınamadı: {hata}
        </p>
      )}

      <div className="mt-6 space-y-2">
        {satirlar.map((r, i) => {
          const guncel = r.farkli === 0;
          return (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper-2 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[14px] font-semibold text-ink">{TARIH.format(new Date(r.createdAt))}</span>
                  <span className="rounded-full border border-line px-2 py-px text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                    {TURLER[r.kind] ?? r.kind}
                  </span>
                  {i === 0 && (
                    <span className="rounded-full bg-accent/10 px-2 py-px text-[10.5px] font-semibold text-accent">
                      en yeni
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[12.5px] text-muted">
                  {guncel ? "yayımdaki içerikle aynı" : `yayımdakinden ${r.farkli} alan farklı`}
                </p>
              </div>

              <form action={revizyonaDon.bind(null, slug, r.id)}>
                <button
                  type="submit"
                  disabled={guncel}
                  className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-paper disabled:opacity-35"
                >
                  Bu sürüme dön
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {satirlar.length === SINIR && (
        <p className="mt-4 text-[12px] text-muted">Yalnızca son {SINIR} sürüm gösteriliyor.</p>
      )}
    </>
  );
}
