import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmployeeCheckInDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // CPF ou email

  @IsString()
  @IsOptional()
  method?: string; // 'cpf' | 'email' | 'manual'

  @IsString()
  @IsOptional()
  notes?: string;
}
