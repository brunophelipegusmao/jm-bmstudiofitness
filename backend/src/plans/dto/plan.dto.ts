import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  priceInCents: number;

  @IsNumber()
  @Min(1)
  durationInDays: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priceInCents?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  durationInDays?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class QueryPlansDto {
  @IsBoolean()
  @IsOptional()
  activeOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean;
}
