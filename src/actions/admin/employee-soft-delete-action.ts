import { apiClient } from "@/lib/api-client";

export async function softDeleteEmployeeAction(id: string) {
  try {
    await apiClient.delete(`/employees/${id}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao desativar funcionário";
    return { success: false, error: message };
  }
}

export async function reactivateEmployeeAction(id: string) {
  try {
    await apiClient.post(`/employees/${id}/restore`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao reativar funcionário";
    return { success: false, error: message };
  }
}
