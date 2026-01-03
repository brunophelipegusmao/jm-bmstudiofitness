import { IsOptional, IsString } from 'class-validator';

export class CreateCheckInDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  checkInDate?: string; // ISO date

  @IsOptional()
  @IsString()
  checkInTime?: string; // HH:mm

  @IsOptional()
  @IsString()
  method?: string; // 'cpf' | 'email' | 'manual' | 'app'

  @IsOptional()
  @IsString()
  identifier?: string; // CPF ou email

  @IsOptional()
  @IsString()
  checkedInBy?: string; // ID de quem fez o check-in (funcionário/coach)
}
