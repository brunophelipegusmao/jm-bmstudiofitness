/**
 * Configuração do n8n para automações
 *
 * Configure as variáveis de ambiente:
 * - N8N_WEBHOOK_BASE_URL=https://seu-n8n.com/webhook
 * - N8N_WEBHOOK_SECRET=seu-secret-key (opcional, para autenticação)
 */

export const n8nConfig = {
  baseUrl: process.env.N8N_WEBHOOK_BASE_URL || "http://localhost:5678/webhook",
  secret: process.env.N8N_WEBHOOK_SECRET,

  // URLs dos webhooks específicos
  webhooks: {
    // 1. Lembretes de Cobrança (trigger manual via dashboard)
    paymentReminders: "/payment-reminders",

    // 2. Notificações de Check-in
    checkinNotification: "/checkin-notification",

    // 4. Integração com Pagamentos
    paymentReceived: "/payment-received",
    paymentFailed: "/payment-failed",
  },

  // Timeout para requisições (ms)
  timeout: 10000,

  // Retry config
  retry: {
    attempts: 3,
    delay: 1000,
  },
} as const;

export type N8nWebhookType = keyof typeof n8nConfig.webhooks;
