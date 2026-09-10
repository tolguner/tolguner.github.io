import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

const TARIH = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

const ADLAR: Record<string, string> = { home: "Ana sayfa", cv: "CV" };

export default async function Panel() {
  const db = await sunucuIstemcisi();

  const [{ data: dokumanlar }, { data: taslaklar }, { count: fotoSayisi }] = await Promise.all([
    db.from("content_documents").select("slug, published_at, lock_version"),
    db.from("content_drafts").select("slug, updated_at, lock_version"),
    db.from("gallery_photos").select("id", { count: "exact", head: true }).eq("is_published", true),
  ]);

  const taslakBul = (slug: string) => taslaklar?.find((t) => t.slug === slug);

  return (
    <>
      <h1 className="font-serif text-[28px] font-bold tracking-tight text-ink">İçerik</h1>
      <p className="mt-1.5 text-[14px] text-muted">
        Taslak üzerinde çalışırsın; yayımlayana kadar site değişmez.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {(dokumanlar ?? []).map((d) => {
          const taslak = taslakBul(d.slug);
          const bekleyen = taslak ? taslak.lock_version !== d.lock_version : false;
          return (
            <div key={d.slug} className="rounded-xl border border-line bg-paper-2 p-5 transition hover:border-accent">
              <a href={`/admin/icerik/${d.slug}`} className="block">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[16px] font-bold text-ink">{ADLAR[d.slug] ?? d.slug}</span>
                {bekleyen && (
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    yayımlanmamış değişiklik
                  </span>
                )}
              </div>
              <dl className="mt-3 space-y-1 text-[12.5px] text-muted">
                <div className="flex justify-between gap-3">
                  <dt>Son yayım</dt>
                  <dd className="text-ink-soft">{TARIH.format(new Date(d.published_at))}</dd>
                </div>
                {taslak && (
                  <div className="flex justify-between gap-3">
                    <dt>Taslak</dt>
                    <dd className="text-ink-soft">{TARIH.format(new Date(taslak.updated_at))}</dd>
                  </div>
                )}
              </dl>
              </a>
              <a
                href={`/admin/revizyonlar/${d.slug}`}
                className="mt-3 inline-block text-[12.5px] text-accent hover:underline"
              >
                geçmiş ve geri alma →
              </a>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <a href="/admin/galeri" className="rounded-xl border border-line bg-paper-2 p-5 transition hover:border-accent">
          <div className="text-[16px] font-bold text-ink">Galeri</div>
          <p className="mt-1 text-[12.5px] text-muted">
            {fotoSayisi ?? 0} yayımlanan fotoğraf · yükle, sırala, alt başlık yaz
          </p>
        </a>
        <a href="/admin/dosyalar" className="rounded-xl border border-line bg-paper-2 p-5 transition hover:border-accent">
          <div className="text-[16px] font-bold text-ink">Dosyalar</div>
          <p className="mt-1 text-[12.5px] text-muted">CV PDF’lerini değiştir</p>
        </a>
      </div>
    </>
  );
}
