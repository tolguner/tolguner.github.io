/**
 * Panelin ortak tasarim parcalari.
 *
 * Her sayfa kendi basligini ve kart kenarligini ayri ayri yazdiginda olculer
 * kayiyordu (24px / 22px basliklar, farkli hover davranislari). Burasi tek
 * kaynak: sayfa basligi, bolum basligi ve kart yuzeyi.
 *
 * Istemci bileseni degil ama "use client" dosyalarindan da import edilebilir;
 * icinde sunucuya ozgu bir sey yok.
 */

/** Kart yuzeyi: kenarlik, zemin ve hover yukselisi her yerde ayni. */
export const YUZEY =
  "group relative overflow-hidden rounded-2xl border border-line bg-paper-2 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/10";

/** Hover tepkisi istemeyen yerler (form kutulari, liste satirlari) icin sade yuzey. */
export const YUZEY_SAKIN = "rounded-2xl border border-line bg-paper-2";

export function SayfaBasligi({
  etiket,
  baslik,
  aciklama,
  eylem,
}: {
  etiket: string;
  baslik: string;
  aciklama?: React.ReactNode;
  eylem?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-accent/12 via-paper-2 to-paper-2 p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">{etiket}</p>
          <h1 className="font-display mt-1.5 text-[30px] font-bold leading-tight tracking-tight text-ink">
            {baslik}
          </h1>
          {aciklama && (
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted">{aciklama}</p>
          )}
        </div>
        {eylem && <div className="flex shrink-0 items-center gap-3">{eylem}</div>}
      </div>
    </section>
  );
}

export function BolumBasligi({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-9 flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted">
      {children}
      <span className="h-px flex-1 bg-line" />
    </h2>
  );
}
