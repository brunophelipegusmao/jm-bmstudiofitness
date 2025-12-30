import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class QueryFinancialDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  paid?: boolean;

  @IsOptional()
  @IsString()
  startDate?: string; // ISO date

  @IsOptional()
  @IsString()
  endDate?: string; // ISO date

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
