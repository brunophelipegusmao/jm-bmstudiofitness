import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export enum WebhookEventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_OVERDUE = 'payment.overdue',
  CHECK_IN = 'checkin.completed',
  HEALTH_METRICS_UPDATED = 'health.updated',
}

export class TriggerWebhookDto {
  @IsNotEmpty({ message: 'Tipo de evento é obrigatório' })
  @IsEnum(WebhookEventType, { message: 'Tipo de evento inválido' })
  eventType: WebhookEventType;

  @IsNotEmpty({ message: 'Dados do evento são obrigatórios' })
  @IsObject({ message: 'Dados devem ser um objeto' })
  data: Record<string, any>;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  metadata?: string;
}

export class WebhookConfigDto {
  @IsNotEmpty({ message: 'URL do webhook é obrigatória' })
  @IsString()
  url: string;

  @IsNotEmpty({ message: 'Tipo de evento é obrigatório' })
  @IsEnum(WebhookEventType, { message: 'Tipo de evento inválido' })
  eventType: WebhookEventType;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;
}
