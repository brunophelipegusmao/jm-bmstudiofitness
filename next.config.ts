import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Habilita modo standalone para Docker
  output: "standalone",
  images: {
    unoptimized: true, // Permite qualquer URL externa sem otimização
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
