import IsPortali, { type PortalSayfa } from "@/components/admin/IsPortali";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

// Ozel icerik; her istekte taze okunur, onbellege alinmaz.
export const dynamic = "force-dynamic";

export default async function IsPortaliSayfasi() {
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("work_portal_pages")
    .select("slug, category, title, summary, body_md, sort, verified, updated_at")
    .order("category", { ascending: true })
    .order("sort", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    return (
      <p className="rounded-2xl border border-line bg-paper-2 p-5 text-[14px] text-ink">
        İş portalı okunamadı: {error.message}
      </p>
    );
  }

  return <IsPortali sayfalar={(data ?? []) as PortalSayfa[]} />;
}
