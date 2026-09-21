import { BolumBasligi, SayfaBasligi, YUZEY } from "@/components/admin/duzen";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

const TARIH = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

const ADLAR: Record<string, string> = { home: "Ana sayfa", cv: "CV" };

/** 24x24 cizgi ikonlar; kutuphane yerine birkac satir yol. */
const IKON = {
  galeri: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M3.5 17.5 9 12l4 4 2.5-2.5 5 5" />
    </>
  ),
  dosya: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  basvuru: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18" />
    </>
  ),
} as const;

function Ikon({ ad }: { ad: keyof typeof IKON }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-white">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[18px] w-[18px]"
        aria-hidden
      >
        {IKON[ad]}
      </svg>
    </span>
  );
}

function AracKarti({
  href,
  ikon,
  baslik,
  deger,
  aciklama,
}: {
  href: string;
  ikon: keyof typeof IKON;
  baslik: string;
  deger: string;
  aciklama: string;
}) {
  return (
    <a href={href} className={`${YUZEY} flex items-start gap-3.5 p-5`}>
      <Ikon ad={ikon} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-[15.5px] font-bold text-ink">{baslik}</span>
          <span className="text-[12px] font-semibold text-accent">{deger}</span>
        </span>
        <span className="mt-1 block text-[12.5px] leading-relaxed text-muted">{aciklama}</span>
      </span>
      <span
        aria-hidden
        className="mt-0.5 text-[13px] text-muted transition group-hover:translate-x-0.5 group-hover:text-accent"
      >
        &rarr;
      </span>
    </a>
  );
}

export default async function Panel() {
  const db = await sunucuIstemcisi();

  /**
   * `content_status` gorunumu bekleyen degisikligi ICERIK karsilastirarak
   * soyluyor. Once iki tablonun `lock_version` alanlari karsilastiriliyordu;
   * o sayaclar farkli seyleri saydigi icin (taslak kayitlari / yayimlar)
   * rozet kalici olarak yaniyordu.
   */
  const [{ data: dokumanlar }, { count: fotoSayisi }, { count: basvuruSayisi }] = await Promise.all([
    db.from("content_status").select("slug, published_at, draft_updated_at, bekleyen_var"),
    db.from("gallery_photos").select("id", { count: "exact", head: true }).eq("is_published", true),
    db.from("job_applications").select("id", { count: "exact", head: true }),
  ]);

  const bekleyenler = (dokumanlar ?? []).filter((d) => d.bekleyen_var);

  // "Site en son ne zaman degisti" panelin en sik sorulan sorusu; tepede dursun.
  const sonYayim = (dokumanlar ?? [])
    .map((d) => new Date(d.published_at).getTime())
    .sort((a, b) => b - a)[0];

  return (
    <>
      <SayfaBasligi
        etiket="Yönetim"
        baslik="Genel"
        aciklama={
          bekleyenler.length ? (
            <>
              <span className="font-semibold text-ink">
                {bekleyenler.map((d) => ADLAR[d.slug] ?? d.slug).join(" ve ")}
              </span>{" "}
              belgesinde yayımlanmamış değişiklik var. Taslak üzerinde çalışırsın; yayımlayana
              kadar site değişmez.
            </>
          ) : (
            <>
              Taslak üzerinde çalışırsın; yayımlayana kadar site değişmez. Şu an bekleyen
              değişiklik yok.
            </>
          )
        }
        eylem={
          sonYayim ? (
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wide text-muted">Son yayım</div>
              <div className="text-[12.5px] font-semibold text-ink-soft">
                {TARIH.format(new Date(sonYayim))}
              </div>
            </div>
          ) : null
        }
      />

      <BolumBasligi>İçerik</BolumBasligi>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {(dokumanlar ?? []).map((d) => {
          const bekleyen = d.bekleyen_var;
          return (
            <div key={d.slug} className={`${YUZEY} p-5`}>
              {/* Bekleyen degisikligi once bu serit anlatiyor: kartin tamamini
                  boyamadan izgara gozle taranabilir oluyor. */}
              <span
                aria-hidden
                className={`absolute inset-y-0 left-0 w-1 ${bekleyen ? "bg-accent" : "bg-transparent"}`}
              />
              <a href={`/admin/icerik/${d.slug}`} className="block">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-[19px] font-bold tracking-tight text-ink">
                    {ADLAR[d.slug] ?? d.slug}
                  </span>
                  {bekleyen ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      taslak bekliyor
                    </span>
                  ) : (
                    <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted">
                      yayında
                    </span>
                  )}
                </div>

                <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-[12.5px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Son yayım</dt>
                    <dd className="text-ink-soft">{TARIH.format(new Date(d.published_at))}</dd>
                  </div>
                  {/* Taslak satiri yalnizca yayimdan farkli oldugunda
                      anlamli; ayni oldugunda "yayinda" rozetiyle celisiyordu. */}
                  {bekleyen && d.draft_updated_at && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Taslak</dt>
                      <dd className="text-ink-soft">{TARIH.format(new Date(d.draft_updated_at))}</dd>
                    </div>
                  )}
                </dl>
              </a>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={`/admin/icerik/${d.slug}`}
                  className="rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-semibold text-white transition hover:opacity-90"
                >
                  Düzenle
                </a>
                <a
                  href={`/admin/revizyonlar/${d.slug}`}
                  className="rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold text-ink transition hover:bg-paper"
                >
                  Geçmiş
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <BolumBasligi>Araçlar</BolumBasligi>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AracKarti
          href="/admin/galeri"
          ikon="galeri"
          baslik="Galeri"
          deger={`${fotoSayisi ?? 0} fotoğraf`}
          aciklama="Yükle, sırala, alt başlık yaz"
        />
        <AracKarti
          href="/admin/dosyalar"
          ikon="dosya"
          baslik="Dosyalar"
          deger="CV"
          aciklama="PDF sürümlerini değiştir, eski sürüme dön"
        />
        <AracKarti
          href="/admin/basvurular"
          ikon="basvuru"
          baslik="Başvurular"
          deger={`${basvuruSayisi ?? 0} kayıt`}
          aciklama="LinkedIn, Kariyer.net, Youthall ve elle eklenenler"
        />
      </div>
    </>
  );
}
