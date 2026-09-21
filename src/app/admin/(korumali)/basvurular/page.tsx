import Basvurular, { type Basvuru } from "@/components/admin/Basvurular";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

// Durum degisikligi aninda gorunmeli; onbellege alinmaz.
export const dynamic = "force-dynamic";

export default async function BasvurularSayfasi() {
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("job_applications")
    .select("id, platform, company, position, location, work_mode, job_url, applied_at, status, posting_status, notes, source, synced_at")
    .order("applied_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="rounded-2xl border border-line bg-paper-2 p-5 text-[14px] text-ink">
        Başvurular okunamadı: {error.message}
      </p>
    );
  }

  return <Basvurular kayitlar={(data ?? []) as Basvuru[]} />;
}
