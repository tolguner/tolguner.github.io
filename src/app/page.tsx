import Home from "@/components/home/Home";
import { fetchRepos } from "@/lib/repos";

export default async function Page() {
  const repos = await fetchRepos();
  return <Home repos={repos} />;
}
