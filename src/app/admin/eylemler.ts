"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { draftMode } from "next/headers";

import { ETIKET } from "@/lib/content/read";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

type Slug = "home" | "cv";

const YOL: Record<Slug, string> = { home: "/", cv: "/cv" };

export async function cikisYap() {
  const db = await sunucuIstemcisi();
  await db.auth.signOut();
  (await draftMode()).disable();
  redirect("/admin/login");
}

/** Taslagi kaydeder. Tum dokumani yazar (~80 KB, tek yazar). */
export async function taslagiKaydet(slug: Slug, data: unknown, lockVersion: number) {
  const db = await sunucuIstemcisi();

  const { data: satir, error } = await db
    .from("content_drafts")
    .update({ data })
    .eq("slug", slug)
    .eq("lock_version", lockVersion) // iki sekme acik kalirsa catisma burada yakalanir
    .select("lock_version, updated_at")
    .maybeSingle();

  if (error) return { ok: false as const, hata: error.message };
  if (!satir) {
    return {
      ok: false as const,
      hata: "Bu taslak başka bir yerden değiştirilmiş. Sayfayı yeniden yükleyin.",
      catisma: true as const,
    };
  }

  return { ok: true as const, lockVersion: satir.lock_version, kaydedildi: satir.updated_at };
}

/** Taslagi yayimlar: RPC + onbellek temizligi. */
export async function yayimla(slug: Slug, lockVersion: number) {
  const db = await sunucuIstemcisi();

  const { error } = await db.rpc("publish_document", { p_slug: slug, p_lock_version: lockVersion });
  if (error) return { ok: false as const, hata: error.message };

  // IKISI BIRDEN gerekli: revalidateTag yalnizca Data Cache'i temizler,
  // onceden uretilmis HTML'i degil. "Yayimladim ama degismedi" sikayetinin
  // bir numarali sebebi budur.
  revalidateTag(ETIKET.icerik);
  revalidatePath(YOL[slug]);

  return { ok: true as const };
}

/** Onizleme: taslak gercek sayfalardan render edilir, GSAP davranisi dahil. */
export async function onizlemeyiAc(slug: Slug) {
  const db = await sunucuIstemcisi();
  const { data: adminMi } = await db.rpc("is_admin");
  if (!adminMi) return;

  (await draftMode()).enable();
  redirect(YOL[slug] || "/");
}

export async function onizlemeyiKapat() {
  (await draftMode()).disable();
  redirect("/admin");
}

/** Taslagin veritabanindaki guncel surumu — yayimlamada surum tazeleme icin. */
export async function taslakSurumu(slug: Slug) {
  const db = await sunucuIstemcisi();
  const { data, error } = await db.from("content_drafts").select("lock_version").eq("slug", slug).single();
  if (error) return { ok: false as const, hata: error.message };
  return { ok: true as const, lockVersion: data.lock_version as number };
}

/**
 * Bir revizyonu TASLAGA geri yukler.
 *
 * Dogrudan yayimlamiyoruz: geri alma da bir icerik degisikligi, once
 * duzenleyicide gorulmeli. Kullanici bakip "Yayimla"ya basar. Boylece geri
 * alma da normal yayim akisindan gecer ve kendi revizyon satirini yazar.
 *
 * Form action olarak kullanildigi icin deger DONDURMEZ; hata durumunda
 * gecmis sayfasina hata parametresiyle geri doner.
 */
export async function revizyonaDon(slug: Slug, id: string) {
  const db = await sunucuIstemcisi();

  const { data: rev, error: okumaHatasi } = await db
    .from("content_revisions")
    .select("data")
    .eq("id", id)
    .eq("slug", slug)
    .single();
  if (okumaHatasi) {
    redirect(`/admin/revizyonlar/${slug}?hata=${encodeURIComponent(okumaHatasi.message)}`);
  }

  const { error } = await db.from("content_drafts").update({ data: rev.data }).eq("slug", slug);
  if (error) {
    redirect(`/admin/revizyonlar/${slug}?hata=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/icerik/${slug}`);
}

/* ------------------------------------------------------------- galeri */

/**
 * Yuklenen bir fotografi kaydeder.
 *
 * Dosyanin KENDISI buradan gecmiyor: tarayici dogrudan Storage'a yukluyor
 * (kullanicinin oturumu + RLS ile). Vercel'de server action govdesi 4,5 MB ile
 * sinirli; bugunku fotograflar ~29 KB ama telefondan gelen ham fotograf
 * 4-8 MB olabiliyor.
 */
export async function fotografEkle(girdi: {
  storagePath: string;
  captionTr: string;
  captionEn: string;
  width: number | null;
  height: number | null;
}) {
  const db = await sunucuIstemcisi();

  const { data: sonSira } = await db
    .from("gallery_photos")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await db.from("gallery_photos").insert({
    storage_path: girdi.storagePath,
    caption_tr: girdi.captionTr,
    caption_en: girdi.captionEn,
    width: girdi.width,
    height: girdi.height,
    sort_order: (sonSira?.sort_order ?? 0) + 10,
    // Yeni fotograf TASLAK gelir: kirpma dogru mu, alt baslik yazildi mi
    // gorulmeden siteye dusmesin. Yayima almak ayri bir adim.
    is_published: false,
  });
  if (error) return { ok: false as const, hata: error.message };

  galeriyiTazele();
  return { ok: true as const };
}

export async function fotografGuncelle(id: string, alanlar: { caption_tr?: string; caption_en?: string; is_published?: boolean }) {
  const db = await sunucuIstemcisi();
  const { error } = await db.from("gallery_photos").update(alanlar).eq("id", id);
  if (error) return { ok: false as const, hata: error.message };
  galeriyiTazele();
  return { ok: true as const };
}

/**
 * Fotograf SATIRINI siler ve satirin kopyasini dondurur.
 *
 * Depodaki dosya bilerek DOKUNULMADAN birakiliyor: kullaniciya "geri al"
 * suresi taniyoruz ve geri alma ancak dosya yerinde durursa mumkun.
 * Sure dolunca `depodanSil` cagriliyor.
 */
export async function fotografSil(id: string) {
  const db = await sunucuIstemcisi();

  const { data: satir, error: okumaHatasi } = await db
    .from("gallery_photos")
    .select("id, storage_path, caption_tr, caption_en, width, height, sort_order, is_published")
    .eq("id", id)
    .single();
  if (okumaHatasi) return { ok: false as const, hata: okumaHatasi.message };

  const { error } = await db.from("gallery_photos").delete().eq("id", id);
  if (error) return { ok: false as const, hata: error.message };

  galeriyiTazele();
  return { ok: true as const, satir };
}

/** Geri alma suresi dolunca depodaki dosyayi da siler. */
export async function depodanSil(storagePath: string) {
  const db = await sunucuIstemcisi();
  const { error } = await db.storage.from("gallery").remove([storagePath]);
  // Satir zaten gitti; dosya kalirsa site dogru gorunur, yalnizca kovada
  // yetim bir dosya olur. Sessizce yutmuyoruz ama akisi da durdurmuyoruz.
  if (error) return { ok: false as const, hata: error.message };
  return { ok: true as const };
}

/** Silinen satiri aynen geri koyar. */
export async function fotografGeriAl(satir: {
  storage_path: string;
  caption_tr: string;
  caption_en: string;
  width: number | null;
  height: number | null;
  sort_order: number;
  is_published: boolean;
}) {
  const db = await sunucuIstemcisi();
  const { error } = await db.from("gallery_photos").insert(satir);
  if (error) return { ok: false as const, hata: error.message };
  galeriyiTazele();
  return { ok: true as const };
}

/** Bir veya daha fazla fotografi yayima alir ya da yayimdan cikarir. */
export async function yayimDurumu(idler: string[], yayimda: boolean) {
  if (!idler.length) return { ok: true as const };
  const db = await sunucuIstemcisi();
  const { error } = await db.from("gallery_photos").update({ is_published: yayimda }).in("id", idler);
  if (error) return { ok: false as const, hata: error.message };
  galeriyiTazele();
  return { ok: true as const };
}

/** Siralamayi topluca yazar. */
export async function siralamayiKaydet(sira: { id: string; sort_order: number }[]) {
  const db = await sunucuIstemcisi();
  for (const s of sira) {
    const { error } = await db.from("gallery_photos").update({ sort_order: s.sort_order }).eq("id", s.id);
    if (error) return { ok: false as const, hata: error.message };
  }
  galeriyiTazele();
  return { ok: true as const };
}

/** Yeni CV PDF'ini kaydeder (dosya yine tarayicidan Storage'a gitti). */
export async function medyayiGuncelle(key: "cv_tr" | "cv_en", storagePath: string, byteSize: number) {
  const db = await sunucuIstemcisi();

  const { data: eski } = await db.from("media_assets").select("storage_path, version").eq("key", key).maybeSingle();

  const { error } = await db.from("media_assets").upsert(
    {
      key,
      storage_path: storagePath,
      mime_type: "application/pdf",
      byte_size: byteSize,
      version: (eski?.version ?? 0) + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) return { ok: false as const, hata: error.message };

  // Eski dosya BILEREK silinmiyor: kaydedilmis/paylasilmis PDF baglantilari
  // kirilmasin. Dosyalar icerik adresli, yer kaplamasi onemsiz.
  revalidateTag(ETIKET.medya);
  revalidatePath("/cv");
  return { ok: true as const, oncekiYol: eski?.storage_path ?? null };
}

function galeriyiTazele() {
  revalidateTag(ETIKET.galeri);
  revalidatePath("/");
}
