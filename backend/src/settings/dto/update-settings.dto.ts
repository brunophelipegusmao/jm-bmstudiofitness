import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  // Informações básicas
  @IsOptional()
  @IsString()
  studioName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  // Horários de funcionamento
  @IsOptional()
  @IsString()
  mondayOpen?: string;

  @IsOptional()
  @IsString()
  mondayClose?: string;

  @IsOptional()
  @IsString()
  tuesdayOpen?: string;

  @IsOptional()
  @IsString()
  tuesdayClose?: string;

  @IsOptional()
  @IsString()
  wednesdayOpen?: string;

  @IsOptional()
  @IsString()
  wednesdayClose?: string;

  @IsOptional()
  @IsString()
  thursdayOpen?: string;

  @IsOptional()
  @IsString()
  thursdayClose?: string;

  @IsOptional()
  @IsString()
  fridayOpen?: string;

  @IsOptional()
  @IsString()
  fridayClose?: string;

  @IsOptional()
  @IsString()
  saturdayOpen?: string;

  @IsOptional()
  @IsString()
  saturdayClose?: string;

  @IsOptional()
  @IsString()
  sundayOpen?: string;

  @IsOptional()
  @IsString()
  sundayClose?: string;

  // Valores e planos (em centavos)
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyFeeDefault?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  registrationFee?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  personalTrainingHourlyRate?: number;

  // Políticas
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  paymentDueDateDefault?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  gracePeriodDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxCheckInsPerDay?: number;

  @IsOptional()
  @IsBoolean()
  allowWeekendCheckIn?: boolean;

  // Lista de Espera
  @IsOptional()
  @IsBoolean()
  waitlistEnabled?: boolean;

  // Modo Manutenção
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsString()
  maintenanceRedirectUrl?: string;

  // Controle de Acesso às Rotas
  @IsOptional()
  @IsBoolean()
  routeHomeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeUserEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeCoachEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeEmployeeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeShoppingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeBlogEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeServicesEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeContactEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeWaitlistEnabled?: boolean;

  // Termos e políticas de texto
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsOptional()
  @IsString()
  privacyPolicy?: string;

  @IsOptional()
  @IsString()
  cancellationPolicy?: string;

  // Imagens do carrossel
  @IsOptional()
  @IsString()
  carouselImage1?: string;

  @IsOptional()
  @IsString()
  carouselImage2?: string;

  @IsOptional()
  @IsString()
  carouselImage3?: string;

  @IsOptional()
  @IsString()
  carouselImage4?: string;

  @IsOptional()
  @IsString()
  carouselImage5?: string;

  @IsOptional()
  @IsString()
  carouselImage6?: string;

  @IsOptional()
  @IsString()
  carouselImage7?: string;
}

export class UpdateMaintenanceDto {
  @IsBoolean()
  maintenanceMode: boolean;

  @IsOptional()
  @IsString()
  maintenanceRedirectUrl?: string;

  // Permitir que a UI envie os flags de rotas junto (serão ignorados no service)
  @IsOptional()
  @IsBoolean()
  routeHomeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeUserEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeCoachEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeEmployeeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeShoppingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeBlogEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeServicesEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeContactEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeWaitlistEnabled?: boolean;
}

export class UpdateRoutesDto {
  @IsOptional()
  @IsBoolean()
  routeHomeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeUserEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeCoachEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeEmployeeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeShoppingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeBlogEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeServicesEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeContactEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeWaitlistEnabled?: boolean;
}
