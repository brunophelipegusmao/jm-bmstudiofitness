import { apiClient } from "@/lib/api-client";

type UpdateFinancialInput = {
  monthlyFeeValue?: number; // em centavos
  dueDate?: number;
  paymentMethod?: string;
  paid?: boolean;
  lastPaymentDate?: string | null;
};

export async function updateFinancialRecordAction(
  id: string,
  input: UpdateFinancialInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.patch(`/financial/${id}`, input);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar cobrança";
    return { success: false, error: message };
  }
}
