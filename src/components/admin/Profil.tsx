"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { tarayiciIstemcisi } from "@/lib/supabase/tarayici";

const TARIH = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

/** Panelin kendi alt siniri; Supabase varsayilani 6 ve bu hesap icin fazla dusuk. */
const ASGARI = 10;

export default function Profil({
  eposta,
  olusturma,
  sonGiris,
  mfaAcik,
}: {
  eposta: string | undefined;
  olusturma: string | undefined;
  sonGiris: string | undefined;
  mfaAcik: boolean;
}) {
  const [mevcut, setMevcut] = useState("");
  const [yeni, setYeni] = useState("");
  const [tekrar, setTekrar] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [not, setNot] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);

  async function parolaDegistir(e: React.FormEvent) {
    e.preventDefault();
    setHata(null);
    setNot(null);

    if (yeni !== tekrar) {
      setHata("Yeni parolanın iki kopyası aynı değil.");
      return;
    }
    if (yeni.length < ASGARI) {
      setHata(`Yeni parola en az ${ASGARI} karakter olmalı.`);
      return;
    }
    if (yeni === mevcut) {
      setHata("Yeni parola eskisiyle aynı.");
      return;
    }

    setMesgul(true);

    /**
     * Mevcut parola AYRI bir istemciyle dogrulaniyor: `persistSession: false`
     * oldugu icin bu giris cerezlere dokunmuyor. Normal istemciyle yapilsaydi
     * yeni oturum aal1 olarak yazilir ve ikinci adimdan gecmis oturum
     * dusurulurdu.
     */
    const dogrulayici = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
    );
    const { error: girisHatasi } = await dogrulayici.auth.signInWithPassword({
      email: eposta ?? "",
      password: mevcut,
    });
    await dogrulayici.auth.signOut({ scope: "local" });

    if (girisHatasi) {
      setMesgul(false);
      setHata("Mevcut parola doğrulanmadı.");
      return;
    }

    const { error } = await tarayiciIstemcisi().auth.updateUser({ password: yeni });
    setMesgul(false);

    if (error) {
      setHata(error.message);
      return;
    }

    setMevcut("");
    setYeni("");
    setTekrar("");
    setNot("Parola değiştirildi. Bu oturum açık kaldı.");
  }

  const kutu =
    "mt-1.5 w-full rounded-lg border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none transition focus:border-accent";

  return (
    <>
      <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">Profil</h1>
      <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">
        Panel tek bir hesaba bağlı; burada o hesabın bilgileri ve parolası var. İki adımlı
        doğrulama ayrı sayfada:{" "}
        <a href="/admin/guvenlik" className="text-accent hover:underline">
          Güvenlik
        </a>
        .
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-4">
        <div className="text-[15px] font-bold text-ink">Hesap</div>
        <dl className="mt-3 space-y-1.5 text-[12.5px]">
          <div className="flex flex-wrap justify-between gap-3">
            <dt className="text-muted">E-posta</dt>
            <dd className="text-ink-soft">{eposta ?? "—"}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-3">
            <dt className="text-muted">Oluşturulma</dt>
            <dd className="text-ink-soft">{olusturma ? TARIH.format(new Date(olusturma)) : "—"}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-3">
            <dt className="text-muted">Son giriş</dt>
            <dd className="text-ink-soft">{sonGiris ? TARIH.format(new Date(sonGiris)) : "—"}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-3">
            <dt className="text-muted">İki adımlı doğrulama</dt>
            <dd className={mfaAcik ? "text-accent" : "text-amber-600 dark:text-amber-400"}>
              {mfaAcik ? "açık" : "kapalı"}
            </dd>
          </div>
        </dl>
        <p className="mt-3 border-t border-line pt-3 text-[12px] text-muted">
          E-posta adresi buradan değiştirilmiyor: panelin yetkisi bu adrese değil,
          <code className="mx-1 font-mono">admin_users</code> üyeliğine bağlı ve adres değişimi
          doğrulama postası gerektirir. Gerekirse Supabase panelinden yapılır.
        </p>
      </div>

      <form onSubmit={parolaDegistir} className="mt-4 max-w-md rounded-2xl border border-line bg-paper-2 p-4">
        <div className="text-[15px] font-bold text-ink">Parolayı değiştir</div>
        <p className="mt-0.5 text-[12.5px] text-muted">
          Mevcut parola da soruluyor — açık kalmış bir oturumun başkasının eline geçmesi hâlinde
          parolayı değiştirip hesabı kilitlemesini engelliyor.
        </p>

        {hata && (
          <p role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-ink">
            {hata}
          </p>
        )}
        {not && <p className="mt-3 rounded-lg border border-line bg-paper px-3 py-2 text-[13px] text-muted">{not}</p>}

        <label className="mt-3 block text-[12.5px] text-muted">
          Mevcut parola
          <input
            type="password"
            required
            autoComplete="current-password"
            value={mevcut}
            onChange={(e) => setMevcut(e.target.value)}
            className={kutu}
          />
        </label>
        <label className="mt-3 block text-[12.5px] text-muted">
          Yeni parola (en az {ASGARI} karakter)
          <input
            type="password"
            required
            minLength={ASGARI}
            autoComplete="new-password"
            value={yeni}
            onChange={(e) => setYeni(e.target.value)}
            className={kutu}
          />
        </label>
        <label className="mt-3 block text-[12.5px] text-muted">
          Yeni parola (tekrar)
          <input
            type="password"
            required
            minLength={ASGARI}
            autoComplete="new-password"
            value={tekrar}
            onChange={(e) => setTekrar(e.target.value)}
            className={kutu}
          />
        </label>

        <button
          type="submit"
          disabled={mesgul}
          className="mt-4 rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {mesgul ? "Değiştiriliyor…" : "Parolayı değiştir"}
        </button>
      </form>
    </>
  );
}
