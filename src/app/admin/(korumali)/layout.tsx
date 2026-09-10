import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
];

/**
 * GERCEK kapi burasi. Middleware yalnizca UX icin yonlendirme yapiyor;
 * yetki iki yerde dogrulaniyor: burada `is_admin()` ve veritabaninda RLS.
 */
export default async function KorumaliDuzen({ children }: { children: React.ReactNode }) {
  const db = await sunucuIstemcisi();

  // getSession() sunucuda ASLA guvenilmez (cerezden okur, dogrulamaz).
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/admin/login");

  // Giris yapmis olmak yetmez: yetki `admin_users` uyeligine bagli.
  const { data: adminMi } = await db.rpc("is_admin");
  if (!adminMi) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="font-serif text-[26px] font-bold text-ink">Yetkiniz yok</h1>
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
      <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-5">
            <span className="font-display text-[15px] font-semibold text-ink">Yönetim</span>
            <nav className="flex gap-4 text-[13px] text-ink-soft">
              {BAGLANTILAR.map((b) => (
                <a key={b.href} href={b.href} className="transition hover:text-ink">
                  {b.etiket}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-[12.5px] text-muted">
            <span className="hidden sm:inline">{user.email}</span>
            <a href="/" className="transition hover:text-ink">
              Site
            </a>
            <form action={cikisYap}>
              <button className="rounded-full border border-line px-3 py-1 font-semibold text-ink transition hover:bg-paper-2">
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
