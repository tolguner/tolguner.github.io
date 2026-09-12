"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { tarayiciIstemcisi } from "@/lib/supabase/tarayici";

export type Etken = {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
};

const TARIH = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

/** Kayit sirasinda gosterilen QR + gizli anahtar. */
type Kurulum = { factorId: string; qr: string; secret: string };

/**
 * Iki adimli dogrulama (TOTP) yonetimi.
 *
 * Supabase akisi uc adim: `enroll` dogrulanmamis bir etken uretir, `challenge`
 * bir dogrulama oturumu acar, `verify` kodu kontrol eder. Dogrulama basarili
 * olunca mevcut oturum aal2'ye yukselir ve DIGER TUM oturumlar kapatilir.
 */
export default function Guvenlik({
  etkenler,
  seviye,
  eposta,
}: {
  etkenler: Etken[];
  seviye: string | null;
  eposta: string | undefined;
}) {
  const router = useRouter();
  const [kurulum, setKurulum] = useState<Kurulum | null>(null);
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [not, setNot] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const [silinecek, setSilinecek] = useState<string | null>(null);

  const dogrulanmis = etkenler.filter((e) => e.status === "verified");
  const bekleyen = etkenler.filter((e) => e.status !== "verified");

  async function basla() {
    setHata(null);
    setNot(null);
    setMesgul(true);

    const db = tarayiciIstemcisi();

    // Yarim kalmis kayitlar birikirse ad cakismasi hatasi veriyor; once temizle.
    for (const e of bekleyen) await db.auth.mfa.unenroll({ factorId: e.id });

    const { data, error } = await db.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Kimlik doğrulayıcı ${new Date().toISOString().slice(0, 16)}`,
    });
    setMesgul(false);

    if (error || !data) {
      setHata(error?.message ?? "Kayıt başlatılamadı.");
      return;
    }
    setKurulum({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    setKod("");
  }

  async function dogrula(e: React.FormEvent) {
    e.preventDefault();
    if (!kurulum) return;
    setHata(null);
    setMesgul(true);

    const db = tarayiciIstemcisi();
    const { data: meydan, error: meydanHatasi } = await db.auth.mfa.challenge({ factorId: kurulum.factorId });
    if (meydanHatasi || !meydan) {
      setMesgul(false);
      setHata(meydanHatasi?.message ?? "Doğrulama başlatılamadı.");
      return;
    }

    const { error } = await db.auth.mfa.verify({
      factorId: kurulum.factorId,
      challengeId: meydan.id,
      code: kod.replace(/\s/g, ""),
    });
    setMesgul(false);

    if (error) {
      // Kod 30 saniyede bir degisiyor; en sik sebep telefon saatinin kaymasi.
      setHata("Kod doğrulanmadı. Telefonundaki kod yenilendiyse yenisini gir.");
      return;
    }

    setKurulum(null);
    setKod("");
    setNot("İki adımlı doğrulama açıldı. Bundan sonra her girişte uygulamadaki kod sorulacak.");
    router.refresh();
  }

  async function vazgec() {
    if (!kurulum) return;
    await tarayiciIstemcisi().auth.mfa.unenroll({ factorId: kurulum.factorId });
    setKurulum(null);
    setKod("");
    setHata(null);
    router.refresh();
  }

  async function sil(id: string) {
    setHata(null);
    setMesgul(true);
    const { error } = await tarayiciIstemcisi().auth.mfa.unenroll({ factorId: id });
    setMesgul(false);
    setSilinecek(null);
    if (error) {
      setHata(error.message);
      return;
    }
    setNot("Kimlik doğrulayıcı kaldırıldı.");
    router.refresh();
  }

  return (
    <>
      <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">Güvenlik</h1>
      <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">
        Bu panel siteyi tümüyle yönetebiliyor ve tek bir hesaba bağlı. İki adımlı doğrulama açıkken
        parolan sızsa bile telefonundaki kod olmadan giriş yapılamaz.
      </p>

      {hata && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-ink">
          {hata}
        </p>
      )}
      {not && <p className="mt-4 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13px] text-muted">{not}</p>}

      <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-bold text-ink">İki adımlı doğrulama</div>
            <p className="mt-0.5 text-[12.5px] text-muted">
              {eposta} ·{" "}
              {dogrulanmis.length ? (
                <span className="text-accent">açık</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">kapalı</span>
              )}
              {seviye && <> · bu oturum {seviye}</>}
            </p>
          </div>
          {!kurulum && (
            <button
              type="button"
              disabled={mesgul}
              onClick={() => void basla()}
              className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {dogrulanmis.length ? "Yeni cihaz ekle" : "Kur"}
            </button>
          )}
        </div>

        {kurulum && (
          <form onSubmit={dogrula} className="mt-4 border-t border-line pt-4">
            <ol className="space-y-4 text-[13.5px] text-ink-soft">
              <li>
                <b className="text-ink">1.</b> Telefonundaki kimlik doğrulayıcı uygulamasında (Google
                Authenticator, 1Password, Bitwarden…) QR kodunu okut:
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={kurulum.qr}
                  alt="Kurulum QR kodu"
                  className="mt-2 h-44 w-44 rounded-lg bg-white p-2"
                />
              </li>
              <li>
                <b className="text-ink">2.</b> QR okutamıyorsan anahtarı elle gir:
                <code className="mt-1.5 block break-all rounded-lg border border-line bg-paper px-3 py-2 font-mono text-[12.5px] text-ink">
                  {kurulum.secret}
                </code>
              </li>
              <li>
                <b className="text-ink">3.</b> Uygulamanın ürettiği 6 haneli kodu gir:
                <input
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9 ]*"
                  maxLength={7}
                  required
                  value={kod}
                  onChange={(e) => setKod(e.target.value)}
                  className="mt-1.5 block w-40 rounded-lg border border-line bg-paper px-3 py-2 text-center font-mono text-[18px] tracking-[0.3em] text-ink outline-none transition focus:border-accent"
                />
              </li>
            </ol>

            <p className="mt-4 text-[12.5px] text-muted">
              Doğrulama tamamlanınca açık olan diğer oturumların kapanır — bu sekme açık kalır.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={mesgul}
                className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                {mesgul ? "Doğrulanıyor…" : "Doğrula ve aç"}
              </button>
              <button
                type="button"
                disabled={mesgul}
                onClick={() => void vazgec()}
                className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-ink transition hover:bg-paper disabled:opacity-40"
              >
                Vazgeç
              </button>
            </div>
          </form>
        )}

        {!kurulum && dogrulanmis.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
            {dogrulanmis.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 text-[12.5px]">
                <span className="text-muted">
                  <span className="text-ink-soft">{e.friendly_name || "Kimlik doğrulayıcı"}</span> ·{" "}
                  {TARIH.format(new Date(e.created_at))}
                </span>
                {silinecek === e.id ? (
                  <span className="flex items-center gap-2">
                    <span className="text-muted">Emin misin?</span>
                    <button
                      type="button"
                      onClick={() => void sil(e.id)}
                      className="rounded-full border border-red-500/50 px-3 py-1 text-[12px] font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                    >
                      Kaldır
                    </button>
                    <button
                      type="button"
                      onClick={() => setSilinecek(null)}
                      className="text-[12px] text-muted transition hover:text-ink"
                    >
                      vazgeç
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={mesgul}
                    onClick={() => setSilinecek(e.id)}
                    className="rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-ink transition hover:bg-paper disabled:opacity-35"
                  >
                    Kaldır
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!dogrulanmis.length && !kurulum && (
        <p className="mt-4 max-w-2xl rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[13px] text-ink">
          İki adımlı doğrulama kapalıyken içerik kaydetme ve yayımlama çalışmaz — veritabanı, yazma
          yetkisi için doğrulanmış oturum arıyor.
        </p>
      )}

      <div className="mt-6 max-w-2xl text-[12.5px] leading-relaxed text-muted">
        <b className="text-ink-soft">Telefonunu kaybedersen:</b> Supabase panelinden
        (Authentication → Users → hesabın → factors) kimlik doğrulayıcıyı silebilirsin; ardından
        buradan yeniden kurarsın. Bu yüzden Supabase hesabının parolası da güçlü olmalı — MFA
        zincirinin en zayıf halkası orası.
      </div>
    </>
  );
}
