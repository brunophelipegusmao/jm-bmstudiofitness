import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  IsEnum,
} from 'class-validator';

export enum WaitlistStatus {
  PENDING = 'pending',
  CONTACTED = 'contacted',
  CONVERTED = 'converted',
  CANCELLED = 'cancelled',
}

export class CreateWaitlistDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUUID()
  @IsOptional()
  interestPlanId?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateWaitlistDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUUID()
  @IsOptional()
  interestPlanId?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(WaitlistStatus)
  @IsOptional()
  status?: WaitlistStatus;
}

export class QueryWaitlistDto {
  @IsEnum(WaitlistStatus)
  @IsOptional()
  status?: WaitlistStatus;

  @IsUUID()
  @IsOptional()
  planId?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

export class ConvertWaitlistDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;
}
