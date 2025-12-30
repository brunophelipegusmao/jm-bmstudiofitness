import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
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
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePasswordDto {
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  newPassword: string;
}
