import fs from "node:fs";
import path from "node:path";

export type Photo = { src: string; tr: string; en: string };

type CaptionFile = Record<string, { tr?: string; en?: string }>;

/**
 * Dosya adından alt başlık üretir:
 *   "01-IT&MIS Hackathon 2025.jpg"  ->  "IT&MIS Hackathon 2025"
 * Baştaki sıra öneki (01-, 02_, "03 ") ve uzantı atılır; gerisi olduğu gibi kalır.
 */
function captionFromFilename(file: string): string {
  return path
    .basename(file, path.extname(file))
    .replace(/^\d{1,3}\s*[-_.)]?\s*/, "")
    .trim();
}

/**
 * `public/galeri/` klasöründeki fotoğrafları okur. Sıra dosya adına göredir;
 * 01-, 02- gibi ön ek vererek sıralamayı belirleyebilirsiniz.
 *
 * Alt başlık varsayılan olarak **dosya adıdır**. İstenirse `src/galeri.json`
 * içinde dosya adıyla eşleşen bir kayıt yazılarak (özellikle İngilizcesi için)
 * bu değer geçersiz kılınabilir.
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
      const fromName = captionFromFilename(file);
      const c = captions[file] ?? {};
      const tr = c.tr ?? fromName;
      return { src: `/galeri/${encodeURIComponent(file)}`, tr, en: c.en ?? tr };
    });
}
