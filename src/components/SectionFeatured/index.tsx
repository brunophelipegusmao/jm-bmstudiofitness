"use client";

import clsx from "clsx";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Função para validar se é uma URL válida de imagem
const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === "") return false;

  try {
    const urlObj = new URL(url.trim());
    const pathname = urlObj.pathname.toLowerCase();

    // Verifica se termina com extensão de imagem válida
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
    ];
    const hasValidExtension = validExtensions.some((ext) =>
      pathname.endsWith(ext),
    );

    // Aceita URLs locais (começam com /) ou URLs com extensão de imagem
    return pathname.startsWith("/") || hasValidExtension;
  } catch {
    // Se começar com / é uma URL local válida
    return url.trim().startsWith("/");
  }
};

// Imagens padrão do carrossel
const DEFAULT_CAROUSEL_IMAGES = [
  {
    src: "/banner-01.png",
    alt: "Estúdio - Equipamentos de Musculação",
    href: "/equipamentos",
    loading: "eager" as const,
    priority: true,
  },
  {
    src: "/banner-03.png",
    alt: "Aulas de Grupo - Fitness",
    href: "/aulas",
    loading: "eager" as const,
  },
  {
    src: "/banner-04.png",
    alt: "Personal Training",
    href: "/personal",
    loading: "lazy" as const,
  },
  {
    src: "/banner-05.png",
    alt: "Nutrição Esportiva",
    href: "/nutricao",
    loading: "lazy" as const,
  },
  {
    src: "/banner-06.png",
    alt: "Ambiente do Estúdio",
    href: "/sobre",
    loading: "lazy" as const,
  },
];

export default function SectionFeatured() {
  // Preferências do usuário para movimento reduzido
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const plugin = useRef(
    Autoplay({
      delay: prefersReducedMotion ? 6000 : 4000,
      stopOnInteraction: true,
    }),
  );

  const [carouselImages, setCarouselImages] = useState<
    Array<{
      src: string;
      alt: string;
      href: string;
      loading?: "lazy" | "eager";
      priority?: boolean;
    }>
  >(DEFAULT_CAROUSEL_IMAGES);

  useEffect(() => {
    const loadCarouselImages = async () => {
      try {
        // TODO: Implementar endpoint /api/settings no backend
        // const settings = await apiClient.get('/settings');

        // Por enquanto, usa imagens padrão
        setCarouselImages(DEFAULT_CAROUSEL_IMAGES);

        /* Código para quando o endpoint estiver pronto:
        const images = [
          settings.carouselImage1,
          settings.carouselImage2,
          settings.carouselImage3,
          settings.carouselImage4,
          settings.carouselImage5,
          settings.carouselImage6,
          settings.carouselImage7,
        ]
          .filter((img) => img && img.trim() !== "")
          .filter((img) => isValidImageUrl(img!))
          .map((src, index) => ({
            src: src!.trim(),
            alt: `Imagem ${index + 1} - ${settings.studioName || "JM Fitness Studio"}`,
            href: "/",
            loading: (index < 2 ? "eager" : "lazy") as "eager" | "lazy",
            priority: index === 0,
          }));

        if (images.length > 0) {
          setCarouselImages(images);
        }
        */
      } catch (error) {
        console.error("Erro ao carregar imagens do carrossel:", error);
        // Em caso de erro, mantém imagens padrão
        setCarouselImages(DEFAULT_CAROUSEL_IMAGES);
      }
    };

    loadCarouselImages();
  }, []);

  // Não renderizar até ter as imagens carregadas
  if (carouselImages.length === 0) {
    return (
      <div className="flex min-h-[500px] w-full items-center justify-center sm:min-h-[600px] md:min-h-[700px] lg:min-h-[800px]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C2A537] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      className={clsx(
        "flex w-full items-center justify-center",
        "min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[800px]",
        "relative",
      )}
    >
      {/* Background gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/50"></div>

      <section className="relative z-10 flex w-full flex-col items-center justify-center">
        {/* Container para título com limitação de largura */}
        <div className="w-full max-w-[350px] px-6 sm:max-w-[700px] sm:px-8 md:max-w-[900px] md:px-12 lg:max-w-[1200px] lg:px-16">
          {/* Título com animações avançadas */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative mb-8 text-center"
          >
            {/* Background decorativo para o título */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -inset-4 animate-pulse rounded-3xl bg-linear-to-r from-[#C2A537]/20 via-[#C2A537]/10 to-[#C2A537]/20 blur-xl"
            ></motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="font-oswald relative bg-linear-to-r from-[#FFD700] via-[#C2A537] to-[#B8941F] bg-clip-text py-6 text-3xl font-bold text-transparent drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
            >
              <motion.span
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="font-oswald block animate-pulse"
              >
                Bem-vindo ao
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                viewport={{ once: true }}
                className="mt-2 block text-4xl font-extrabold transition-all sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
              >
                {/* JM com fonte Anton e animação delicada */}
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.9,
                    type: "spring",
                    stiffness: 50,
                  }}
                  className="relative inline-block"
                >
                  <motion.div
                    className="relative"
                    animate={{
                      y: [0, -3, 0],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Camada base */}
                    <motion.span
                      className="font-anton absolute inset-0 inline-block text-8xl font-black tracking-tighter text-[#C2A537]/20 blur-sm"
                      animate={{
                        scale: [1, 1.02, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2,
                      }}
                    >
                      JM
                    </motion.span>

                    {/* Camada principal */}
                    <motion.span
                      className="font-anton relative inline-block text-8xl font-black tracking-tighter"
                      style={{
                        background: "linear-gradient(45deg, #FFD700, #C2A537)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        filter: "drop-shadow(0 4px 12px rgba(194,165,55,0.3))",
                      }}
                      animate={{
                        filter: [
                          "drop-shadow(0 4px 12px rgba(194,165,55,0.3))",
                          "drop-shadow(0 6px 16px rgba(194,165,55,0.4))",
                          "drop-shadow(0 4px 12px rgba(194,165,55,0.3))",
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      JM
                    </motion.span>
                  </motion.div>{" "}
                  {/* Glow sutil animado */}
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 -z-10 rounded-full blur-2xl"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(194,165,55,0.2), transparent 70%)",
                    }}
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                      scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.span>

                {/* Espaço elegante */}
                <span className="mx-3">&nbsp;</span>

                {/* Fitness Studio com fonte Oswald e animação suave */}
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 1.1,
                    type: "spring",
                    stiffness: 45,
                  }}
                  className="relative inline-block"
                >
                  <motion.div
                    className="relative"
                    animate={{
                      y: [0, -2, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4,
                    }}
                  >
                    {/* Camada de sombra */}
                    <motion.span
                      className="font-oswald absolute inset-0 inline-block text-7xl font-light tracking-wider text-[#C2A537]/10 blur-md"
                      animate={{
                        opacity: [0.1, 0.2, 0.1],
                        scale: [1, 1.01, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      Fitness Studio
                    </motion.span>

                    {/* Camada principal */}
                    <motion.span
                      className="font-oswald relative inline-block text-7xl font-light tracking-wider"
                      style={{
                        background:
                          "linear-gradient(45deg, #FFD700 20%, #C2A537 80%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        filter: "drop-shadow(0 2px 8px rgba(194,165,55,0.2))",
                      }}
                      animate={{
                        filter: [
                          "drop-shadow(0 2px 8px rgba(194,165,55,0.2))",
                          "drop-shadow(0 3px 12px rgba(194,165,55,0.3))",
                          "drop-shadow(0 2px 8px rgba(194,165,55,0.2))",
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      Fitness Studio
                    </motion.span>
                  </motion.div>

                  {/* Glow sutil */}
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 -z-10 rounded-full blur-xl"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(194,165,55,0.15), transparent 75%)",
                    }}
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                      scale: [0.98, 1.02, 0.98],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  />
                </motion.span>
              </motion.span>
            </motion.h1>

            {/* Elementos decorativos */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: "auto" }}
              transition={{ duration: 0.8, delay: 0.9 }}
              viewport={{ once: true }}
              className="mt-4 flex justify-center space-x-2"
            >
              <div className="h-0.5 w-12 animate-pulse bg-linear-to-r from-transparent via-[#C2A537] to-transparent"></div>
              <div className="h-4 w-4 animate-bounce rounded-full bg-[#C2A537] delay-100"></div>
              <div className="h-0.5 w-12 animate-pulse bg-linear-to-r from-transparent via-[#C2A537] to-transparent"></div>
            </motion.div>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              viewport={{ once: true }}
              className="mx-auto mt-6 max-w-2xl text-lg font-light text-gray-300 sm:text-xl md:text-2xl"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
              >
                Transforme seu corpo e sua mente com{" "}
                <motion.span
                  className="relative inline-block font-semibold text-[#C2A537]"
                  whileHover={{
                    scale: 1.05,
                    color: "#FFD700",
                    transition: { duration: 0.2 },
                  }}
                >
                  excelência
                  <motion.span
                    className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#C2A537]"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.span>{" "}
                e{" "}
                <motion.span
                  className="relative inline-block font-semibold text-[#C2A537]"
                  whileHover={{
                    scale: 1.05,
                    color: "#FFD700",
                    transition: { duration: 0.2 },
                  }}
                >
                  dedicação
                  <motion.span
                    className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#C2A537]"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.span>
              </motion.span>
            </motion.p>
          </motion.div>
        </div>

        {/* Container do carrossel com largura responsiva */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          viewport={{ once: true }}
          className="relative w-full px-0 sm:max-w-[700px] sm:px-4 md:max-w-[900px] md:px-6 lg:max-w-[1200px] lg:px-8 xl:px-12"
        >
          <Carousel
            plugins={[plugin.current]}
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false, // Melhor controle para usuários de teclado
              dragFree: false, // Movimento mais previsível
            }}
            className="animate-in slide-in-from-bottom relative h-full w-full max-w-full rounded-none shadow-2xl delay-1500 duration-1000 sm:rounded-2xl"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            // Melhorias de acessibilidade
            aria-label="Galeria de imagens do estúdio"
            role="region"
          >
            <CarouselContent className="h-full">
              {carouselImages.map((image, index) => (
                <CarouselItem key={index} className="h-full w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="h-full p-0 sm:p-1 md:p-2 lg:p-4"
                  >
                    <Card className="group relative m-0 h-[350px] w-full overflow-hidden rounded-none border-0 bg-transparent p-0 sm:h-[450px] sm:rounded-2xl md:h-[500px] lg:h-[550px]">
                      <CardContent className="flex h-full flex-col items-center justify-center p-0">
                        {/* Link wrapper */}
                        <Link
                          href={image.href}
                          className="relative block h-full w-full overflow-hidden rounded-none transition-transform duration-500 ease-out will-change-transform sm:rounded-2xl"
                        >
                          {/* Efeito de borda brilhante */}
                          <motion.div
                            className="absolute -inset-1 z-0 rounded-none opacity-0 blur sm:rounded-2xl"
                            style={{
                              background:
                                "linear-gradient(45deg, #FFD700 0%, #C2A537 100%)",
                            }}
                            animate={{
                              opacity: [0, 0.3, 0],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: index * 0.2,
                            }}
                          />

                          {/* Imagem com tag img simples para suportar URLs externas */}
                          <motion.img
                            src={image.src}
                            alt={image.alt}
                            className="h-full w-full scale-100 object-cover object-center transition-all duration-700 ease-out will-change-transform group-hover:scale-105"
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            onError={(e) => {
                              console.error(
                                "Erro ao carregar imagem:",
                                image.src,
                              );
                              // Placeholder em caso de erro
                              (e.target as HTMLImageElement).src =
                                "/placeholder-gym.jpg";
                            }}
                          />

                          {/* Overlay gradiente */}
                          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60 opacity-60" />

                          {/* Overlay com informações */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-end bg-linear-to-t from-black/80 via-black/40 to-transparent p-6"
                          >
                            <div className="translate-y-4 transform space-y-2 transition-transform duration-300 ease-out group-hover:translate-y-0">
                              <motion.h3
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="font-oswald text-xl font-bold text-white md:text-2xl"
                              >
                                {image.alt}
                              </motion.h3>
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: "100px" }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="h-0.5 bg-[#C2A537]"
                              />
                              <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 0.9 }}
                                transition={{ delay: 0.4 }}
                                className="text-sm text-white/90 md:text-base"
                              >
                                Explore nosso estúdio
                              </motion.p>
                            </div>
                          </motion.div>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Controles do carrossel suaves e delicados */}
            <CarouselPrevious
              className="absolute top-1/2 left-1 z-20 hidden h-8 w-8 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 text-white/80 shadow-lg backdrop-blur-md transition-all duration-500 ease-out hover:border-[#C2A537]/60 hover:bg-[#C2A537]/20 hover:text-[#C2A537] hover:shadow-xl hover:shadow-[#C2A537]/25 focus:ring-2 focus:ring-[#C2A537]/50 focus:outline-none sm:left-2 sm:block sm:h-10 sm:w-10 md:left-4 lg:left-6"
              size={"sm"}
            />
            <CarouselNext
              className="absolute top-1/2 right-1 z-20 hidden h-8 w-8 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 text-white/80 shadow-lg backdrop-blur-md transition-all duration-500 ease-out hover:border-[#C2A537]/60 hover:bg-[#C2A537]/20 hover:text-[#C2A537] hover:shadow-xl hover:shadow-[#C2A537]/25 focus:ring-2 focus:ring-[#C2A537]/50 focus:outline-none sm:right-2 sm:block sm:h-10 sm:w-10 md:right-4 lg:right-6"
              size={"sm"}
            />

            {/* Indicadores de slide suaves */}
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 space-x-3">
              {carouselImages.map((_, index) => (
                <div
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-white/40 backdrop-blur-sm transition-all duration-700 hover:bg-[#C2A537]/80"
                  style={{
                    animationDelay: `${index * 200}ms`,
                    background: `linear-gradient(45deg, rgba(255,255,255,0.4), rgba(194,165,55,0.6))`,
                  }}
                ></div>
              ))}
            </div>
          </Carousel>
        </motion.div>
      </section>
    </motion.div>
  );
}

{
  /* 

        <div className="flex flex-col justify-center gap-4 text-center bg-bl">
          <h1>Bem-vindo ao JM Fitness Studio</h1>
          <p className="text-justify">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae
            perferendis magnam dignissimos totam exercitationem non voluptatum
            laboriosam corrupti fugiat, mollitia repellat optio quidem,
            reiciendis magni blanditiis error? Obcaecati, sapiente suscipit.
          </p>
        </div> */
}
