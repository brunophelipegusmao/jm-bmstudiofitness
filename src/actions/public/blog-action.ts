"use server";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { categories, posts, postTags, tags } from "@/db/schema";

// Função pública para obter posts publicados (sem verificação de admin)
export async function getPublishedPostsAction() {
  try {
    const publishedPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        excerpt: posts.excerpt,
        imageUrl: posts.imageUrl,
        published: posts.published,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        metaTitle: posts.metaTitle,
        metaDescription: posts.metaDescription,
        slug: posts.slug,
        readTime: posts.readTime,
        views: posts.views,
        publishedAt: posts.createdAt, // Usando createdAt como publishedAt
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          slug: categories.slug,
        },
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt));

    // Buscar tags para cada post
    const postsWithTags = await Promise.all(
      publishedPosts.map(async (post) => {
        const postTagsData = await db
          .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
          })
          .from(postTags)
          .innerJoin(tags, eq(postTags.tagId, tags.id))
          .where(eq(postTags.postId, post.id));

        return {
          ...post,
          tags: postTagsData,
        };
      }),
    );

    return postsWithTags;
  } catch (error) {
    console.error("Error fetching published posts:", error);
    throw new Error("Failed to fetch published posts");
  }
}

// Função pública para obter um post específico pelo slug (sem verificação de admin)
export async function getPublishedPostBySlugAction(slug: string) {
  try {
    const post = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        excerpt: posts.excerpt,
        imageUrl: posts.imageUrl,
        published: posts.published,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        metaTitle: posts.metaTitle,
        metaDescription: posts.metaDescription,
        slug: posts.slug,
        readTime: posts.readTime,
        views: posts.views,
        publishedAt: posts.createdAt, // Usando createdAt como publishedAt
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          slug: categories.slug,
        },
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.slug, slug))
      .limit(1);

    const foundPost = post[0];

    // Verificar se o post existe e está publicado
    if (!foundPost || !foundPost.published) {
      return null;
    }

    // Buscar tags do post
    const postTagsData = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, foundPost.id));

    return {
      ...foundPost,
      tags: postTagsData,
    };
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    throw new Error("Failed to fetch post");
  }
}

// Função pública para incrementar visualizações de um post
export async function incrementPostViewsAction(id: number) {
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
    // Não lançar erro para não quebrar a visualização do post
  }
}
