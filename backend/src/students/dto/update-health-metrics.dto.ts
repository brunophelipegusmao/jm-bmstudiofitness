import { IsBoolean,IsOptional, IsString } from 'class-validator';

export class UpdateHealthMetricsDto {
  @IsOptional()
  @IsString()
  heightCm?: string;

  @IsOptional()
  @IsString()
  weightKg?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsBoolean()
  hasPracticedSports?: boolean;

  @IsOptional()
  @IsString()
  lastExercise?: string;

  @IsOptional()
  @IsString()
  historyDiseases?: string;

  @IsOptional()
  @IsString()
  medications?: string;

  @IsOptional()
  @IsString()
  sportsHistory?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  injuries?: string;

  @IsOptional()
  @IsString()
  alimentalRoutine?: string;

  @IsOptional()
  @IsString()
  diaryRoutine?: string;

  @IsOptional()
  @IsBoolean()
  useSupplements?: boolean;

  @IsOptional()
  @IsString()
  whatSupplements?: string;

  @IsOptional()
  @IsString()
  otherNotes?: string;

  @IsOptional()
  @IsString()
  coachObservations?: string;

  @IsOptional()
  @IsString()
  coachObservationsParticular?: string;
}
