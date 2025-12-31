import { apiClient } from "@/lib/api-client";

export interface CreatePersonalEventInput {
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  hideLocation?: boolean;
  requestPublic?: boolean;
}

export async function createPersonalEventAction(input: CreatePersonalEventInput) {
  try {
    const response = await apiClient.post("/students/personal-events", input);
    return { success: true, data: response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar evento";
    return { success: false, error: message };
  }
}
