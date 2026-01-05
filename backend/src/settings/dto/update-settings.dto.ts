import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  // InformaÃ§Ãµes bÃ¡sicas
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

  // HorÃ¡rios de funcionamento
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

  // PolÃ­ticas
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

  // Modo ManutenÃ§Ã£o
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsString()
  maintenanceRedirectUrl?: string;

  // Controle de Acesso Ã s Rotas
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
  routeEventsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeServicesEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeContactEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  routeWaitlistEnabled?: boolean;

  // Termos e polÃ­ticas de texto
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

  // Legendas do carrossel
  @IsOptional()
  @IsString()
  carouselCaption1?: string;

  @IsOptional()
  @IsString()
  carouselCaption2?: string;

  @IsOptional()
  @IsString()
  carouselCaption3?: string;

  @IsOptional()
  @IsString()
  carouselCaption4?: string;

  @IsOptional()
  @IsString()
  carouselCaption5?: string;

  @IsOptional()
  @IsString()
  carouselCaption6?: string;

  @IsOptional()
  @IsString()
  carouselCaption7?: string;

  // CustomizaÃ§Ãµes da home
  @IsOptional()
  @IsBoolean()
  carouselEnabled?: boolean;

  @IsOptional()
  @IsString()
  homeHistoryMarkdown?: string;

  @IsOptional()
  @IsString()
  homeHistoryImage?: string;

  @IsOptional()
  @IsString()
  foundationDate?: string;

  // Banner/promo
  @IsOptional()
  @IsBoolean()
  promoBannerEnabled?: boolean;

  @IsOptional()
  @IsString()
  promoBannerMediaType?: 'image' | 'video';

  @IsOptional()
  @IsString()
  promoBannerUrl?: string;

  @IsOptional()
  @IsString()
  promoBannerTitle?: string;

  @IsOptional()
  @IsString()
  promoBannerDescription?: string;

  @IsOptional()
  @IsString()
  promoBannerLink?: string;
}

export class UpdateMaintenanceDto {
  @IsBoolean()
  maintenanceMode: boolean;

  @IsOptional()
  @IsString()
  maintenanceRedirectUrl?: string;

  // Permitir que a UI envie os flags de rotas junto (serÃ£o ignorados no service)
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
  routeEventsEnabled?: boolean;

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
  routeEventsEnabled?: boolean;

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






