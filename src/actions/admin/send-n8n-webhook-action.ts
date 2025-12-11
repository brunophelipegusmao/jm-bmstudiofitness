"use server";

import { n8nConfig } from "@/lib/n8n-config";
import type {
  CheckinWebhookPayload,
  N8nWebhookResponse,
  PaymentFailedPayload,
  PaymentReceivedPayload,
  PaymentRemindersPayload,
} from "@/types/n8n-types";

/**
 * Função auxiliar para enviar dados ao n8n
 */
async function sendToN8n(
  webhookPath: string,
  payload: unknown,
  retryCount = 0,
): Promise<N8nWebhookResponse> {
  try {
    const url = `${n8nConfig.baseUrl}${webhookPath}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Adiciona autenticação se configurada
    if (n8nConfig.secret) {
      headers["Authorization"] = `Bearer ${n8nConfig.secret}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), n8nConfig.timeout);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      message: "Webhook sent successfully",
      executionId: data.executionId,
    };
  } catch (error) {
    // Retry logic
    if (
      retryCount < n8nConfig.retry.attempts &&
      error instanceof Error &&
      error.name !== "AbortError"
    ) {
      await new Promise((resolve) =>
        setTimeout(resolve, n8nConfig.retry.delay * (retryCount + 1)),
      );
      return sendToN8n(webhookPath, payload, retryCount + 1);
    }

    console.error("n8n webhook error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 1. Enviar lembretes de cobrança ao n8n
 */
export async function sendPaymentRemindersWebhook(
  payload: PaymentRemindersPayload,
) {
  return sendToN8n(n8nConfig.webhooks.paymentReminders, payload);
}

/**
 * 2. Notificar check-in ao n8n
 */
export async function sendCheckinNotificationWebhook(
  payload: CheckinWebhookPayload,
) {
  return sendToN8n(n8nConfig.webhooks.checkinNotification, payload);
}

/**
 * 4. Notificar pagamento recebido ao n8n
 */
export async function sendPaymentReceivedWebhook(
  payload: PaymentReceivedPayload,
) {
  return sendToN8n(n8nConfig.webhooks.paymentReceived, payload);
}

/**
 * 4. Notificar falha de pagamento ao n8n
 */
export async function sendPaymentFailedWebhook(payload: PaymentFailedPayload) {
  return sendToN8n(n8nConfig.webhooks.paymentFailed, payload);
}
