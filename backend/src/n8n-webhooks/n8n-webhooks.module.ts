import { Module } from '@nestjs/common';

import { N8nWebhooksController } from './n8n-webhooks.controller';
import { N8nWebhooksService } from './n8n-webhooks.service';

@Module({
  controllers: [N8nWebhooksController],
  providers: [N8nWebhooksService],
  exports: [N8nWebhooksService],
})
export class N8nWebhooksModule {}
