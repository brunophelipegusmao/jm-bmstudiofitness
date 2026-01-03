import { apiClient } from "@/lib/api-client";

export interface PendingPersonalEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime?: string | null;
  userId: string;
  userName?: string | null;
  approvalStatus?: string | null;
  requestPublic?: boolean;
  isPublic?: boolean;
}

export async function getPendingPersonalEventsAction(): Promise<PendingPersonalEvent[]> {
  try {
    const events = await apiClient.get<PendingPersonalEvent[]>(
      "/students/personal-events/pending",
    );
    return events ?? [];
  } catch (error) {
    console.error("Erro ao carregar eventos pessoais pendentes", error);
    return [];
  }
}
