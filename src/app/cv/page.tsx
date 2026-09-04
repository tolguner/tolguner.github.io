import type { Metadata } from "next";
import Site from "@/components/Site";

export const metadata: Metadata = {
  title: "CV — Tolga Olguner",
  description: "Tolga Olguner'in özgeçmişi: eğitim, deneyim, TÜBİTAK 2209-A araştırma projesi ve seçili projeler.",
};

export default function CvPage() {
  return <Site />;
}
