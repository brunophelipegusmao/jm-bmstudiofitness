import { apiClient } from "@/lib/api-client";
import type { Post } from "@/types/posts";

type CreatePostInput = {
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  published?: boolean;
  categoryId?: string | number;
  metaTitle?: string;
  metaDescription?: string;
};

type UpdatePostInput = Partial<CreatePostInput>;

const mapPost = (post: unknown): Post => {
  const p = post as Record<string, unknown>;
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
    published: (p.isPublished as boolean | undefined) ?? (p.published as boolean | undefined) ?? false,
    category: p.category
      ? (() => {
          const c = p.category as Record<string, unknown>;
          return {
            id: c.id as string,
            name: c.name as string,
            slug: c.slug as string,
            color: (c.color as string) ?? "#C2A537",
          };
        })()
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

const normalizePayload = (data: CreatePostInput | UpdatePostInput) => {
  const payload: Record<string, unknown> = {
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    coverImage: data.imageUrl,
    categoryId: data.categoryId ? String(data.categoryId) : undefined,
    isPublished: data.published,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });

  return payload;
};

export async function getPostsAction(params?: {
  search?: string;
  categoryId?: string | number;
  includeDeleted?: boolean;
  publishedOnly?: boolean;
}): Promise<Post[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.categoryId) query.set("categoryId", String(params.categoryId));
  if (params?.includeDeleted) query.set("includeDeleted", "true");
  if (params?.publishedOnly) query.set("publishedOnly", "true");

  const posts = await apiClient.get<unknown[]>(
    `/blog/posts${query.toString() ? `?${query.toString()}` : ""}`,
  );
  return (posts || []).map(mapPost);
}

export async function createPostAction(data: CreatePostInput): Promise<Post> {
  const payload = normalizePayload(data);
  const post = await apiClient.post<unknown>("/blog/posts", payload);
  return mapPost(Array.isArray(post) ? post[0] : post);
}

export async function updatePostAction(
  id: string | number,
  data: UpdatePostInput,
): Promise<Post> {
  const payload = normalizePayload(data);
  const post = await apiClient.patch<unknown>(`/blog/posts/${id}`, payload);
  return mapPost(Array.isArray(post) ? post[0] : post);
}

export async function deletePostAction(
  id: string | number,
): Promise<{ success: boolean }> {
  await apiClient.delete(`/blog/posts/${id}`);
  return { success: true };
}
