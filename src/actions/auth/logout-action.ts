import { apiClient } from "@/lib/api-client";

export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  } finally {
    apiClient.clearTokens?.();
  }
  return { success: true };
}

export async function logoutFormAction(): Promise<void> {
  await logoutAction();
}
