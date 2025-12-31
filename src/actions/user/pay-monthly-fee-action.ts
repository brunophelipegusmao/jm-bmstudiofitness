import { apiClient } from "@/lib/api-client";

export interface PaymentStatus {
  paid: boolean;
  monthlyFeeValue: number;
  dueDate: number;
  lastPaymentDate: string | null;
  paymentMethod: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  data?: PaymentStatus | null;
  error?: string;
}

export interface PayMonthlyFeeResult {
  success: boolean;
  paymentData?: { nextDueDate: string | null };
  error?: string;
}

export async function getMyPaymentStatusAction(): Promise<PaymentStatusResponse> {
  try {
    const response = await apiClient.get<PaymentStatusResponse>(
      "/payments/status",
    );
    return {
      success: response?.success ?? true,
      data: response?.data ?? null,
      error: response?.error,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar status";
    return { success: false, error: message, data: null };
  }
}

export async function payMonthlyFeeAction(params: {
  paymentMethod: string;
  transactionId?: string;
}): Promise<PayMonthlyFeeResult> {
  try {
    const response = await apiClient.post<PayMonthlyFeeResult>(
      "/payments/pay",
      params,
    );
    return {
      success: response?.success ?? true,
      paymentData: response?.paymentData,
      error: response?.error,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao processar pagamento";
    return { success: false, error: message };
  }
}
