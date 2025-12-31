import { apiClient } from "@/lib/api-client";

export type CheckInFormState = {
  success: boolean;
  message?: string;
  userName?: string;
  showPaymentDialog?: boolean;
  errors?: Record<string, string[]>;
  paymentInfo?: {
    dueDate: number;
    lastPaymentDate: string | null;
    daysOverdue: number;
  };
};

export async function checkInAction(
  _prevState: CheckInFormState,
  formData: FormData,
): Promise<CheckInFormState> {
  try {
    const identifier = (formData.get("identifier") as string | null)?.trim();
    if (!identifier) {
      return { success: false, message: "Informe CPF ou email" };
    }

    const data = await apiClient.post<CheckInFormState>("/check-ins", {
      identifier,
    });

    return {
      success: data?.success ?? true,
      message: data?.message,
      userName: data?.userName,
      showPaymentDialog: data?.showPaymentDialog,
      errors: data?.errors,
      paymentInfo: data?.paymentInfo,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao realizar check-in";
    return { success: false, message };
  }
}
