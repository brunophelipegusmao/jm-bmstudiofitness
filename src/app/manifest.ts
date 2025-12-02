import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JM Fitness Studio",
    short_name: "JM Fitness",
    description:
      "Academia completa com musculação, treinamento funcional e acompanhamento personalizado",
    start_url: "/",
    display: "standalone",
    background_color: "#1b1b1a",
    theme_color: "#ff6b00",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    categories: ["health", "fitness", "sports"],
    lang: "pt-BR",
  };
}
