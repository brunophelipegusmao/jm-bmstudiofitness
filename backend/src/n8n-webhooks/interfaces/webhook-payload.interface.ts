import { WebhookEventType } from '../dto/webhook-event.dto';

export interface WebhookPayload {
  eventType: WebhookEventType;
  timestamp: Date;
  data: Record<string, any>;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface WebhookResponse {
  success: boolean;
  eventId: string;
  timestamp: Date;
  error?: string;
}
