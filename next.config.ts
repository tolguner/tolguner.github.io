import type { NextConfig } from "next";

/**
 * Galeri fotograflari Supabase Storage'dan geliyor; `next/image` uzak host'u
 * acikca izinli gormek istiyor. Host adi env'den turetiliyor, elle yazilmiyor:
 * proje degisirse tek bir yerde degisir. Env yoksa (bazi arac calistirmalari)
 * liste bos kalir ve derleme patlamaz.
 */
function supabaseHost(): string[] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    return [new URL(url).hostname];
  } catch {
    return [];
  }
}

// Vercel'de sunucu tarafi calisiyor: statik export yok, API route ve ISR kullanilabilir.
// trailingSlash korunuyor cunku /cv/ baglantilari ve canonical sabit yazili.
const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  trailingSlash: true,
  images: {
    /**
     * Galeri dosya adlari icerik adresli (SHA-256): bir fotograf degisirse
     * URL'i de degisir. Dolayisiyla uretilen boyutlari uzun sure onbellekte
     * tutmak guvenli ve Vercel'in goruntu donusturme kotasini koruyor —
     * varsayilan 60 saniyelik TTL ile ayni kareler bosuna yeniden uretilirdi.
     */
    minimumCacheTTL: 31536000,
    remotePatterns: supabaseHost().map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/storage/v1/object/public/**",
    })),
  },
};

export default nextConfig;
