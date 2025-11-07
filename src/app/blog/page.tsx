import { ArrowRight, Calendar, Clock, Eye, Tag } from "lucide-react";
import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPublishedPostsAction } from "@/actions/public/blog-action";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-black text-white">
      {/* Header compacto */}
      <section className="relative bg-black py-8 md:py-12">
        <Container>
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              <span className="text-[#C2A537]">Blog</span> JM Fitness Studio
            </h1>
            <p className="mx-auto max-w-2xl text-base text-slate-300 md:text-lg">
              Descubra dicas de treino, nutrição e bem-estar para alcançar seus
              objetivos fitness
            </p>
          </div>
        </Container>
      </section>

      {/* Posts Grid */}
      <section className="py-8 md:py-12">
        <Container>
          {posts.length === 0 ? (
            <div className="py-12 text-center">
              <h2 className="mb-4 text-2xl font-bold text-slate-400">
                Em breve, novos posts!
              </h2>
              <p className="text-slate-500">
                Estamos preparando conteúdo incrível para você. Volte em breve!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="group overflow-hidden border-slate-700/50 bg-slate-900/50 transition-all duration-300 hover:border-[#C2A537]/50"
                >
                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={400}
                        height={160}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />

                      {/* Category Badge */}
                      {post.category && (
                        <div
                          className="absolute top-3 left-3 rounded-full px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: post.category.color,
                            color: "#000",
                          }}
                        >
                          {post.category.name}
                        </div>
                      )}
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="mb-2 flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString(
                              "pt-BR",
                            )
                          : "Data não disponível"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views}
                      </div>
                    </div>

                    <h3 className="line-clamp-2 text-lg font-bold text-white transition-colors duration-300 group-hover:text-[#C2A537]">
                      {post.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="mb-3 line-clamp-2 text-sm text-slate-300">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {post.tags
                          .slice(0, 2)
                          .map(
                            (tag: {
                              id: number;
                              name: string;
                              slug: string;
                            }) => (
                              <span
                                key={tag.id}
                                className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs text-slate-300"
                              >
                                <Tag className="h-2 w-2" />
                                {tag.name}
                              </span>
                            ),
                          )}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-slate-500">
                            +{post.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <Link href={`/blog/${post.slug}`}>
                      <Button 
                        size="sm"
                        className="w-full bg-[#C2A537] text-black transition-all duration-300 hover:bg-[#D4B547] hover:text-black"
                      >
                        Ler post completo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
