import Home from "@/components/home/Home";
import { localizeHome } from "@/lib/content/localize";
import { getHomeDoc, getPhotos } from "@/lib/content/read";
import { fetchPublicRepoCount, fetchRepos } from "@/lib/repos";

// Icerik ve galeri artik Supabase'ten geliyor; okuma yolu `unstable_cache` ile
// saatlik yenileniyor ve yayimlamada `revalidateTag` ile aninda tazeleniyor.
// Bu yuzden Faz A'daki `force-static` kisiti kalkti.
export const revalidate = 3600;

export default async function Page() {
  const [doc, photos, repos, repoCount] = await Promise.all([
    getHomeDoc(),
    getPhotos(),
    fetchRepos(),
    fetchPublicRepoCount(),
  ]);

  return (
    <Home
      repos={repos}
      repoCount={repoCount}
      photos={photos}
      icerik={{ tr: localizeHome(doc, "tr"), en: localizeHome(doc, "en") }}
    />
  );
}
