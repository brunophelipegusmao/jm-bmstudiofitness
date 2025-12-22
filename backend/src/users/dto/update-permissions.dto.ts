import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEmployeePermissionsDto {
  @IsOptional()
  @IsBoolean()
  canViewFinancial?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditFinancial?: boolean;

  @IsOptional()
  @IsBoolean()
  canDeleteFinancial?: boolean;

  @IsOptional()
  @IsBoolean()
  canManageCheckIns?: boolean;

  @IsOptional()
  @IsBoolean()
  canViewStudents?: boolean;
}

export class UpdateStudentPermissionsDto {
  @IsOptional()
  @IsBoolean()
  canEditHeight?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditWeight?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditBloodType?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditMedications?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditAllergies?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditInjuries?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditRoutine?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditSupplements?: boolean;
}
