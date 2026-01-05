"use client";

import clsx from "clsx";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { PublicSettings } from "@/actions/get-public-settings-action";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Função simples para validar URL de imagem
const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === "") return false;
  try {
    const urlObj = new URL(url.trim());
    const pathname = urlObj.pathname.toLowerCase();
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
    ];
    return pathname.startsWith("/") || validExtensions.some((ext) => pathname.endsWith(ext));
  } catch {
    return url.trim().startsWith("/");
  }
};

// Imagens padrão do carrossel
type CarouselImage = {
  src: string;
  alt: string;
  href: string;
  loading: "eager" | "lazy";
  priority?: boolean;
};

const DEFAULT_CAROUSEL_IMAGES: CarouselImage[] = [
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

type SectionFeaturedProps = {
  settings?: PublicSettings;
};

export default function SectionFeatured({ settings }: SectionFeaturedProps) {
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

  const [carouselImages, setCarouselImages] =
    useState<CarouselImage[]>(DEFAULT_CAROUSEL_IMAGES);

  useEffect(() => {
    if (!settings) return;

    if (settings.carouselEnabled === false) {
      setCarouselImages([]);
      return;
    }

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

    if (images.length >= 3) {
      setCarouselImages(images);
    } else {
      setCarouselImages(DEFAULT_CAROUSEL_IMAGES);
    }
  }, [settings]);

  if (carouselImages.length === 0) {
    return null;
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
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/50"></div>

      <section className="relative z-10 flex w-full flex-col items-center justify-center">
        <div className="w-full max-w-[350px] px-6 sm:max-w-[700px] sm:px-8 md:max-w-[900px] md:px-12 lg:max-w-[1200px] lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative mb-8 text-center"
          >
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
              Treinos personalizáveis para sua jornada
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl text-base text-slate-200 sm:text-lg md:text-xl"
            >
              Estrutura completa, acompanhamento profissional e uma comunidade que inspira você a alcançar seus objetivos.
            </motion.p>
          </motion.div>
        </div>

        <div className="w-full max-w-[350px] px-4 sm:max-w-[700px] sm:px-6 md:max-w-[900px] md:px-10 lg:max-w-[1200px] lg:px-14">
          <Carousel
            className="w-full"
            plugins={[plugin.current]}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2 sm:-ml-4">
              {carouselImages.map((item, index) => (
                <CarouselItem
                  key={item.src + index}
                  className="basis-full pl-2 sm:pl-4"
                >
                  <Link href={item.href}>
                    <Card className="group overflow-hidden border border-[#C2A537]/20 bg-gradient-to-br from-black/80 via-slate-900/80 to-black/90 shadow-2xl shadow-[#C2A537]/15 transition-all duration-500 hover:-translate-y-2 hover:border-[#C2A537]/40 hover:shadow-[#C2A537]/30">
                      <CardContent className="p-0">
                        <div className="relative h-[260px] w-full overflow-hidden sm:h-[340px] md:h-[420px]">
                          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            sizes="100vw"
                            loading={item.loading || "lazy"}
                            className="object-cover transition duration-700 group-hover:scale-105"
                            priority={item.priority}
                          />
                          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/70 p-3 backdrop-blur-sm transition duration-500 group-hover:bg-black/80">
                            <p className="text-lg font-semibold text-white drop-shadow">
                              {item.alt}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-[#C2A537]/50 bg-black/60 text-[#C2A537] hover:bg-[#C2A537]/10" />
            <CarouselNext className="border-[#C2A537]/50 bg-black/60 text-[#C2A537] hover:bg-[#C2A537]/10" />
          </Carousel>
        </div>
      </section>
    </motion.div>
  );
}
