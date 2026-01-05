import {
  IsIn,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  // Permite login usando "login" (email ou CPF)
  @IsString()
  @IsOptional()
  login?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  // Permite ao MASTER escolher se quer logar como master ou como admin
  @IsString()
  @IsOptional()
  @IsIn(['master', 'admin'])
  mode?: 'master' | 'admin';
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @IsOptional()
  bornDate?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  role?: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string;

  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres' })
  newPassword: string;
}

export class ValidateResetTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string;
}
