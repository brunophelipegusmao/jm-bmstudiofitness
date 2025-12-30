import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TriggerWebhookDto, WebhookEventType } from './dto/webhook-event.dto';
import {
  WebhookPayload,
  WebhookResponse,
} from './interfaces/webhook-payload.interface';

@Injectable()
export class N8nWebhooksService {
  private readonly logger = new Logger(N8nWebhooksService.name);
  private readonly webhookBaseUrl: string;
  private readonly isEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.webhookBaseUrl =
      this.configService.get<string>('N8N_WEBHOOK_URL') || '';
    this.isEnabled = this.configService.get<string>('N8N_ENABLED') === 'true';

    if (this.isEnabled && !this.webhookBaseUrl) {
      this.logger.warn(
        'N8N webhooks habilitados mas N8N_WEBHOOK_URL não configurada',
      );
    }
  }

  /**
   * Dispara um webhook para o n8n
   */
  async triggerWebhook(dto: TriggerWebhookDto): Promise<WebhookResponse> {
    if (!this.isEnabled) {
      this.logger.debug('N8N webhooks desabilitados, ignorando evento');
      return {
        success: false,
        eventId: this.generateEventId(),
        timestamp: new Date(),
        error: 'Webhooks desabilitados',
      };
    }

    const payload: WebhookPayload = {
      eventType: dto.eventType,
      timestamp: new Date(),
      data: dto.data,
      userId: dto.userId,
      metadata: dto.metadata ? JSON.parse(dto.metadata) : {},
    };

    try {
      const response = await fetch(this.webhookBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Event-Type': dto.eventType,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const eventId = this.generateEventId();
      this.logger.log(`Webhook disparado: ${dto.eventType} (ID: ${eventId})`);

      return {
        success: true,
        eventId,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Erro ao disparar webhook: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        eventId: this.generateEventId(),
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * Evento: Usuário criado
   */
  async onUserCreated(userId: string, userData: any): Promise<void> {
    await this.triggerWebhook({
      eventType: WebhookEventType.USER_CREATED,
      data: {
        userId,
        user: userData,
      },
      userId,
    });
  }

  /**
   * Evento: Usuário atualizado
   */
  async onUserUpdated(userId: string, updatedData: any): Promise<void> {
    await this.triggerWebhook({
      eventType: WebhookEventType.USER_UPDATED,
      data: {
        userId,
        changes: updatedData,
      },
      userId,
    });
  }

  /**
   * Evento: Usuário deletado
   */
  async onUserDeleted(userId: string): Promise<void> {
    await this.triggerWebhook({
      eventType: WebhookEventType.USER_DELETED,
      data: {
        userId,
        deletedAt: new Date(),
      },
      userId,
    });
  }

  /**
   * Evento: Pagamento recebido
   */
  async onPaymentReceived(
    paymentId: string,
    userId: string,
    amount: number,
    paymentData: any,
  ): Promise<void> {
    await this.triggerWebhook({
      eventType: WebhookEventType.PAYMENT_RECEIVED,
      data: {
        paymentId,
        userId,
        amount,
        payment: paymentData,
        receivedAt: new Date(),
      },
      userId,
    });
  }

  /**
   * Evento: Pagamento atrasado
   */
  async onPaymentOverdue(
    paymentId: string,
    userId: string,
    daysOverdue: number,
    paymentData: any,
  ): Promise<void> {
    await this.triggerWebhook({
      eventType: WebhookEventType.PAYMENT_OVERDUE,
      data: {
        paymentId,
        userId,
        daysOverdue,
        payment: paymentData,
      },
      userId,
    });
  }

  /**
   * Evento: Check-in realizado
   */
  async onCheckIn(
    checkInId: string,
    userId: string,
    checkInData: any,
  ): Promise<void> {
    await this.triggerWebhook({
      eventType: WebhookEventType.CHECK_IN,
      data: {
        checkInId,
        userId,
        checkIn: checkInData,
        timestamp: new Date(),
      },
      userId,
    });
  }

  /**
   * Evento: Métricas de saúde atualizadas
   */
  async onHealthMetricsUpdated(
    userId: string,
    metricsData: any,
  ): Promise<void> {
    await this.triggerWebhook({
      eventType: WebhookEventType.HEALTH_METRICS_UPDATED,
      data: {
        userId,
        metrics: metricsData,
        updatedAt: new Date(),
      },
      userId,
    });
  }

  /**
   * Gera um ID único para o evento
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica se os webhooks estão habilitados
   */
  isWebhooksEnabled(): boolean {
    return this.isEnabled && !!this.webhookBaseUrl;
  }
}
