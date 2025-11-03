import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações para deploy sem banco
  env: {
    SKIP_DATABASE: process.env.SKIP_DATABASE || "false",
  },

  // Ignorar warnings do ESLint no build de produção
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_DATABASE === "true",
  },

  // Redirects para deploy sem autenticação
  async redirects() {
    if (process.env.SKIP_DATABASE === "true") {
      return [
        {
          source: "/",
          destination: "/demo",
          permanent: false,
        },
        {
          source: "/user/login",
          destination: "/user/dashboard-demo",
          permanent: false,
        },
        {
          source: "/admin/login",
          destination: "/admin/dashboard-demo",
          permanent: false,
        },
        {
          source: "/admin",
          destination: "/admin/dashboard-demo",
          permanent: false,
        },
        {
          source: "/admin/dashboard",
          destination: "/admin/dashboard-demo",
          permanent: false,
        },
        {
          source: "/user",
          destination: "/user/dashboard-demo",
          permanent: false,
        },
        {
          source: "/user/dashboard",
          destination: "/user/dashboard-demo",
          permanent: false,
        },
      ];
    }
    return [];
  },

  // Otimizações para build
  experimental: {
    // optimizeCss: true, // Comentado devido a problemas com critters
  },

  // Configurações de output para Vercel (removido standalone temporariamente)
  // output: 'standalone',
};

export default nextConfig;
