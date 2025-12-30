import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  amountInCents: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsNotEmpty()
  expenseDate: string;

  @IsString()
  @IsOptional()
  receipt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amountInCents?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  expenseDate?: string;

  @IsString()
  @IsOptional()
  receipt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class QueryExpensesDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
