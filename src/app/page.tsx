import Home from "@/components/home/Home";
import { getGallery } from "@/lib/gallery";
import { fetchPublicRepoCount, fetchRepos } from "@/lib/repos";

export default async function Page() {
  const [repos, repoCount] = await Promise.all([fetchRepos(), fetchPublicRepoCount()]);
  return <Home repos={repos} repoCount={repoCount} photos={getGallery()} />;
}
