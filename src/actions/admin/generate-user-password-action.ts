import { apiClient } from "@/lib/api-client";

export interface GeneratePasswordResult {
  success: boolean;
  password?: string;
  message?: string;
  error?: string;
}

export async function generateUserPasswordAction(
  userId: string,
): Promise<GeneratePasswordResult> {
  try {
    const response = await apiClient.post<{ password: string }>(
      `/users/${userId}/password`,
      {},
    );
    return { success: true, password: response.password };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao gerar senha";
    return { success: false, message, error: message };
  }
}
