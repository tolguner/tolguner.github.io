import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

const TARIH = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

const ADLAR: Record<string, string> = { home: "Ana sayfa", cv: "CV" };

/** Baslik + kart izgarasi her bolumde ayni; tekrarlamamak icin tek yerde. */
function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted">{baslik}</h2>
      <div className="mt-2.5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Kart({ href, baslik, aciklama }: { href: string; baslik: string; aciklama: string }) {
  return (
    <a href={href} className="rounded-2xl border border-line bg-paper-2 p-5 transition hover:border-accent">
      <div className="text-[16px] font-bold text-ink">{baslik}</div>
      <p className="mt-1 text-[12.5px] text-muted">{aciklama}</p>
    </a>
  );
}

export default async function Panel() {
  const db = await sunucuIstemcisi();

  const [{ data: dokumanlar }, { data: taslaklar }, { count: fotoSayisi }, { count: basvuruSayisi }, { data: etkenler }] =
    await Promise.all([
      db.from("content_documents").select("slug, published_at, lock_version"),
      db.from("content_drafts").select("slug, updated_at, lock_version"),
      db.from("gallery_photos").select("id", { count: "exact", head: true }).eq("is_published", true),
      db.from("job_applications").select("id", { count: "exact", head: true }),
      db.auth.mfa.listFactors(),
    ]);

  const taslakBul = (slug: string) => taslaklar?.find((t) => t.slug === slug);
  const mfaAcik = (etkenler?.totp?.length ?? 0) > 0;

  return (
    <>
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">Genel</h1>
      <p className="mt-1.5 text-[14px] text-muted">
        İçerikte taslak üzerinde çalışırsın; yayımlayana kadar site değişmez.
      </p>

      <Bolum baslik="İçerik">
        {(dokumanlar ?? []).map((d) => {
          const taslak = taslakBul(d.slug);
          const bekleyen = taslak ? taslak.lock_version !== d.lock_version : false;
          return (
            <div key={d.slug} className="rounded-2xl border border-line bg-paper-2 p-5 transition hover:border-accent">
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
      </Bolum>

      <Bolum baslik="Medya">
        <Kart
          href="/admin/galeri"
          baslik="Galeri"
          aciklama={`${fotoSayisi ?? 0} yayımlanan fotoğraf · yükle, sırala, alt başlık yaz`}
        />
        <Kart href="/admin/dosyalar" baslik="Dosyalar" aciklama="CV PDF’lerini değiştir" />
      </Bolum>

      {/* Guvenlik ust cubuktaki hesap menusune tasindi; kaybolmasin diye
          kisayolu burada da duruyor. */}
      <Bolum baslik="Takip ve hesap">
        <Kart
          href="/admin/basvurular"
          baslik="Başvurular"
          aciklama={`${basvuruSayisi ?? 0} kayıt · LinkedIn, Kariyer.net, Youthall ve elle eklenenler`}
        />
        <Kart
          href="/admin/guvenlik"
          baslik="Güvenlik"
          aciklama={`İki adımlı doğrulama ${mfaAcik ? "açık" : "kapalı"} · kimlik doğrulayıcıları yönet`}
        />
        <Kart href="/admin/profil" baslik="Profil" aciklama="Hesap bilgileri ve parola değiştirme" />
      </Bolum>
    </>
  );
}
