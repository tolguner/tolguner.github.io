import type { NextConfig } from "next";

// GitHub Pages statik barındırma: HTML export, görsel optimizasyonu kapalı.
const nextConfig: NextConfig = {
  output: "export",
  outputFileTracingRoot: __dirname,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
