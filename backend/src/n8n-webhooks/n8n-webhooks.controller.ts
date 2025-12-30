import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/schema';
import { TriggerWebhookDto } from './dto/webhook-event.dto';
import { N8nWebhooksService } from './n8n-webhooks.service';

@Controller('n8n-webhooks')
export class N8nWebhooksController {
  constructor(private readonly n8nWebhooksService: N8nWebhooksService) {}

  /**
   * Disparar webhook manualmente (ADMIN, MASTER)
   */
  @Post('trigger')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  @HttpCode(HttpStatus.OK)
  async triggerWebhook(@Body() dto: TriggerWebhookDto) {
    return await this.n8nWebhooksService.triggerWebhook(dto);
  }

  /**
   * Verificar status dos webhooks
   */
  @Get('status')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  getStatus() {
    return {
      enabled: this.n8nWebhooksService.isWebhooksEnabled(),
      timestamp: new Date(),
    };
  }

  /**
   * Testar conectividade com n8n
   */
  @Post('test')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  @HttpCode(HttpStatus.OK)
  async testWebhook() {
    const result = await this.n8nWebhooksService.triggerWebhook({
      eventType: 'user.created' as any,
      data: {
        test: true,
        message: 'Teste de conectividade',
        timestamp: new Date(),
      },
    });

    return {
      ...result,
      message: result.success
        ? 'Webhook de teste enviado com sucesso'
        : 'Falha ao enviar webhook de teste',
    };
  }
}
