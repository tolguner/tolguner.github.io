import fs from "node:fs";
import path from "node:path";

export type Photo = { src: string; tr: string; en: string };

type CaptionFile = Record<string, { tr?: string; en?: string }>;

/**
 * `public/galeri/` klasöründeki fotoğrafları okur. Sıra dosya adına göredir
 * (01-, 02- gibi ön ek vermek sırayı belirlemenin en kolay yolu).
 * Alt başlıklar `src/galeri.json` dosyasından, dosya adıyla eşleşerek gelir.
 */
export function getGallery(): Photo[] {
  const dir = path.join(process.cwd(), "public", "galeri");
  if (!fs.existsSync(dir)) return [];

  let captions: CaptionFile = {};
  const captionPath = path.join(process.cwd(), "src", "galeri.json");
  if (fs.existsSync(captionPath)) {
    try {
      captions = JSON.parse(fs.readFileSync(captionPath, "utf8")) as CaptionFile;
    } catch {
      captions = {};
    }
  }

  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "tr"))
    .map((file) => {
      const c = captions[file] ?? {};
      return { src: `/galeri/${file}`, tr: c.tr ?? "", en: c.en ?? c.tr ?? "" };
    });
}
