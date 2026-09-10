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
  // GH_TOKEN Vercel'de elle tanimlanir. GitHub Actions'ta otomatik gelen
  // GITHUB_TOKEN'i da kabul ediyoruz ki gecis sirasinda iki ortam da calissin.
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    // Tokensiz saatte 60 istek hakki var; asilirsa depo listesi sessizce bosalirdi.
    console.warn("[repos] GH_TOKEN tanimli degil — GitHub API kotasi 60 istek/saat.");
  }
  try {
    const res = await fetch("https://api.github.com/users/tolguner/repos?per_page=100&sort=created", {
      headers,
      // Ana sayfa su an tam statik (bkz. app/page.tsx): galeri hala dosya
      // sisteminden okundugu icin ISR ile yeniden uretilemez. Galeri Supabase'e
      // tasininca burasi { revalidate: 3600, tags: ["github"] } olacak.
      cache: "force-cache",
    });
    if (!res.ok) {
      console.warn(`[repos] GitHub API ${res.status} dondu — depo listesi bos gosterilecek.`);
      return [];
    }
    return (await res.json()) as Array<Record<string, unknown>>;
  } catch (err) {
    console.warn("[repos] GitHub API'ye ulasilamadi — depo listesi bos gosterilecek.", err);
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
