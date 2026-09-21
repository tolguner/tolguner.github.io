import Profil from "@/components/admin/Profil";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

export const dynamic = "force-dynamic";

export default async function ProfilSayfasi() {
  const db = await sunucuIstemcisi();

  const [{ data: kullanici }, { data: etkenler }] = await Promise.all([
    db.auth.getUser(),
    db.auth.mfa.listFactors(),
  ]);

  return (
    <Profil
      eposta={kullanici.user?.email}
      olusturma={kullanici.user?.created_at}
      sonGiris={kullanici.user?.last_sign_in_at}
      mfaAcik={(etkenler?.totp?.length ?? 0) > 0}
    />
  );
}
