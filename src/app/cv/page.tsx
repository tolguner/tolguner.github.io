import type { Metadata } from "next";
import Site from "@/components/Site";

export const metadata: Metadata = {
  title: "CV — Tolga Olguner",
  description: "Tolga Olguner'in özgeçmişi: eğitim, deneyim, TÜBİTAK 2209-A araştırma projesi ve seçili projeler.",
  // Kok metadata'daki canonical devralinmasin: bu sayfa ana sayfanin
  // kopyasi degil, kendi adresiyle indekslenmeli.
  alternates: { canonical: "/cv/" },
};

export default function CvPage() {
  return <Site />;
}
