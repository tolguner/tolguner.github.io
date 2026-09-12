import { anonimIstemci } from "@/lib/supabase/anonim";

/**
 * Supabase'i uyanik tutan gunluk dokunus (Vercel Cron -> bkz. vercel.json).
 *
 * Ucretsiz katman 7 gun API hareketi olmayan projeyi duraklatiyor. Sitenin
 * kendi trafigi bunu garanti etmiyor: sayfalar onbellekten servis ediliyor,
 * yani ziyaretci gelse bile Supabase'e istek gitmeyebiliyor. Duraklarsa site
 * commit'li JSON yedegine duser — ayakta kalir ama panelden yapilan
 * degisiklikler gorunmez olur.
 *
 * Okuma anon anahtarla ve RLS altinda yapiliyor; `content_documents` zaten
 * herkese acik okunabilir, yani burada hicbir yetki genisletilmiyor.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  // CRON_SECRET tanimliysa zorunlu. Tanimli degilse uc acik kalir; yaptigi is
  // tek satirlik bir okuma ama yine de kotayi tuketmenin bir yolu.
  const sir = process.env.CRON_SECRET;
  if (sir && request.headers.get("authorization") !== `Bearer ${sir}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const baslangic = Date.now();
  try {
    const { error } = await anonimIstemci()
      .from("content_documents")
      .select("slug", { head: true, count: "exact" });

    if (error) throw new Error(error.message);

    return Response.json({ ok: true, ms: Date.now() - baslangic });
  } catch (e) {
    // 500 donuyoruz ki Vercel'in cron gecmisinde basarisiz gorunsun; sessizce
    // basarili raporlanan bir saglik kontrolu ise yaramaz.
    console.error("[canli] Supabase'e ulasilamadi:", e);
    return Response.json(
      { ok: false, hata: e instanceof Error ? e.message : "bilinmeyen hata" },
      { status: 500 },
    );
  }
}
