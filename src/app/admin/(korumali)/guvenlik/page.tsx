import Guvenlik, { type Etken } from "@/components/admin/Guvenlik";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

export const dynamic = "force-dynamic";

export default async function GuvenlikSayfasi() {
  const db = await sunucuIstemcisi();

  const [{ data: etkenler }, { data: seviye }, { data: kullanici }] = await Promise.all([
    db.auth.mfa.listFactors(),
    db.auth.mfa.getAuthenticatorAssuranceLevel(),
    db.auth.getUser(),
  ]);

  return (
    <Guvenlik
      etkenler={(etkenler?.all ?? []) as Etken[]}
      seviye={seviye?.currentLevel ?? null}
      eposta={kullanici.user?.email}
    />
  );
}
