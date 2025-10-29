import clsx from "clsx";

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
  // Array com as diferentes imagens e informações
  const carouselImages = [
    {
      src: "/banner-01.png",
      alt: "Academia - Equipamentos de Musculação",
      href: "/equipamentos",
    },
    {
      src: "/banner-02.png", // substitua pelos nomes reais das suas imagens
      alt: "Aulas de Grupo - Fitness",
      href: "/aulas",
    },
    {
      src: "/banner-01.png",
      alt: "Personal Training",
      href: "/personal",
    },
    {
      src: "/banner-02.png",
      alt: "Nutrição Esportiva",
      href: "/nutricao",
    },
    {
      src: "/banner-1.png",
      alt: "Ambiente da Academia",
      href: "/sobre",
    },
  ];

  return (
    <div
      className={clsx(
        "flex w-full items-center justify-center",
        "max-h-[600px] min-h-[400px] sm:min-h-[500px] md:min-h-[600px]",
      )}
    >
      <section className="relative flex w-full max-w-[350px] flex-col items-center justify-center px-2 sm:max-w-[600px] sm:px-4 md:max-w-[800px] lg:max-w-[900px]">
        <h1 className="py-6 text-5xl font-semibold text-[#C2A537] blur-[#c2a537] drop-shadow-md sm:text-2xl sm:text-center md:text-5xl">
          Bem-vindo ao JM Studio Fitness
        </h1>
        <Carousel
          opts={{
            align: "start",
          }}
          className="relative h-full w-full max-w-full"
        >
          <CarouselContent className="h-full">
            {carouselImages.map((image, index) => (
              <CarouselItem key={index} className="h-full w-full">
                <div className="h-full p-1 sm:p-2 md:p-4">
                  <Card className="m-0 h-[300px] w-full border-0 bg-transparent p-0 sm:h-[400px] md:h-[500px]">
                    <CardContent className="flex h-full flex-col items-center justify-center">
                      <CoverImage
                        imageProps={{
                          src: image.src,
                          alt: image.alt,
                          width: 800,
                          height: 600,
                        }}
                        linkProps={{
                          href: image.href,
                          className: "block h-full w-full",
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            className="top-1/2 -left-1 -translate-y-1/2 border-none bg-transparent text-sm font-semibold text-[#C2A537] shadow-none hover:bg-transparent hover:text-[#D4B547] sm:-left-2 sm:text-base md:text-lg"
            size={"default"}
          >
            &lt;
          </CarouselPrevious>
          <CarouselNext
            className="top-1/2 -right-1 -translate-y-1/2 border-none bg-transparent text-sm font-semibold text-[#C2A537] shadow-none hover:bg-transparent hover:text-[#D4B547] sm:-right-2 sm:text-base md:text-lg"
            size={"default"}
          >
            &gt;
          </CarouselNext>
        </Carousel>
      </section>
    </div>
  );
}

{
  /* 

        <div className="flex flex-col justify-center gap-4 text-center bg-bl">
          <h1>Bem-vindo ao JM Studio Fitness</h1>
          <p className="text-justify">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae
            perferendis magnam dignissimos totam exercitationem non voluptatum
            laboriosam corrupti fugiat, mollitia repellat optio quidem,
            reiciendis magni blanditiis error? Obcaecati, sapiente suscipit.
          </p>
        </div> */
}
