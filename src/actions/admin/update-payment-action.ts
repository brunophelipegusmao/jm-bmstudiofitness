import { apiClient } from "@/lib/api-client";

type FinancialRecord = {
  id: string;
  paymentMethod?: string;
};

export async function updatePaymentAction(userId: string, paid: boolean) {
  try {
    const records = await apiClient.get<
      { data?: FinancialRecord[] } | FinancialRecord[]
    >(`/financial?userId=${userId}&limit=1&page=1`);

    const recordList = Array.isArray(records) ? records : records?.data ?? [];
    const record = recordList[0];

    if (!record?.id) {
      throw new Error("Registro financeiro não encontrado para o usuário");
    }

    if (paid) {
      await apiClient.post(`/financial/${record.id}/mark-paid`, {
        paymentMethod: record.paymentMethod ?? "pix",
      });
    } else {
      await apiClient.patch(`/financial/${record.id}`, { paid: false });
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar pagamento";
    return { success: false, error: message };
  }
}
