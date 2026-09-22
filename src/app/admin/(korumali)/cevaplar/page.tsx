import CevapBankasi, { type Cevap } from "@/components/admin/CevapBankasi";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

// Kisisel veri; her istekte taze okunur, onbellege alinmaz.
export const dynamic = "force-dynamic";

export default async function CevaplarSayfasi() {
  const db = await sunucuIstemcisi();
  const { data, error } = await db
    .from("application_answers")
    .select("key, category, question, hint, answer, answer_en, confirmed, sensitive, sort")
    .order("sort", { ascending: true });

  if (error) {
    return (
      <p className="rounded-2xl border border-line bg-paper-2 p-5 text-[14px] text-ink">
        Cevap bankası okunamadı: {error.message}
      </p>
    );
  }

  return <CevapBankasi cevaplar={(data ?? []) as Cevap[]} />;
}
