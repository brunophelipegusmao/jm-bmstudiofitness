import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../database/schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreatePostDto, UpdatePostDto, QueryPostsDto } from './dto/post.dto';

@Controller('blog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Public()
  @Get('public/posts')
  async findPublicPosts(@Query() query: QueryPostsDto) {
    return this.blogService.findAllPosts({ ...query, publishedOnly: true });
  }

  @Public()
  @Get('public/posts/:slug')
  async findPublicPostBySlug(@Param('slug') slug: string) {
    return this.blogService.findPostBySlug(slug);
  }

  @Public()
  @Get('public/categories')
  async findPublicCategories() {
    return this.blogService.findAllCategories();
  }

  // ==================== CATEGORY ENDPOINTS ====================

  @Get('categories')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findAllCategories() {
    return this.blogService.findAllCategories();
  }

  @Get('categories/:id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findCategory(@Param('id') id: string) {
    return this.blogService.findCategory(id);
  }

  @Post('categories')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.blogService.createCategory(dto);
  }

  @Patch('categories/:id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.blogService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async deleteCategory(@Param('id') id: string) {
    return this.blogService.deleteCategory(id);
  }

  // ==================== POST ENDPOINTS ====================

  @Get('posts')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findAllPosts(@Query() query: QueryPostsDto) {
    return this.blogService.findAllPosts(query);
  }

  @Get('posts/:id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findPost(@Param('id') id: string) {
    return this.blogService.findPost(id);
  }

  @Post('posts')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async createPost(@Body() dto: CreatePostDto, @Request() req: any) {
    return this.blogService.createPost(dto, req.user.id);
  }

  @Patch('posts/:id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async updatePost(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.blogService.updatePost(id, dto);
  }

  @Delete('posts/:id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async softDeletePost(@Param('id') id: string) {
    return this.blogService.softDeletePost(id);
  }

  @Post('posts/:id/restore')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async restorePost(@Param('id') id: string) {
    return this.blogService.restorePost(id);
  }

  @Post('posts/:id/publish')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async publishPost(@Param('id') id: string) {
    return this.blogService.publishPost(id);
  }

  @Post('posts/:id/unpublish')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async unpublishPost(@Param('id') id: string) {
    return this.blogService.unpublishPost(id);
  }
}
