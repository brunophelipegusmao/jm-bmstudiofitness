"use server";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";

export async function createPostAction(data: {
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  published: boolean;
  categoryId?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags?: string[];
}) {
  try {
    // Verificar se o usuário é admin
    await requireAdmin();

    // Gerar slug a partir do título
    const slug = data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Calcular tempo de leitura (média de 200 palavras por minuto)
    const wordCount = data.content.split(/\s+/).length;
    const readTime = Math.max(1, Math.round(wordCount / 200));

    const newPost = await db
      .insert(posts)
      .values({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        imageUrl: data.imageUrl,
        published: data.published,
        authorId: 1, // TODO: usar o ID do usuário logado
        categoryId: data.categoryId,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.excerpt,
        metaKeywords: data.metaKeywords,
        slug: slug,
        readTime: readTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Se há tags, criar relacionamentos
    if (data.tags && data.tags.length > 0) {
      // TODO: Implementar criação de tags e relacionamentos
      // Deixando para próxima implementação
    }

    return newPost[0];
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
}

export async function updatePostAction(
  id: number,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    imageUrl?: string;
    published?: boolean;
    categoryId?: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  },
) {
  try {
    // Verificar se o usuário é admin
    await requireAdmin();

    const updateData: Record<
      string,
      string | number | boolean | Date | undefined
    > = {
      ...data,
      updatedAt: new Date(),
    };

    // Se o título foi alterado, regenerar o slug
    if (data.title) {
      updateData.slug = data.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    // Se o conteúdo foi alterado, recalcular tempo de leitura
    if (data.content) {
      const wordCount = data.content.split(/\s+/).length;
      updateData.readTime = Math.max(1, Math.round(wordCount / 200));
    }

    const updatedPost = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    return updatedPost[0];
  } catch (error) {
    console.error("Error updating post:", error);
    throw new Error("Failed to update post");
  }
}

export async function deletePostAction(id: number) {
  try {
    // Verificar se o usuário é admin
    await requireAdmin();

    await db.delete(posts).where(eq(posts.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    throw new Error("Failed to delete post");
  }
}

export async function getPostsAction() {
  try {
    // Verificar se o usuário é admin para acessar a interface administrativa
    await requireAdmin();

    const allPosts = await db.select().from(posts);
    return allPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Failed to fetch posts");
  }
}

export async function getPostBySlugAction(slug: string) {
  try {
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);

    return post[0] || null;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    throw new Error("Failed to fetch post");
  }
}

export async function updatePostViewsAction(id: number) {
  try {
    // Primeiro buscar o post atual
    const currentPost = await db
      .select({ views: posts.views })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (currentPost.length === 0) {
      throw new Error("Post not found");
    }

    // Atualizar com o valor incrementado
    await db
      .update(posts)
      .set({
        views: currentPost[0].views + 1,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));
  } catch (error) {
    console.error("Error updating post views:", error);
    throw new Error("Failed to update post views");
  }
}
