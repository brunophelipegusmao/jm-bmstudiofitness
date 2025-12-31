import { apiClient } from "@/lib/api-client";

export interface ConfirmUserState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  userData?: {
    name: string;
    email: string;
    cpf: string;
  };
}

export async function confirmUserAction(
  _prevState: ConfirmUserState,
  formData: FormData,
): Promise<ConfirmUserState> {
  try {
    const token = (formData.get("token") as string | null) ?? "";
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const cpf = (formData.get("cpf") as string | null)?.trim() ?? "";
    const password = (formData.get("password") as string | null) ?? "";
    const confirmPassword =
      (formData.get("confirmPassword") as string | null) ?? "";

    if (!token || !email || !cpf || !password || !confirmPassword) {
      return { success: false, message: "Preencha todos os campos obrigatórios" };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "As senhas não coincidem" };
    }

    const result = await apiClient.post<ConfirmUserState>("/auth/confirm", {
      token,
      email,
      cpf,
      password,
    });

    return {
      success: result?.success ?? true,
      message: result?.message ?? "Conta confirmada com sucesso",
      errors: result?.errors,
      userData: result?.userData,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao confirmar conta";
    return { success: false, message };
  }
}
