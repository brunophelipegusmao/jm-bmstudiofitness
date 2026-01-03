import { apiClient } from "@/lib/api-client";

export interface QuickCheckInState {
  success: boolean;
  message: string;
  userName?: string;
  errors?: Record<string, string[]>;
}

export async function quickCheckInAction(
  _prevState: QuickCheckInState,
  formData: FormData,
): Promise<QuickCheckInState> {
  try {
    const identifier = (formData.get("identifier") as string | null)?.trim();
    if (!identifier) {
      return { success: false, message: "Informe CPF ou email" };
    }

    const isCpf = /^\d{11}$/.test(identifier.replace(/\D/g, ""));

    const data = await apiClient.post<{
      success?: boolean;
      message?: string;
      userName?: string;
    }>("/check-ins", {
      identifier: identifier.replace(/\D/g, "") || identifier,
      method: isCpf ? "cpf" : "email",
    });

    return {
      success: data?.success ?? true,
      message: data?.message ?? "Check-in realizado com sucesso",
      userName: data?.userName,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao realizar check-in";
    return { success: false, message };
  }
}
