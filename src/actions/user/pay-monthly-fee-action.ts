import { apiClient } from "@/lib/api-client";

export interface PaymentStatus {
  financialId: string | null;
  paid: boolean;
  monthlyFeeValue: number;
  dueDate: number;
  lastPaymentDate: string | null;
  paymentMethod: string | null;
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
    const response = await apiClient.get<{
      success?: boolean;
      message?: string;
      data?: {
        financial: {
          id: string | null;
          paid: boolean;
          monthlyFeeValueInCents: number;
          dueDate: number;
          lastPaymentDate: string | null;
          paymentMethod: string | null;
        };
      };
    }>("/students/me");

    const financial = response?.data?.financial;
    const mapped: PaymentStatus | null = financial
      ? {
          financialId: financial.id ?? null,
          paid: financial.paid ?? false,
          monthlyFeeValue: financial.monthlyFeeValueInCents ?? 0,
          dueDate: financial.dueDate ?? 0,
          lastPaymentDate: financial.lastPaymentDate ?? null,
          paymentMethod: financial.paymentMethod ?? null,
        }
      : null;

    return {
      success: response?.success ?? true,
      data: mapped,
      error: response?.message,
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
    const { paymentId, ...rest } = params as any;
    if (!paymentId) {
      throw new Error("ID do lancamento financeiro nao encontrado");
    }
    const response = await apiClient.post<PayMonthlyFeeResult>(
      `/financial/${paymentId}/mark-paid`,
      { paymentMethod: rest.paymentMethod ?? "manual" },
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

