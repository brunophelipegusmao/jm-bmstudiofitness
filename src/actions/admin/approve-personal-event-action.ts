import { apiClient } from "@/lib/api-client";

export async function approvePersonalEventAction(id: string) {
  try {
    const result = await apiClient.patch(`/students/personal-events/${id}/approve`, {
      approve: true,
    });
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao aprovar evento";
    return { success: false, error: message };
  }
}
