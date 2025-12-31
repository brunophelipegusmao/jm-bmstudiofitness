import { apiClient } from "@/lib/api-client";
import type { Post } from "@/types/posts";

const mapPost = (post: unknown): Post => {
  const p = post as Record<string, unknown>;
  const category = p.category as Record<string, unknown> | undefined;
  const author = p.author as Record<string, unknown> | undefined;

  return {
    id: p.id as string,
    title: p.title as string,
    excerpt: (p.excerpt as string) ?? "",
    content: (p.content as string) ?? "",
    imageUrl: (p.coverImage as string) ?? null,
    slug: p.slug as string,
    readTime: (p.readTime as number | null | undefined) ?? null,
    views: (p.viewCount as number | undefined) ?? 0,
    publishedAt: p.publishedAt ? new Date(p.publishedAt as string) : null,
    createdAt: p.createdAt ? new Date(p.createdAt as string) : undefined,
    updatedAt: p.updatedAt ? new Date(p.updatedAt as string) : undefined,
    published:
      (p.isPublished as boolean | undefined) ??
      (p.published as boolean | undefined) ??
      false,
    category: category
      ? {
          id: (category.id as string) ?? "",
          name: (category.name as string) ?? "",
          slug: category.slug as string,
          color: (category.color as string) ?? "#C2A537",
        }
      : null,
    tags: (p.tags as []) ?? [],
    metaTitle: (p.metaTitle as string) ?? null,
    metaDescription: (p.metaDescription as string) ?? null,
    status: p.isPublished ? "published" : "draft",
    authorId:
      (author?.id ? String(author.id) : undefined) ??
      (p.authorId as string | null | undefined) ??
      null,
  };
};

export async function getPublishedPostsAction(): Promise<Post[]> {
  const posts = await apiClient.get<unknown[]>("/blog/public/posts");
  return (posts || []).map(mapPost);
}

export async function getPublishedPostBySlugAction(
  slug: string,
): Promise<Post | null> {
  try {
    const post = await apiClient.get<unknown>(`/blog/public/posts/${slug}`);
    return post ? mapPost(post) : null;
  } catch {
    return null;
  }
}

// Backend ainda não expõe endpoint de views; retornamos success para manter UI funcional
export async function incrementPostViewsAction(
  _postId: string | number,
): Promise<{ success: boolean }> {
  // backend ainda nÃ£o expÃµe endpoint de views; mantendo interface
  void _postId;
  return { success: true };
}
