"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tarayiciIstemcisi } from "@/lib/supabase/tarayici";

/**
 * Giris sayfasi. Korumali route group'un DISINDA duruyor; icinde olsaydi
 * layout -> login -> layout dongusu olusurdu.
 */
function GirisFormu() {
  const router = useRouter();
  const nereden = useSearchParams().get("nereden") ?? "/admin";

  const [eposta, setEposta] = useState("");
  const [parola, setParola] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata(null);
    setBekliyor(true);

    const db = tarayiciIstemcisi();
    const { error } = await db.auth.signInWithPassword({ email: eposta, password: parola });

    if (error) {
      // Supabase yanlis parola ile olmayan hesabi ayni mesajla dondurur;
      // hesap sayimini zorlastirdigi icin bu davranisi koruyoruz.
      setHata("E-posta veya parola hatalı.");
      setBekliyor(false);
      return;
    }

    const hedef = nereden.startsWith("/admin") ? nereden : "/admin";

    // Parola yalnizca ilk adim. Hesapta dogrulanmis bir kimlik dogrulayici
    // varsa `nextLevel` aal2 doner; korumali duzen de zaten oraya yonlendirirdi
    // ama once panel iskeletini cizip geri atmasi goze carpiyor.
    const { data: seviye } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
    if (seviye?.nextLevel === "aal2" && seviye.currentLevel !== "aal2") {
      router.replace(`/admin/dogrula?nereden=${encodeURIComponent(hedef)}`);
      return;
    }

    // Sunucu bileseni yeniden calissin: oturum cerezi artik yazili.
    router.replace(hedef);
    router.refresh();
  }

  return (
    <form onSubmit={gonder} className="w-full max-w-sm">
      <h1 className="font-serif text-[30px] font-bold tracking-tight text-ink">Yönetim</h1>
      <p className="mt-1.5 text-[14px] text-muted">tolguner.me içerik paneli</p>

      <label className="mt-8 block text-[13px] font-semibold text-ink-soft" htmlFor="eposta">
        E-posta
      </label>
      <input
        id="eposta"
        type="email"
        required
        autoComplete="username"
        value={eposta}
        onChange={(e) => setEposta(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-line bg-paper-2 px-3 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-accent"
      />

      <label className="mt-4 block text-[13px] font-semibold text-ink-soft" htmlFor="parola">
        Parola
      </label>
      <input
        id="parola"
        type="password"
        required
        autoComplete="current-password"
        value={parola}
        onChange={(e) => setParola(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-line bg-paper-2 px-3 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-accent"
      />

      {hata && (
        <p role="alert" className="mt-4 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13.5px] text-ink">
          {hata}
        </p>
      )}

      <button
        type="submit"
        disabled={bekliyor}
        className="mt-6 w-full rounded-full bg-accent py-2.5 text-[14.5px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {bekliyor ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>

      <a href="/" className="mt-6 block text-center text-[13px] text-muted transition hover:text-ink">
        ← Siteye dön
      </a>
    </form>
  );
}

export default function GirisSayfasi() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <Suspense fallback={null}>
        <GirisFormu />
      </Suspense>
    </main>
  );
}
