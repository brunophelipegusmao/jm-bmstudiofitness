import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateFinancialDto {
  @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
  @IsString()
  userId: string;

  @IsNotEmpty({ message: 'Valor da mensalidade é obrigatório' })
  @IsNumber()
  @Min(0)
  monthlyFeeValue: number; // Em centavos

  @IsNotEmpty({ message: 'Dia de vencimento é obrigatório' })
  @IsNumber()
  @Min(1)
  @Max(31)
  dueDate: number;

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
