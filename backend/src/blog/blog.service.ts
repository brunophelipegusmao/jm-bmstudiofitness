import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { tbBlogCategories, tbBlogPosts, tbUsers } from '../database/schema';
import { eq, desc, and, isNull, ilike, or } from 'drizzle-orm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreatePostDto, UpdatePostDto, QueryPostsDto } from './dto/post.dto';

@Injectable()
export class BlogService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<any>,
  ) {}

  // ==================== CATEGORIES ====================

  async findAllCategories() {
    const categories = await this.db
      .select()
      .from(tbBlogCategories)
      .orderBy(tbBlogCategories.name);

    return categories;
  }

  async findCategory(id: string) {
    const [category] = await this.db
      .select()
      .from(tbBlogCategories)
      .where(eq(tbBlogCategories.id, id));

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async findCategoryBySlug(slug: string) {
    const [category] = await this.db
      .select()
      .from(tbBlogCategories)
      .where(eq(tbBlogCategories.slug, slug));

    return category || null;
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = this.generateSlug(dto.name);

    // Verifica se o slug já existe
    const existing = await this.findCategoryBySlug(slug);
    if (existing) {
      throw new ConflictException('Já existe uma categoria com este nome');
    }

    const [category] = await this.db
      .insert(tbBlogCategories)
      .values({
        name: dto.name,
        slug,
        description: dto.description || null,
      })
      .returning();

    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.findCategory(id);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      updateData.slug = this.generateSlug(dto.name);

      // Verifica se o novo slug já existe
      const existing = await this.findCategoryBySlug(updateData.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe uma categoria com este nome');
      }
    }

    if (dto.description !== undefined)
      updateData.description = dto.description || null;

    const [updated] = await this.db
      .update(tbBlogCategories)
      .set(updateData)
      .where(eq(tbBlogCategories.id, id))
      .returning();

    return updated;
  }

  async deleteCategory(id: string) {
    await this.findCategory(id);

    // Remove a referência dos posts
    await this.db
      .update(tbBlogPosts)
      .set({ categoryId: null })
      .where(eq(tbBlogPosts.categoryId, id));

    await this.db.delete(tbBlogCategories).where(eq(tbBlogCategories.id, id));

    return { message: 'Categoria excluída com sucesso' };
  }

  // ==================== POSTS ====================

  async findAllPosts(query: QueryPostsDto = {}) {
    const conditions: any[] = [];

    if (!query.includeDeleted) {
      conditions.push(isNull(tbBlogPosts.deletedAt));
    }

    if (query.publishedOnly) {
      conditions.push(eq(tbBlogPosts.isPublished, true));
    }

    if (query.categoryId) {
      conditions.push(eq(tbBlogPosts.categoryId, query.categoryId));
    }

    if (query.search) {
      conditions.push(
        or(
          ilike(tbBlogPosts.title, `%${query.search}%`),
          ilike(tbBlogPosts.excerpt, `%${query.search}%`),
        ),
      );
    }

    const posts = await this.db
      .select({
        id: tbBlogPosts.id,
        title: tbBlogPosts.title,
        slug: tbBlogPosts.slug,
        excerpt: tbBlogPosts.excerpt,
        coverImage: tbBlogPosts.coverImage,
        isPublished: tbBlogPosts.isPublished,
        publishedAt: tbBlogPosts.publishedAt,
        viewCount: tbBlogPosts.viewCount,
        createdAt: tbBlogPosts.createdAt,
        updatedAt: tbBlogPosts.updatedAt,
        category: {
          id: tbBlogCategories.id,
          name: tbBlogCategories.name,
          slug: tbBlogCategories.slug,
        },
        author: {
          id: tbUsers.id,
          name: tbUsers.name,
        },
      })
      .from(tbBlogPosts)
      .leftJoin(
        tbBlogCategories,
        eq(tbBlogPosts.categoryId, tbBlogCategories.id),
      )
      .innerJoin(tbUsers, eq(tbBlogPosts.authorId, tbUsers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tbBlogPosts.createdAt));

    return posts;
  }

  async findPost(id: string) {
    const [post] = await this.db
      .select({
        id: tbBlogPosts.id,
        title: tbBlogPosts.title,
        slug: tbBlogPosts.slug,
        excerpt: tbBlogPosts.excerpt,
        content: tbBlogPosts.content,
        coverImage: tbBlogPosts.coverImage,
        isPublished: tbBlogPosts.isPublished,
        publishedAt: tbBlogPosts.publishedAt,
        metaTitle: tbBlogPosts.metaTitle,
        metaDescription: tbBlogPosts.metaDescription,
        viewCount: tbBlogPosts.viewCount,
        deletedAt: tbBlogPosts.deletedAt,
        createdAt: tbBlogPosts.createdAt,
        updatedAt: tbBlogPosts.updatedAt,
        category: {
          id: tbBlogCategories.id,
          name: tbBlogCategories.name,
          slug: tbBlogCategories.slug,
        },
        author: {
          id: tbUsers.id,
          name: tbUsers.name,
        },
      })
      .from(tbBlogPosts)
      .leftJoin(
        tbBlogCategories,
        eq(tbBlogPosts.categoryId, tbBlogCategories.id),
      )
      .innerJoin(tbUsers, eq(tbBlogPosts.authorId, tbUsers.id))
      .where(eq(tbBlogPosts.id, id));

    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    return post;
  }

  async findPostBySlug(slug: string) {
    const [post] = await this.db
      .select({
        id: tbBlogPosts.id,
        title: tbBlogPosts.title,
        slug: tbBlogPosts.slug,
        excerpt: tbBlogPosts.excerpt,
        content: tbBlogPosts.content,
        coverImage: tbBlogPosts.coverImage,
        isPublished: tbBlogPosts.isPublished,
        publishedAt: tbBlogPosts.publishedAt,
        metaTitle: tbBlogPosts.metaTitle,
        metaDescription: tbBlogPosts.metaDescription,
        viewCount: tbBlogPosts.viewCount,
        createdAt: tbBlogPosts.createdAt,
        updatedAt: tbBlogPosts.updatedAt,
        category: {
          id: tbBlogCategories.id,
          name: tbBlogCategories.name,
          slug: tbBlogCategories.slug,
        },
        author: {
          id: tbUsers.id,
          name: tbUsers.name,
        },
      })
      .from(tbBlogPosts)
      .leftJoin(
        tbBlogCategories,
        eq(tbBlogPosts.categoryId, tbBlogCategories.id),
      )
      .innerJoin(tbUsers, eq(tbBlogPosts.authorId, tbUsers.id))
      .where(and(eq(tbBlogPosts.slug, slug), isNull(tbBlogPosts.deletedAt)));

    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    // Incrementa view count
    await this.db
      .update(tbBlogPosts)
      .set({ viewCount: post.viewCount + 1 })
      .where(eq(tbBlogPosts.id, post.id));

    return post;
  }

  async createPost(dto: CreatePostDto, authorId: string) {
    const slug = this.generateSlug(dto.title);

    // Garante slug único
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const [existing] = await this.db
        .select()
        .from(tbBlogPosts)
        .where(eq(tbBlogPosts.slug, finalSlug));
      if (!existing) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const [post] = await this.db
      .insert(tbBlogPosts)
      .values({
        title: dto.title,
        slug: finalSlug,
        excerpt: dto.excerpt || null,
        content: dto.content,
        coverImage: dto.coverImage || null,
        categoryId: dto.categoryId || null,
        authorId,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
        metaTitle: dto.metaTitle || dto.title,
        metaDescription: dto.metaDescription || dto.excerpt || null,
      })
      .returning();

    return post;
  }

  async updatePost(id: string, dto: UpdatePostDto) {
    const post = await this.findPost(id);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) {
      updateData.title = dto.title;
      // Gera novo slug se o título mudou
      const slug = this.generateSlug(dto.title);
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const [existing] = await this.db
          .select()
          .from(tbBlogPosts)
          .where(eq(tbBlogPosts.slug, finalSlug));
        if (!existing || existing.id === id) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
      updateData.slug = finalSlug;
    }

    if (dto.excerpt !== undefined) updateData.excerpt = dto.excerpt || null;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.coverImage !== undefined)
      updateData.coverImage = dto.coverImage || null;
    if (dto.categoryId !== undefined)
      updateData.categoryId = dto.categoryId || null;
    if (dto.metaTitle !== undefined)
      updateData.metaTitle = dto.metaTitle || null;
    if (dto.metaDescription !== undefined)
      updateData.metaDescription = dto.metaDescription || null;

    if (dto.isPublished !== undefined) {
      updateData.isPublished = dto.isPublished;
      if (dto.isPublished && !post.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const [updated] = await this.db
      .update(tbBlogPosts)
      .set(updateData)
      .where(eq(tbBlogPosts.id, id))
      .returning();

    return updated;
  }

  async softDeletePost(id: string) {
    await this.findPost(id);

    const [deleted] = await this.db
      .update(tbBlogPosts)
      .set({ deletedAt: new Date() })
      .where(eq(tbBlogPosts.id, id))
      .returning();

    return deleted;
  }

  async restorePost(id: string) {
    const [post] = await this.db
      .select()
      .from(tbBlogPosts)
      .where(eq(tbBlogPosts.id, id));

    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    const [restored] = await this.db
      .update(tbBlogPosts)
      .set({ deletedAt: null })
      .where(eq(tbBlogPosts.id, id))
      .returning();

    return restored;
  }

  async publishPost(id: string) {
    const post = await this.findPost(id);

    if (post.isPublished) {
      throw new ConflictException('Este post já está publicado');
    }

    const [published] = await this.db
      .update(tbBlogPosts)
      .set({
        isPublished: true,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tbBlogPosts.id, id))
      .returning();

    return published;
  }

  async unpublishPost(id: string) {
    const post = await this.findPost(id);

    if (!post.isPublished) {
      throw new ConflictException('Este post não está publicado');
    }

    const [unpublished] = await this.db
      .update(tbBlogPosts)
      .set({
        isPublished: false,
        updatedAt: new Date(),
      })
      .where(eq(tbBlogPosts.id, id))
      .returning();

    return unpublished;
  }

  // ==================== HELPERS ====================

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
