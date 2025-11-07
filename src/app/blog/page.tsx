import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedPostsAction } from "@/actions/public/blog-action";
import { Container } from "@/components/Container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Blog | JM Fitness Studio",
  description:
    "Descubra dicas de treino, nutrição e bem-estar no blog da JM Fitness Studio. Conteúdo especializado para você alcançar seus objetivos fitness.",
  keywords: [
    "blog fitness",
    "dicas de treino",
    "nutrição esportiva",
    "exercícios",
    "academia",
    "musculação",
  ],
  openGraph: {
    title: "Blog | JM Fitness Studio",
    description:
      "Descubra dicas de treino, nutrição e bem-estar no blog da JM Fitness Studio.",
    type: "website",
    locale: "pt_BR",
  },
};

export default async function BlogPage() {
  const posts = await getPublishedPostsAction();

  return (
    <div className="relative w-full bg-black text-white">
      {/* Degradê dourado discreto global */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[#C2A537]/5 to-transparent"></div>
      
      {/* Header compacto */}
      <section className="relative py-6 md:py-8">
        <Container noMinHeight={true}>
          <div className="relative z-10 text-center">
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">
              <span className="text-[#C2A537]">Blog</span> JM Fitness Studio
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-300 md:text-lg">
              Conteúdo exclusivo para maximizar seus resultados
            </p>
          </div>
        </Container>
      </section>

      {/* Posts Grid */}
      <section className="relative py-6 md:py-8">
        <Container noMinHeight={true}>
          <div className="relative z-10">
            {posts.length === 0 ? (
              <div className="py-12 text-center">
                <h2 className="mb-4 text-2xl font-bold text-slate-400">
                  Em breve, novos posts!
                </h2>
                <p className="text-slate-500">
                  Estamos preparando conteúdo incrível para você. Volte em
                  breve!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <div key={post.id} className="group">
                    <Link href={`/blog/${post.slug}`}>
                      <Card className="cursor-pointer border-gray-700 bg-black/50 backdrop-blur-sm transition-all duration-700 hover:border-[#C2A537] hover:shadow-xl hover:shadow-[#C2A537]/20">
                        <CardHeader className="pb-3 sm:pb-4">
                          <div className="mb-2 flex items-center justify-between sm:mb-3">
                            {post.category && (
                              <span
                                className="rounded-full px-2 py-1 text-xs font-medium sm:px-3"
                                style={{
                                  backgroundColor: `${post.category.color}20`,
                                  color: post.category.color,
                                }}
                              >
                                {post.category.name}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {post.readTime || 5} min de leitura
                            </span>
                          </div>

                          <div className="aspect-video overflow-hidden rounded-lg bg-gray-800">
                            {post.imageUrl ? (
                              <Image
                                src={post.imageUrl}
                                alt={post.title}
                                width={400}
                                height={225}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-800">
                                <span className="text-gray-500">
                                  Sem imagem
                                </span>
                              </div>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-[#C2A537]">
                            {post.title}
                          </h3>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <p className="leading-relaxed text-gray-300">
                            {post.excerpt}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#C2A537] transition-colors duration-200 group-hover:text-[#D4B547]">
                              Ler mais →
                            </span>
                            <div className="flex space-x-1">
                              <div className="h-1 w-1 rounded-full bg-[#C2A537]"></div>
                              <div className="h-1 w-1 rounded-full bg-[#C2A537]/60"></div>
                              <div className="h-1 w-1 rounded-full bg-[#C2A537]/30"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
