import type { Metadata } from "next";
import Site, { type Repo } from "@/components/Site";
import { fetchRepos } from "@/lib/repos";

export const metadata: Metadata = {
  title: "CV — Tolga Olguner",
  description: "Tolga Olguner'in özgeçmişi: eğitim, deneyim, TÜBİTAK 2209-A araştırma projesi ve seçili projeler.",
};

export default async function CvPage() {
  const repos: Repo[] = await fetchRepos();
  return <Site repos={repos} />;
}
