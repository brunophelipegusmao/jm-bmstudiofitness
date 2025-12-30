import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTimeRecordDto {
  @IsString()
  @IsNotEmpty({ message: 'ID do funcionário é obrigatório' })
  employeeId: string;

  @IsString()
  @IsNotEmpty({ message: 'Data é obrigatória' })
  date: string;

  @IsOptional()
  @IsString()
  checkInTime?: string;

  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTimeRecordDto {
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}

export class QueryTimeRecordsDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  approved?: string; // 'true' ou 'false'
}
