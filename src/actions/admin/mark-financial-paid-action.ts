import { apiClient } from "@/lib/api-client";

export async function markFinancialPaidAction(
  financialId: string,
  paymentMethod?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`/financial/${financialId}/mark-paid`, {
      paymentDate: new Date().toISOString(),
      paymentMethod: paymentMethod ?? "manual",
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao confirmar pagamento";
    return { success: false, error: message };
  }
}
