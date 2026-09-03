import type { Repo } from "@/components/Site";

// CV'de öne çıkan depolar elle yazılıyor; bunlar otomatik listeden düşülür.
const EXCLUDED = new Set([
  "tolguner",
  "tolguner.github.io",
  "IsikCampusOS",
  "Veterinary-Management-System",
  "Hizli-Kazanc-Algisi-Analizi",
]);

// "Diğer Depolar" için elle belirlenmiş sıra; listede olmayan depolar
// (yeni eklenenler) sona, kendi aralarında push tarihine göre eklenir.
const MANUAL_ORDER = [
  "GuardPi",
  "Istanbul-Konut-Fiyat-Tahmini",
  "SiteDAO",
  "EventChain",
  "SelfWorkout",
  "Otel-Yonetim-Sistemi",
];

async function fetchAll(): Promise<Array<Record<string, unknown>>> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch("https://api.github.com/users/tolguner/repos?per_page=100&sort=pushed", {
      headers,
      cache: "force-cache",
    });
    if (!res.ok) return [];
    return (await res.json()) as Array<Record<string, unknown>>;
  } catch {
    return [];
  }
}

/** Öne çıkan ve profil/site depoları hariç, listelenecek depolar. */
export async function fetchRepos(): Promise<Repo[]> {
  const data = await fetchAll();
  return data
    .filter((r) => !r.fork && !r.archived && !EXCLUDED.has(String(r.name)))
    .map((r) => ({
      name: String(r.name),
      description: (r.description as string | null) ?? "",
      url: String(r.html_url),
      language: (r.language as string | null) ?? "",
      stars: Number(r.stargazers_count ?? 0),
      pushedAt: String(r.pushed_at ?? ""),
      topics: (r.topics as string[] | undefined) ?? [],
    }))
    .sort((a, b) => {
      const ia = MANUAL_ORDER.indexOf(a.name);
      const ib = MANUAL_ORDER.indexOf(b.name);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return b.pushedAt.localeCompare(a.pushedAt);
    });
}

/** Profilde görünen herkese açık depo sayısı (fork ve arşiv hariç). */
export async function fetchPublicRepoCount(): Promise<number> {
  const data = await fetchAll();
  return data.filter((r) => !r.fork && !r.archived && r.private !== true).length;
}
