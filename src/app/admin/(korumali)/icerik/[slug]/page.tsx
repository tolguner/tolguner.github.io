import { notFound } from "next/navigation";

import Duzenleyici from "@/components/admin/Duzenleyici";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

const ADLAR = { home: "Ana sayfa", cv: "CV" } as const;
type Slug = keyof typeof ADLAR;

export default async function IcerikSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== "home" && slug !== "cv") notFound();

  const db = await sunucuIstemcisi();
  const [taslak, yayimlanan] = await Promise.all([
    db.from("content_drafts").select("data, lock_version").eq("slug", slug).single(),
    db.from("content_documents").select("published, lock_version").eq("slug", slug).single(),
  ]);

  if (taslak.error || yayimlanan.error) {
    return (
      <p className="rounded-xl border border-line bg-paper-2 p-5 text-[14px] text-ink">
        İçerik okunamadı: {taslak.error?.message ?? yayimlanan.error?.message}
      </p>
    );
  }

  return (
    <Duzenleyici
      slug={slug as Slug}
      baslik={ADLAR[slug as Slug]}
      taslak={taslak.data.data}
      yayimlanan={yayimlanan.data.published}
      lockVersion={taslak.data.lock_version}
      yayimliSurum={yayimlanan.data.lock_version}
    />
  );
}
