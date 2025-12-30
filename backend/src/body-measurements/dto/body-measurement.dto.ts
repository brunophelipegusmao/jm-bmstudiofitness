import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateBodyMeasurementDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  measurementDate: string;

  @IsString()
  @IsOptional()
  weight?: string;

  @IsString()
  @IsOptional()
  height?: string;

  @IsString()
  @IsOptional()
  bodyFatPercentage?: string;

  @IsString()
  @IsOptional()
  muscleMass?: string;

  @IsString()
  @IsOptional()
  chest?: string;

  @IsString()
  @IsOptional()
  waist?: string;

  @IsString()
  @IsOptional()
  hips?: string;

  @IsString()
  @IsOptional()
  leftArm?: string;

  @IsString()
  @IsOptional()
  rightArm?: string;

  @IsString()
  @IsOptional()
  leftThigh?: string;

  @IsString()
  @IsOptional()
  rightThigh?: string;

  @IsString()
  @IsOptional()
  leftCalf?: string;

  @IsString()
  @IsOptional()
  rightCalf?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBodyMeasurementDto {
  @IsString()
  @IsOptional()
  measurementDate?: string;

  @IsString()
  @IsOptional()
  weight?: string;

  @IsString()
  @IsOptional()
  height?: string;

  @IsString()
  @IsOptional()
  bodyFatPercentage?: string;

  @IsString()
  @IsOptional()
  muscleMass?: string;

  @IsString()
  @IsOptional()
  chest?: string;

  @IsString()
  @IsOptional()
  waist?: string;

  @IsString()
  @IsOptional()
  hips?: string;

  @IsString()
  @IsOptional()
  leftArm?: string;

  @IsString()
  @IsOptional()
  rightArm?: string;

  @IsString()
  @IsOptional()
  leftThigh?: string;

  @IsString()
  @IsOptional()
  rightThigh?: string;

  @IsString()
  @IsOptional()
  leftCalf?: string;

  @IsString()
  @IsOptional()
  rightCalf?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class QueryMeasurementsDto {
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}
