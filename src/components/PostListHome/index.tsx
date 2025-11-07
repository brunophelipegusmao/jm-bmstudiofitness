"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getPublishedPostsAction } from "@/actions/public/blog-action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Post {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  slug: string;
  readTime: number | null;
  views: number;
  publishedAt: Date;
  category: {
    id: number;
    name: string;
    color: string;
    slug: string;
  } | null;
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
}

export default function PostListHome() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const fetchedPosts = await getPublishedPostsAction();
        // Mostrar apenas os primeiros 6 posts
        setPosts(fetchedPosts.slice(0, 6));
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);
  // Variantes de animação para o container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  // Variantes de animação para cada card
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
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="relative w-full bg-black py-12 sm:py-16 md:py-20"
    >
      {/* Degradê dourado discreto */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[#C2A537]/5 to-transparent"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Título da seção */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-8 text-center sm:mb-12 md:mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-3 text-3xl font-bold text-[#C2A537] sm:mb-4 sm:text-4xl"
          >
            Blog & Dicas
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-base text-gray-300 sm:text-lg"
          >
            Conteúdo exclusivo para maximizar seus resultados
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3"
        >
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div key={index} variants={cardVariants} className="group">
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
            ))
          ) : posts.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-gray-400">Nenhum post encontrado</p>
            </div>
          ) : (
            posts.map((post) => (
              <motion.div
                key={post.id}
                variants={cardVariants}
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
            ))
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-8 text-center sm:mt-10 md:mt-12"
        >
          <Link href="/blog">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg bg-[#C2A537] px-6 py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-[#D4B547] focus:ring-2 focus:ring-[#C2A537] focus:ring-offset-2 focus:ring-offset-black focus:outline-none sm:px-8 sm:py-3 sm:text-base"
            >
              Ver Todos os Posts
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
