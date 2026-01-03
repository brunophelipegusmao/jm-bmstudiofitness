import { apiClient } from "@/lib/api-client";

export async function deletePersonalEventAction(id: string): Promise<{
  success: boolean;
}> {
  return apiClient.delete(`/students/personal-events/${id}`);
}
