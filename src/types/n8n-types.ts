/**
 * Tipos para integração com n8n webhooks
 */

// Payload para notificação de check-in
export interface CheckinWebhookPayload {
  studentId: string;
  studentName: string;
  studentEmail: string;
  checkinDate: string;
  checkinTime: string;
  coachId?: string;
  coachName?: string;
  coachEmail?: string;
  academyName: string;
}

// Payload para pagamento recebido
export interface PaymentReceivedPayload {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  amountInCents: number;
  amountFormatted: string;
  paymentDate: string;
  paymentMethod?: string;
  transactionId?: string;
  dueDate: number;
  referenceMonth: string;
}

// Payload para pagamento falhou
export interface PaymentFailedPayload {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  amountInCents: number;
  amountFormatted: string;
  attemptDate: string;
  failureReason?: string;
  dueDate: number;
}

// Payload para lembretes de cobrança (trigger manual)
export interface PaymentRemindersPayload {
  type: "due_today" | "due_soon" | "overdue";
  students: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    amountInCents: number;
    amountFormatted: string;
    dueDate: number;
    daysOverdue?: number;
  }>;
  triggeredBy: string;
  triggeredAt: string;
}

// Resposta padrão do webhook
export interface N8nWebhookResponse {
  success: boolean;
  message?: string;
  executionId?: string;
  error?: string;
}
