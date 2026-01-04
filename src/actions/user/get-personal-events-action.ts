import { apiClient } from "@/lib/api-client";

export interface PersonalEventResponse {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime?: string | null;
  location?: string | null;
  hideLocation?: boolean;
  requestPublic?: boolean;
  approvalStatus?: string;
  isPublic?: boolean;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonalEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time?: string | null;
  location?: string | null;
  hideLocation?: boolean;
  requestPublic?: boolean;
  approvalStatus?: string;
  isPublic?: boolean;
  imageUrl: string | null;
  slug: string;
}

export async function getPersonalEventsAction(): Promise<PersonalEvent[]> {
  try {
    const data = await apiClient.get<PersonalEventResponse[]>("/students/personal-events");
    return (
      data?.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        date: new Date(item.eventDate),
        time: item.eventTime,
        location: item.location,
        hideLocation: item.hideLocation,
        requestPublic: item.requestPublic,
        approvalStatus: item.approvalStatus,
        isPublic: item.isPublic,
        imageUrl: item.imageUrl ?? null,
        slug: `personal-${item.id}`,
      })) ?? []
    );
  } catch (error) {
    console.error("Erro ao carregar eventos pessoais", error);
    return [];
  }
}
