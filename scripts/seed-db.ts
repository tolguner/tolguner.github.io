/**
 * Seed'in veritabanina dokunan yarisi. `scripts/seed.ts --db` ile cagrilir.
 *
 * SUPABASE_SECRET_KEY YALNIZCA BURADA, YALNIZCA YERELDE kullanilir. Vercel'e
 * hic konmaz: admin paneli, giris yapmis kullanici olarak RLS altinda yazar.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

import { getGallery } from "./galeri-kaynak";
import type { CvDoc, HomeDoc } from "../src/lib/content/types";

const KOK = process.cwd();

function istemci() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SECRET_KEY gerekli.\n" +
        ".env.local dosyasina ekleyin (SUPABASE_SECRET_KEY yalnizca yerelde kalir, Vercel'e konmaz).",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/** sharp'in format adi ile kovanin bekledigi MIME turu birebir ortusmuyor. */
const MIME: Record<string, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

/** Icerik adresli dosya adi: ayni dosya her zaman ayni yola gider (idempotent). */
function icerikAdi(buf: Buffer, uzanti: string) {
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 32) + uzanti;
}

export async function upsertDocs(hd: HomeDoc, cd: CvDoc) {
  const db = istemci();
  const hata = (ad: string, e: { message: string } | null) => {
    if (e) throw new Error(`${ad}: ${e.message}`);
  };

  // ------------------------------------------------------------ dokumanlar
  for (const [slug, data] of [
    ["home", hd],
    ["cv", cd],
  ] as const) {
    hata(
      `content_documents/${slug}`,
      (await db.from("content_documents").upsert({ slug, published: data }, { onConflict: "slug" })).error,
    );
    hata(
      `content_drafts/${slug}`,
      (await db.from("content_drafts").upsert({ slug, data }, { onConflict: "slug" })).error,
    );
    hata(
      `content_revisions/${slug}`,
      (await db.from("content_revisions").insert({ slug, data, kind: "seed" })).error,
    );
    console.log(`✓ ${slug} yazildi (published + draft + seed revizyonu)`);
  }

  // ---------------------------------------------------------------- galeri
  //
  // Kaynak olarak mevcut getGallery() kullaniliyor; boylece tasinan galeri
  // bugun sitede gorunenin birebir aynisi olur (siralama ve alt basliklar dahil).
  const fotograflar = getGallery();
  let sira = 0;
  for (const foto of fotograflar) {
    const dosyaAdi = decodeURIComponent(foto.src.replace(/^\/galeri\//, ""));
    const tamYol = path.join(KOK, "public", "galeri", dosyaAdi);
    const buf = fs.readFileSync(tamYol);
    const olcu = await sharp(buf).metadata();
    const hedef = icerikAdi(buf, path.extname(dosyaAdi).toLowerCase());

    const yukleme = await db.storage.from("gallery").upload(hedef, buf, {
      contentType: MIME[olcu.format ?? ""] ?? "application/octet-stream",
      cacheControl: "31536000, immutable",
      upsert: true,
    });
    hata(`storage/gallery/${dosyaAdi}`, yukleme.error);

    sira += 10; // Aralikli: araya fotograf eklemek icin yeniden numaralandirma gerekmez.
    hata(
      `gallery_photos/${dosyaAdi}`,
      (
        await db.from("gallery_photos").upsert(
          {
            storage_path: hedef,
            caption_tr: foto.tr,
            caption_en: foto.en,
            width: olcu.width ?? null,
            height: olcu.height ?? null,
            sort_order: sira,
            is_published: true,
          },
          { onConflict: "storage_path" },
        )
      ).error,
    );
  }
  console.log(`✓ ${fotograflar.length} fotograf yuklendi`);

  // ------------------------------------------------------------------ cv pdf
  for (const [key, dosya] of [
    ["cv_tr", "Tolga_Olguner_CV_TR.pdf"],
    ["cv_en", "Tolga_Olguner_CV_EN.pdf"],
  ] as const) {
    const buf = fs.readFileSync(path.join(KOK, "public", "cv", dosya));
    const hedef = icerikAdi(buf, ".pdf");
    hata(
      `storage/documents/${dosya}`,
      (
        await db.storage.from("documents").upload(hedef, buf, {
          contentType: "application/pdf",
          cacheControl: "31536000, immutable",
          upsert: true,
        })
      ).error,
    );
    hata(
      `media_assets/${key}`,
      (
        await db.from("media_assets").upsert(
          { key, storage_path: hedef, mime_type: "application/pdf", byte_size: buf.byteLength },
          { onConflict: "key" },
        )
      ).error,
    );
    console.log(`✓ ${key} yuklendi (${(buf.byteLength / 1024).toFixed(0)} KB)`);
  }
}
