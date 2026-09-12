import type { Metadata } from "next";
import { redirect } from "next/navigation";

import TemaDugmesi from "@/components/TemaDugmesi";
import { cikisYap } from "../eylemler";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

export const metadata: Metadata = {
  title: "Yönetim — tolguner.me",
  robots: { index: false, follow: false },
};

// Oturum her istekte dogrulanmali; onbellege alinmis bir admin sayfasi olmaz.
export const dynamic = "force-dynamic";

const BAGLANTILAR = [
  { href: "/admin", etiket: "Genel" },
  { href: "/admin/icerik/home", etiket: "Ana sayfa" },
  { href: "/admin/icerik/cv", etiket: "CV" },
  { href: "/admin/galeri", etiket: "Galeri" },
  { href: "/admin/dosyalar", etiket: "Dosyalar" },
  { href: "/admin/guvenlik", etiket: "Güvenlik" },
];

/**
 * GERCEK kapi burasi. Middleware yalnizca UX icin yonlendirme yapiyor;
 * yetki iki yerde dogrulaniyor: burada uyelik + ikinci adim, veritabaninda RLS.
 */
export default async function KorumaliDuzen({ children }: { children: React.ReactNode }) {
  const db = await sunucuIstemcisi();

  // getSession() sunucuda ASLA guvenilmez (cerezden okur, dogrulamaz).
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/admin/login");

  /**
   * Ikinci adim zorunlu: hesabin dogrulanmis bir kimlik dogrulayicisi varsa
   * oturum aal2 olana kadar panel acilmaz. `aal` iddiasi `getClaims()` ile
   * geliyor — imzasi dogrulanmis JWT'den, cerezden okunan ham degerden degil.
   */
  const [{ data: iddialar }, { data: etkenler }] = await Promise.all([
    db.auth.getClaims(),
    db.auth.mfa.listFactors(),
  ]);
  const aal = (iddialar?.claims as { aal?: string } | undefined)?.aal ?? "aal1";
  const mfaKurulu = (etkenler?.totp?.length ?? 0) > 0;
  if (mfaKurulu && aal !== "aal2") redirect("/admin/dogrula");

  // Giris yapmis olmak yetmez: yetki `admin_users` uyeligine bagli.
  const { data: adminMi } = await db.rpc("admin_uyesi");
  if (!adminMi) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="font-display text-[26px] font-bold text-ink">Yetkiniz yok</h1>
        <p className="max-w-md text-[14.5px] text-muted">
          <span className="text-ink">{user.email}</span> hesabı bu panele erişim listesinde değil.
        </p>
        <form action={cikisYap}>
          <button className="rounded-full border border-line px-4 py-2 text-[13.5px] font-semibold text-ink transition hover:bg-paper-2">
            Çıkış yap
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      {/*
        Baslik cubugu SITEDEKININ AYNISI: ayni yukseklik, ayni kenarlik ve
        bulanik zemin, ayni kap genisligi, ayni hap olculeri. Panelden siteye
        gecerken cubuk yerinden oynamasin diye olculer birebir kopyalandi
        (bkz. Site.tsx). Tek fark solda "Yonetim" rozeti ve sagdaki hapin
        cikisa baglanmasi.
      */}
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-paper/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-4">
            <a href="/" className="font-display shrink-0 whitespace-nowrap text-lg font-semibold text-ink">
              Tolga Olguner
            </a>
            <span className="hidden rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted sm:inline">
              Yönetim
            </span>
          </div>

          <nav className="nav-display order-3 flex w-full gap-3.5 overflow-x-auto text-[12px] text-ink-soft lg:order-none lg:w-auto lg:gap-7 lg:overflow-visible lg:text-[13px]">
            {BAGLANTILAR.map((b) => (
              <a key={b.href} href={b.href} className="whitespace-nowrap transition hover:text-ink">
                {b.etiket}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-[12.5px] text-muted xl:inline">{user.email}</span>
            <TemaDugmesi
              etiket={{ light: "Açık temaya geç", dark: "Koyu temaya geç" }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition hover:text-ink"
            />
            <a
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition hover:text-ink lg:hidden"
              aria-label="Siteyi aç"
            >
              ↗
            </a>
            <form action={cikisYap}>
              {/* Sitedeki birincil hapla ayni olcu: min-w-[92px], px-4 py-1.5, 12.5px */}
              <button className="min-w-[92px] whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-white transition hover:opacity-90">
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>
      {!mfaKurulu && (
        <div className="border-b border-amber-500/40 bg-amber-500/10">
          <p className="mx-auto max-w-6xl px-5 py-2 text-[13px] text-ink sm:px-8">
            İki adımlı doğrulama kapalı — parolan sızarsa panelin tamamı ele geçer.{" "}
            <a href="/admin/guvenlik" className="font-semibold text-accent hover:underline">
              Şimdi kur
            </a>
          </p>
        </div>
      )}
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
