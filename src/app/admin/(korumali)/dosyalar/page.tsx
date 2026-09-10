import Dosyalar, { type Medya } from "@/components/admin/Dosyalar";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

export default async function DosyalarSayfasi() {
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("media_assets")
    .select("key, storage_path, byte_size, version, updated_at")
    .in("key", ["cv_tr", "cv_en"]);

  if (error) {
    return (
      <p className="rounded-xl border border-line bg-paper-2 p-5 text-[14px] text-ink">
        Dosyalar okunamadı: {error.message}
      </p>
    );
  }

  return <Dosyalar medya={data as Medya[]} depoKoku={process.env.NEXT_PUBLIC_SUPABASE_URL!} />;
}
