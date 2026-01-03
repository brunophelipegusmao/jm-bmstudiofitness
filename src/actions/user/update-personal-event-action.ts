import { apiClient } from "@/lib/api-client";
import type { PersonalEvent } from "@/types/events";

export interface UpdatePersonalEventInput {
  id: string;
  title?: string;
  description?: string;
  date?: string;
  time?: string | null;
  location?: string | null;
  hideLocation?: boolean;
}

export async function updatePersonalEventAction(
  payload: UpdatePersonalEventInput,
): Promise<PersonalEvent> {
  const { id, ...data } = payload;
  const response = await apiClient.patch<PersonalEvent>(
    `/students/personal-events/${id}`,
    data,
  );
  return response;
}
