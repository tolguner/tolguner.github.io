import Home from "@/components/home/Home";
import { getGallery } from "@/lib/gallery";
import { fetchPublicRepoCount, fetchRepos } from "@/lib/repos";

// getGallery() build sirasinda dosya sistemini okuyor. Sayfa istek aninda ya da
// ISR ile yeniden uretilirse bu klasor serverless paketinde bulunmaz ve galeri
// sessizce bosalir; bu yuzden sayfa yalnizca deploy aninda uretiliyor.
// (Faz B'de galeri Supabase'e tasininca revalidate acilacak.)
export const dynamic = "force-static";
export const revalidate = false;

export default async function Page() {
  const [repos, repoCount] = await Promise.all([fetchRepos(), fetchPublicRepoCount()]);
  return <Home repos={repos} repoCount={repoCount} photos={getGallery()} />;
}
