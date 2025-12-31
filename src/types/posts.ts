// Tipos relacionados a posts e blog

export interface PostCategory {
  id: string;
  name: string;
  color?: string;
  slug: string;
}

export interface PostTag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
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
  published?: boolean;
  category: PostCategory | null;
  tags: PostTag[];
  metaTitle?: string;
  metaDescription?: string;
  status?: "draft" | "published";
  authorId?: string | null;
}

export interface PostListItem {
  id: string;
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
