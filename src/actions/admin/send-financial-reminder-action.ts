import { apiClient } from "@/lib/api-client";

export async function sendFinancialReminderAction(
  financialId: string,
  channel: "email" | "whatsapp",
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`/financial/${financialId}/remind`, { channel });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao enviar lembrete";
    return { success: false, error: message };
  }
}
