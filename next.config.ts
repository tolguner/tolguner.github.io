import type { NextConfig } from "next";

// Vercel'de sunucu tarafi calisiyor: statik export yok, API route ve ISR kullanilabilir.
// trailingSlash korunuyor cunku /cv/ baglantilari ve canonical sabit yazili.
const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  trailingSlash: true,
};

export default nextConfig;
