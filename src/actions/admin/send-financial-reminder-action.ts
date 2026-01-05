import { apiClient } from "@/lib/api-client";

export async function sendFinancialReminderAction(
  financialId: string,
  channel: "email" | "whatsapp",
  template: "upcoming" | "today" | "blocked",
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const data = await apiClient.post(`/financial/${financialId}/remind`, {
      channel,
      template,
    });
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao enviar lembrete";
    return { success: false, error: message };
  }
}
