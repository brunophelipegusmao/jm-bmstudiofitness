import clsx from "clsx";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Container } from "../Container";
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
      src: "/banner-01.png",
      alt: "Ambiente da Academia",
      href: "/sobre",
    },
  ];

  return (
    <Container>
      <section className="relative flex min-h-[600px] w-full flex-col items-center justify-center">
        <Carousel
          opts={{
            align: "start",
          }}
          className="relative h-full w-full"
        >
          <CarouselContent className="h-full">
            {carouselImages.map((image, index) => (
              <CarouselItem key={index} className="h-full w-full">
                <div className="h-full p-4">
                  <Card className="m-0 h-[500px] w-auto border-0 bg-transparent p-0">
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
            className="top-1/2 -left-2 -translate-y-1/2 border-none bg-transparent font-semibold text-[#C2A537] shadow-none hover:bg-transparent hover:text-[#D4B547]"
            size={"default"}
          >
            &lt;
          </CarouselPrevious>
          <CarouselNext
            className="top-1/2 -right-2 -translate-y-1/2 border-none bg-transparent font-semibold text-[#C2A537] shadow-none hover:bg-transparent hover:text-[#D4B547]"
            size={"default"}
          >
            &gt;
          </CarouselNext>
        </Carousel>
      </section>
    </Container>
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
