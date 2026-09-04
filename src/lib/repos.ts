export type Repo = {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  pushedAt: string;
  topics: string[];
};

// Ana sayfada öne çıkan depolar elle yazılıyor; bunlar otomatik listeden düşülür.
const EXCLUDED = new Set([
  "tolguner",
  "tolguner.github.io",
  "IsikCampusOS",
  "Veterinary-Management-System",
  "Hizli-Kazanc-Algisi-Analizi",
]);

async function fetchAll(): Promise<Array<Record<string, unknown>>> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch("https://api.github.com/users/tolguner/repos?per_page=100&sort=created", {
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
      createdAt: String(r.created_at ?? ""),
      topics: (r.topics as string[] | undefined) ?? [],
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Profilde görünen herkese açık depo sayısı (fork ve arşiv hariç). */
export async function fetchPublicRepoCount(): Promise<number> {
  const data = await fetchAll();
  return data.filter((r) => !r.fork && !r.archived && r.private !== true).length;
}
