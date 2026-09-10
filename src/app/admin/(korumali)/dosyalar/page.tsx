import Dosyalar, { type Medya, type Surum } from "@/components/admin/Dosyalar";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

// Yuklemeden hemen sonra guncel surum gorunmeli; onbellege alinmaz.
export const dynamic = "force-dynamic";

export default async function DosyalarSayfasi() {
  const db = await sunucuIstemcisi();
  const [medya, surumler] = await Promise.all([
    db.from("media_assets").select("key, storage_path, byte_size, version, updated_at").in("key", ["cv_tr", "cv_en"]),
    db
      .from("media_revisions")
      .select("id, key, storage_path, byte_size, version, created_at")
      .in("key", ["cv_tr", "cv_en"])
      .order("created_at", { ascending: false }),
  ]);

  if (medya.error || surumler.error) {
    return (
      <p className="rounded-xl border border-line bg-paper-2 p-5 text-[14px] text-ink">
        Dosyalar okunamadı: {medya.error?.message ?? surumler.error?.message}
      </p>
    );
  }

  return (
    <Dosyalar
      medya={medya.data as Medya[]}
      surumler={surumler.data as Surum[]}
      depoKoku={process.env.NEXT_PUBLIC_SUPABASE_URL!}
    />
  );
}
