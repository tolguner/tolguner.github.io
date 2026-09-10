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
