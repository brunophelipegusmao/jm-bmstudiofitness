import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;
}

export class QueryPostsDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  publishedOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}
