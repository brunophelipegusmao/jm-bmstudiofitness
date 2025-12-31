"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getPublishedPostsAction } from "@/actions/public/blog-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Post } from "@/types/posts";

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        console.log("🔍 Buscando posts publicados...");
        const fetchedPosts = await getPublishedPostsAction();
        console.log("✅ Posts encontrados:", fetchedPosts.length);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("❌ Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  // Variantes de animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-linear-to-b from-black via-slate-900 to-black py-20"
      >
        {/* Degradê de fundo */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[#C2A537]/5 to-transparent"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Botão Voltar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Link href="/">
              <Button
                variant="outline"
                className="border-[#C2A537]/30 bg-black/50 text-[#C2A537] backdrop-blur-sm hover:border-[#C2A537] hover:bg-[#C2A537]/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Home
              </Button>
            </Link>
          </motion.div>

          {/* Título */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6 text-4xl font-bold md:text-6xl"
            >
              <span className="text-[#C2A537]">Blog</span> JM Fitness Studio
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mx-auto max-w-3xl text-xl text-slate-300"
            >
              Descubra dicas de treino, nutrição e bem-estar para alcançar seus
              objetivos fitness
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Posts Grid */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
        className="relative w-full bg-black py-12 sm:py-16 md:py-20"
      >
        {/* Degradê dourado discreto */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[#C2A537]/5 to-transparent"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  className="group"
                >
                  <Card className="border-gray-700 bg-black/50 backdrop-blur-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="mb-2 flex items-center justify-between sm:mb-3">
                        <div className="h-6 w-16 animate-pulse rounded-full bg-gray-700"></div>
                        <div className="h-4 w-12 animate-pulse rounded bg-gray-700"></div>
                      </div>
                      <div className="aspect-video animate-pulse rounded-lg bg-gray-700"></div>
                      <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-gray-700"></div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-700"></div>
                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-700"></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="mb-4 text-2xl font-bold text-slate-400">
                  Nenhum post encontrado
                </h2>
                <p className="mb-6 text-slate-500">
                  Não há posts publicados no momento. Execute o seed do banco de
                  dados para criar posts de exemplo.
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                    transition: { duration: 0.3 },
                  }}
                  whileTap={{
                    scale: 0.98,
                    transition: { duration: 0.1 },
                  }}
                  className="group"
                >
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
                              <span className="text-gray-500">Sem imagem</span>
                            </div>
                          )}
                        </div>

                        <CardTitle className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-[#C2A537]">
                          {post.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <CardDescription className="leading-relaxed text-gray-300">
                          {post.excerpt}
                        </CardDescription>

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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}
