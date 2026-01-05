import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Length,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  bornDate?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  sex?: string;

  @IsOptional()
  @IsString()
  userRole?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Campos financeiros de alunos (permitir edição no endpoint /users/:id)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2147483647)
  monthlyFeeValueInCents?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsInt()
  dueDate?: number;
}

export class UpdatePasswordDto {
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  newPassword: string;
}
