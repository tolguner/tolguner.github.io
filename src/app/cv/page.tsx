import type { Metadata } from "next";
import Site from "@/components/Site";
import TaslakBandi from "@/components/admin/TaslakBandi";
import { localizeCv } from "@/lib/content/localize";
import { getCvDoc, getCvDosyalari } from "@/lib/content/read";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "CV — Tolga Olguner",
  description: "Tolga Olguner'in özgeçmişi: eğitim, deneyim, TÜBİTAK 2209-A araştırma projesi ve seçili projeler.",
  // Kok metadata'daki canonical devralinmasin: bu sayfa ana sayfanin
  // kopyasi degil, kendi adresiyle indekslenmeli.
  alternates: { canonical: "/cv/" },
};

export default async function CvPage() {
  const [doc, cvDosyalari] = await Promise.all([getCvDoc(), getCvDosyalari()]);
  // Onceden `new Date()` modul seviyesindeydi: sunucu ve istemci farkli gune
  // duserse hidrasyon uyusmazligi olurdu. Artik tek yerde, sunucuda hesaplaniyor.
  const simdi = new Date();

  return (
    <>
      <TaslakBandi />
      <Site
        icerik={{ tr: localizeCv(doc, "tr", cvDosyalari), en: localizeCv(doc, "en", cvDosyalari) }}
        guncellendi={simdi.toISOString().slice(0, 10)}
        yil={simdi.getUTCFullYear()}
      />
    </>
  );
}
