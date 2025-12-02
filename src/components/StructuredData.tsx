export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HealthAndBeautyBusiness",
        "@id": "https://jmfitnessstudio.com.br/#organization",
        name: "JM Fitness Studio",
        url: "https://jmfitnessstudio.com.br",
        logo: "https://jmfitnessstudio.com/banner-01.png",
        description:
          "Academia completa com musculação, treinamento funcional e acompanhamento personalizado. Transforme sua vida com a gente!",
        sameAs: [
          // Adicione suas redes sociais aqui
          // "https://www.facebook.com/jmfitnessstudio",
          // "https://www.instagram.com/jmfitnessstudio",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: ["Portuguese"],
        },
        priceRange: "$$",
      },
      {
        "@type": "WebSite",
        "@id": "https://jmfitnessstudio.com.br/#website",
        url: "https://jmfitnessstudio.com.br",
        name: "JM Fitness Studio",
        description:
          "Academia completa com musculação, treinamento funcional e acompanhamento personalizado",
        publisher: {
          "@id": "https://jmfitnessstudio.com.br/#organization",
        },
        inLanguage: "pt-BR",
      },
      {
        "@type": "WebPage",
        "@id": "https://jmfitnessstudio.com.br/#webpage",
        url: "https://jmfitnessstudio.com.br",
        name: "JM Fitness Studio | Academia de Musculação e Treinamento Funcional",
        isPartOf: {
          "@id": "https://jmfitnessstudio.com.br/#website",
        },
        about: {
          "@id": "https://jmfitnessstudio.com.br/#organization",
        },
        description:
          "Transforme sua vida no JM Fitness Studio. Academia completa com musculação, treinamento funcional e acompanhamento personalizado.",
        inLanguage: "pt-BR",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
