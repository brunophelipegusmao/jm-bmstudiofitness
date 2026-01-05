import { apiClient } from "@/lib/api-client";

type CreateFinancialInput = {
  userId: string;
  monthlyFeeValue: number; // em centavos
  dueDate: number; // dia do mês
  paymentMethod?: string;
  paid?: boolean;
  lastPaymentDate?: string;
};

export async function createFinancialRecordAction(
  input: CreateFinancialInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post("/financial", input);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar cobrança";
    return { success: false, error: message };
  }
}
