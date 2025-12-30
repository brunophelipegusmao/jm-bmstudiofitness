// Tipos relacionados a posts e blog

export interface PostCategory {
  id: number;
  name: string;
  color: string;
  slug: string;
}

export interface PostTag {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  imageUrl: string | null;
  slug: string;
  readTime: number | null;
  views: number;
  publishedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  category: PostCategory | null;
  tags: PostTag[];
  metaTitle?: string;
  metaDescription?: string;
  status?: "draft" | "published";
  authorId?: number;
}

export interface PostListItem {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  slug: string;
  readTime: number | null;
  views: number;
  publishedAt: Date;
  category: PostCategory | null;
  tags: PostTag[];
}
