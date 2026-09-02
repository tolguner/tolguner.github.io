import type { NextConfig } from "next";

// GitHub Pages statik barındırma: HTML export, görsel optimizasyonu kapalı.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
