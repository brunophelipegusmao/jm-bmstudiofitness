import { ArrowLeft, Calendar, Clock, Eye, Tag, User } from "lucide-react";
import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getPublishedPostBySlugAction,
  incrementPostViewsAction,
} from "@/actions/public/blog-action";
import { Container } from "@/components/Container";
import ShareButton from "@/components/ShareButton";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getPublishedPostBySlugAction(slug);

    if (!post) {
      return {
        title: "Post não encontrado | JM Fitness Studio",
      };
    }

    return {
      title: post.metaTitle || `${post.title} | JM Fitness Studio`,
      description: post.metaDescription || post.excerpt,
      keywords: post.tags?.map((tag) => tag.name) || [],
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        type: "article",
        locale: "pt_BR",
        publishedTime: post.publishedAt?.toISOString(),
        authors: ["JM Fitness Studio"],
        images: post.imageUrl ? [post.imageUrl] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        images: post.imageUrl ? [post.imageUrl] : [],
      },
    };
  } catch {
    return {
      title: "Post não encontrado | JM Fitness Studio",
    };
  }
}

export default async function PostPage({ params }: Props) {
  try {
    const { slug } = await params;
    const post = await getPublishedPostBySlugAction(slug);

    if (!post) {
      notFound();
    }

    // Increment view count
    await incrementPostViewsAction(post.id);

    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <section className="border-b border-slate-800 py-8">
          <Container>
            <Link href="/blog">
              <Button className="bg-[#C2A537] text-black transition-all duration-300 hover:bg-[#D4B547] hover:text-black">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao blog
              </Button>
            </Link>
          </Container>
        </section>

        {/* Hero Section */}
        <section className="py-16">
          <Container>
            <div className="mx-auto max-w-4xl">
              {/* Category */}
              {post.category && (
                <div className="mb-6">
                  <span
                    className="inline-block rounded-full px-4 py-2 text-sm font-medium"
                    style={{
                      backgroundColor: post.category.color,
                      color: "#000",
                    }}
                  >
                    {post.category.name}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="mb-8 flex flex-wrap items-center gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>JM Fitness Studio</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Data não disponível"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime || 5} min de leitura</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{post.views + 1} visualizações</span>
                </div>
              </div>

              {/* Share Button */}
              <div className="mb-8">
                <ShareButton title={post.title} excerpt={post.excerpt} />
              </div>

              {/* Featured Image */}
              {post.imageUrl && (
                <div className="mb-12">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={800}
                    height={400}
                    className="h-auto w-full rounded-lg"
                    priority
                  />
                </div>
              )}

              {/* Excerpt */}
              <div className="mb-12 rounded-lg border-l-4 border-[#C2A537] bg-slate-900/50 p-6 text-xl text-slate-300">
                {post.excerpt}
              </div>
            </div>
          </Container>
        </section>

        {/* Content */}
        <section className="pb-16">
          <Container>
            <div className="mx-auto max-w-4xl">
              <div
                className="prose prose-lg prose-invert prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-a:text-[#C2A537] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[#C2A537] prose-blockquote:text-slate-300 max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </Container>
        </section>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <section className="border-t border-slate-800 py-8">
            <Container>
              <div className="mx-auto max-w-4xl">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Tag className="h-5 w-5 text-[#C2A537]" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-3">
                  {post.tags.map(
                    (tag: { id: number; name: string; slug: string }) => (
                      <span
                        key={tag.id}
                        className="cursor-pointer rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700"
                      >
                        #{tag.name}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </Container>
          </section>
        )}

        {/* Related Posts CTA */}
        <section className="bg-slate-900/30 py-16">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <h3 className="mb-4 text-2xl font-bold">Gostou deste post?</h3>
              <p className="mb-8 text-slate-400">
                Confira outros artigos em nosso blog e fique por dentro das
                melhores dicas de fitness!
              </p>
              <Link href="/blog">
                <Button className="bg-[#C2A537] text-black hover:bg-[#D4B547]">
                  Ver mais posts
                </Button>
              </Link>
            </div>
          </Container>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Error loading post:", error);
    notFound();
  }
}
