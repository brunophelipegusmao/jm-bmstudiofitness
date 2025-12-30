import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'Cargo é obrigatório' })
  position: string;

  @IsString()
  @IsNotEmpty({ message: 'Turno é obrigatório' })
  shift: string; // 'manha', 'tarde', 'noite', 'integral'

  @IsString()
  @IsNotEmpty({ message: 'Horário de início é obrigatório' })
  shiftStartTime: string;

  @IsString()
  @IsNotEmpty({ message: 'Horário de fim é obrigatório' })
  shiftEndTime: string;

  @IsInt()
  @Min(0)
  salaryInCents: number;

  @IsString()
  @IsNotEmpty({ message: 'Data de contratação é obrigatória' })
  hireDate: string;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  shiftStartTime?: string;

  @IsOptional()
  @IsString()
  shiftEndTime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryInCents?: number;

  @IsOptional()
  @IsString()
  hireDate?: string;

  @IsOptional()
  @IsString()
  salaryChangeReason?: string;
}

export class QueryEmployeesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  includeDeleted?: string; // 'true' ou 'false'
}
