import { apiClient } from "@/lib/api-client";

export async function toggleUserStatusAction(
  userId: string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.patch(`/users/${userId}`, { isActive });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar status";
    return { success: false, error: message };
  }
}
