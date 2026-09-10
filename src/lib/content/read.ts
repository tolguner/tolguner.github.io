import "server-only";

import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";

import type { Lang } from "@/content";
import { anonimIstemci, depolamaAdresi } from "@/lib/supabase/anonim";

import cvYedek from "./seed/cv.json";
import galeriYedek from "./seed/galeri.json";
import homeYedek from "./seed/home.json";
import type { CvDoc, HomeDoc, Photo, PhotoRow } from "./types";

/**
 * Icerik okuma yolu.
 *
 * Iki savunma katmani var:
 *  1. `unstable_cache` — sayfa her istekte veritabanina gitmez.
 *     (`use cache` Next 15.5'te hala stabil degil.)
 *  2. Commit'lenmis JSON yedegi — Supabase ucretsiz katman 7 gun
 *     hareketsizlikte projeyi DURAKLATIR. Haftada birkac ziyaretci alan bir
 *     portfolyo icin bu "eger" degil "ne zaman" sorusu; okuma hata alirsa site
 *     eski icerikle ayakta kalir, beyaz ekran vermez.
 */

export const ETIKET = { icerik: "icerik", galeri: "galeri", medya: "medya" } as const;

const SURE = 3600;

function uyar(ne: string, err: unknown) {
  console.warn(`[icerik] ${ne} okunamadi, commit'li yedege dusuluyor.`, err);
}

// ---------------------------------------------------------------- dokumanlar

const yayimlananiOku = unstable_cache(
  async (slug: "home" | "cv") => {
    const { data, error } = await anonimIstemci().from("content_documents").select("published").eq("slug", slug).single();
    if (error) throw error;
    return data.published as HomeDoc | CvDoc;
  },
  ["content-documents"],
  { tags: [ETIKET.icerik], revalidate: SURE },
);

/** Taslak yalnizca Draft Mode'da ve yalnizca giris yapmis admin icin okunur. */
async function taslagiOku(slug: "home" | "cv") {
  const { sunucuIstemcisi } = await import("@/lib/supabase/sunucu");
  const db = await sunucuIstemcisi();
  const { data, error } = await db.from("content_drafts").select("data").eq("slug", slug).single();
  if (error) throw error;
  return data.data as HomeDoc | CvDoc;
}

async function dokuman<T>(slug: "home" | "cv", yedek: T): Promise<T> {
  try {
    const { isEnabled } = await draftMode();
    return ((isEnabled ? await taslagiOku(slug) : await yayimlananiOku(slug)) as T) ?? yedek;
  } catch (err) {
    uyar(slug, err);
    return yedek;
  }
}

export const getHomeDoc = () => dokuman<HomeDoc>("home", homeYedek as unknown as HomeDoc);
export const getCvDoc = () => dokuman<CvDoc>("cv", cvYedek as unknown as CvDoc);

// -------------------------------------------------------------------- galeri

const fotograflariOku = unstable_cache(
  async (): Promise<PhotoRow[]> => {
    const { data, error } = await anonimIstemci()
      .from("gallery_photos")
      .select("id, storage_path, caption_tr, caption_en, width, height, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data as PhotoRow[];
  },
  ["gallery-photos"],
  { tags: [ETIKET.galeri], revalidate: SURE },
);

/** `Home.tsx`in bugun bekledigi sekle donusturur; bilesende degisiklik yok. */
export async function getPhotos(): Promise<Photo[]> {
  try {
    return (await fotograflariOku()).map((f) => ({
      src: depolamaAdresi("gallery", f.storage_path),
      tr: f.caption_tr,
      en: f.caption_en,
    }));
  } catch (err) {
    uyar("galeri", err);
    return galeriYedek as Photo[];
  }
}

// --------------------------------------------------------------------- medya

const medyayiOku = unstable_cache(
  async () => {
    const { data, error } = await anonimIstemci().from("media_assets").select("key, storage_path");
    if (error) throw error;
    return data as { key: string; storage_path: string }[];
  },
  ["media-assets"],
  { tags: [ETIKET.medya], revalidate: SURE },
);

const CV_VARSAYILAN: Record<Lang, string> = {
  tr: "/cv/Tolga_Olguner_CV_TR.pdf",
  en: "/cv/Tolga_Olguner_CV_EN.pdf",
};

/** CV PDF adresleri. Kayit yoksa bugunku statik yollara duser. */
export async function getCvDosyalari(): Promise<Record<Lang, string>> {
  try {
    const kayitlar = await medyayiOku();
    const bul = (key: string) => kayitlar.find((k) => k.key === key)?.storage_path;
    const tr = bul("cv_tr");
    const en = bul("cv_en");
    return {
      tr: tr ? depolamaAdresi("documents", tr) : CV_VARSAYILAN.tr,
      en: en ? depolamaAdresi("documents", en) : CV_VARSAYILAN.en,
    };
  } catch (err) {
    uyar("medya", err);
    return CV_VARSAYILAN;
  }
}
