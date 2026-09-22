import Kesfet, { type Ilan } from "@/components/admin/Kesfet";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

// Karar aninda gorunmeli; onbellege alinmaz.
export const dynamic = "force-dynamic";

export default async function KesfetSayfasi() {
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("job_postings")
    .select(
      "id, platform, company, position, location, work_mode, job_url, kind, easy_apply, deadline, summary, score, score_reasons, areas, decision, found_at",
    )
    // Basvurulmus ilanlar Basvurular sayfasinda; burada yalnizca karar asamasindakiler.
    .neq("decision", "basvuruldu")
    .order("score", { ascending: false, nullsFirst: false })
    .order("found_at", { ascending: false });

  if (error) {
    return (
      <p className="rounded-2xl border border-line bg-paper-2 p-5 text-[14px] text-ink">
        İlanlar okunamadı: {error.message}
      </p>
    );
  }

  return <Kesfet ilanlar={(data ?? []) as Ilan[]} />;
}
