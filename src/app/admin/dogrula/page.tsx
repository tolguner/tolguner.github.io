"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cikisYap } from "../eylemler";
import { tarayiciIstemcisi } from "@/lib/supabase/tarayici";

/**
 * Ikinci adim: parola dogrulandi, simdi kimlik dogrulayici kodu isteniyor.
 *
 * Korumali route group'un DISINDA duruyor — icinde olsaydi layout bu sayfaya
 * yonlendirir, sayfa da layout'un icinde kalirdi ve dongu olusurdu.
 */
function KodFormu() {
  const router = useRouter();
  const nereden = useSearchParams().get("nereden") ?? "/admin";

  const [kod, setKod] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const [etkenId, setEtkenId] = useState<string | null>(null);
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    let iptal = false;
    void (async () => {
      const db = tarayiciIstemcisi();
      const { data: seviye } = await db.auth.mfa.getAuthenticatorAssuranceLevel();

      // Zaten dogrulanmissa burada oyalanmayalim.
      if (seviye?.currentLevel === "aal2") {
        router.replace(nereden.startsWith("/admin") ? nereden : "/admin");
        return;
      }

      const { data } = await db.auth.mfa.listFactors();
      const totp = data?.totp?.[0];
      if (iptal) return;
      if (!totp) {
        // Etken yoksa dogrulanacak bir sey de yok; panele don.
        router.replace("/admin");
        return;
      }
      setEtkenId(totp.id);
      setHazir(true);
    })();
    return () => {
      iptal = true;
    };
  }, [router, nereden]);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!etkenId) return;
    setHata(null);
    setBekliyor(true);

    const db = tarayiciIstemcisi();
    const { data: meydan, error: meydanHatasi } = await db.auth.mfa.challenge({ factorId: etkenId });
    if (meydanHatasi || !meydan) {
      setBekliyor(false);
      setHata("Doğrulama başlatılamadı, tekrar dene.");
      return;
    }

    const { error } = await db.auth.mfa.verify({
      factorId: etkenId,
      challengeId: meydan.id,
      code: kod.replace(/\s/g, ""),
    });
    if (error) {
      setBekliyor(false);
      setKod("");
      setHata("Kod doğrulanmadı. Uygulamadaki güncel kodu gir.");
      return;
    }

    router.replace(nereden.startsWith("/admin") ? nereden : "/admin");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={gonder}>
      <h1 className="font-serif text-[30px] font-bold tracking-tight text-ink">Doğrulama</h1>
      <p className="mt-1.5 text-[14px] text-muted">
        Kimlik doğrulayıcı uygulamandaki 6 haneli kodu gir.
      </p>

      <input
        id="kod"
        autoFocus
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9 ]*"
        maxLength={7}
        required
        disabled={!hazir}
        value={kod}
        onChange={(e) => setKod(e.target.value)}
        className="mt-6 w-full rounded-lg border border-line bg-paper-2 px-3 py-3 text-center font-mono text-[22px] tracking-[0.4em] text-ink outline-none transition focus:border-accent disabled:opacity-50"
      />

      {hata && (
        <p role="alert" className="mt-4 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13.5px] text-ink">
          {hata}
        </p>
      )}

      <button
        type="submit"
        disabled={bekliyor || !hazir}
        className="mt-6 w-full rounded-full bg-accent py-2.5 text-[14.5px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {bekliyor ? "Doğrulanıyor…" : "Doğrula"}
      </button>
      </form>

      {/* Ic ice form gecersiz HTML; cikis ayri bir form olarak duruyor. */}
      <form action={cikisYap}>
        <button type="submit" className="mt-6 block w-full text-center text-[13px] text-muted transition hover:text-ink">
          Başka hesapla gir
        </button>
      </form>
    </div>
  );
}

export default function DogrulamaSayfasi() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <Suspense fallback={null}>
        <KodFormu />
      </Suspense>
    </main>
  );
}
