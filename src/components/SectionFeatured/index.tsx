"use client";

import clsx from "clsx";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { useRef } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { CoverImage } from "../CoverImage";

export default function SectionFeatured() {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  // Array com as diferentes imagens e informações
  const carouselImages = [
    {
      src: "/banner-01.png",
      alt: "Estúdio - Equipamentos de Musculação",
      href: "/equipamentos",
    },
    {
      src: "/banner-03.png", // substitua pelos nomes reais das suas imagens
      alt: "Aulas de Grupo - Fitness",
      href: "/aulas",
    },
    {
      src: "/banner-04.png",
      alt: "Personal Training",
      href: "/personal",
    },
    {
      src: "/banner-05.png",
      alt: "Nutrição Esportiva",
      href: "/nutricao",
    },
    {
      src: "/banner-06.png",
      alt: "Ambiente do Estúdio",
      href: "/sobre",
    },
  ];

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
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="mt-2 block text-4xl font-extrabold transition-transform sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
              >
                {/* JM com fonte diferente - imitando a logo */}
                <motion.span
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  viewport={{ once: true }}
                  className="font-anton bg-linear-to-r from-[#FFD700] via-[#C2A537] to-[#B8941F] bg-clip-text font-black tracking-tighter text-transparent"
                >
                  JM
                </motion.span>{" "}
                {/* Fitness Studio com Oswald - imitando a logo */}
                <motion.span
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  viewport={{ once: true }}
                  className="font-oswald bg-linear-to-r from-[#FFD700] via-[#C2A537] to-[#FFD700] bg-clip-text font-light tracking-wider text-transparent"
                >
                  Fitness Studio
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
              Transforme sua vida com{" "}
              <span className="font-semibold text-[#C2A537]">excelência</span> e{" "}
              <span className="font-semibold text-[#C2A537]">dedicação</span>
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
            }}
            className="animate-in slide-in-from-bottom relative h-full w-full max-w-full rounded-none shadow-2xl delay-1500 duration-1000 sm:rounded-2xl"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent className="h-full">
              {carouselImages.map((image, index) => (
                <CarouselItem key={index} className="h-full w-full">
                  <div className="h-full p-0 sm:p-1 md:p-2 lg:p-4">
                    <Card className="group m-0 h-[350px] w-full overflow-hidden rounded-none border-0 bg-transparent p-0 sm:h-[450px] sm:rounded-2xl md:h-[500px] lg:h-[550px]">
                      <CardContent className="flex h-full flex-col items-center justify-center p-0">
                        <CoverImage
                          imageProps={{
                            src: image.src,
                            alt: image.alt,
                            width: 1200,
                            height: 800,
                          }}
                          linkProps={{
                            href: image.href,
                            className:
                              "block h-full w-full relative overflow-hidden !rounded-none sm:!rounded-2xl",
                          }}
                        />
                        {/* Overlay com informações */}
                        <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/60 via-transparent to-transparent p-6 opacity-0 transition-all duration-500 group-hover:opacity-100">
                          <div className="text-white">
                            <h3 className="mb-2 text-xl font-bold">
                              {image.alt}
                            </h3>
                            <p className="text-sm opacity-90">
                              Explore nosso estúdio
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
