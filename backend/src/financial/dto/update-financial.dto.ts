import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateFinancialDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyFeeValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  dueDate?: number;

  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  lastPaymentDate?: string;
}

export class MarkAsPaidDto {
  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  paymentDate?: string; // ISO date string
}
