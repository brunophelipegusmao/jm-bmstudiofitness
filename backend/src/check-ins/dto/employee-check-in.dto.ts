import { IsOptional, IsString } from 'class-validator';

export class EmployeeCheckInDto {
  @IsString()
  @IsOptional()
  identifier?: string; // CPF ou email

  @IsString()
  @IsOptional()
  method?: string; // 'cpf' | 'email' | 'manual'

  @IsString()
  @IsOptional()
  notes?: string;
}
