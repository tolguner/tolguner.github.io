import Galeri, { type Foto } from "@/components/admin/Galeri";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

export default async function GaleriSayfasi() {
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("gallery_photos")
    .select("id, storage_path, caption_tr, caption_en, width, height, sort_order, is_published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <p className="rounded-xl border border-line bg-paper-2 p-5 text-[14px] text-ink">
        Galeri okunamadı: {error.message}
      </p>
    );
  }

  return <Galeri fotograflar={data as Foto[]} depoKoku={process.env.NEXT_PUBLIC_SUPABASE_URL!} />;
}
