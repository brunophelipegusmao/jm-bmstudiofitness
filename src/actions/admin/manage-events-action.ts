import { apiClient } from "@/lib/api-client";
import type { Event } from "@/types/events";

const toLocalDate = (value: unknown): Date => {
  if (!value) return new Date();
  if (value instanceof Date) {
    const datePart = value.toISOString().split("T")[0];
    return new Date(`${datePart}T00:00:00`);
  }
  const raw = String(value);
  const datePart = raw.includes("T") ? raw.split("T")[0] : raw;
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return new Date(`${datePart}T00:00:00`);
  }
  return new Date(raw);
};

type CreateEventInput = {
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  hideLocation?: boolean;
  imageUrl?: string;
  published?: boolean;
  requireAttendance?: boolean;
};

type UpdateEventInput = Partial<CreateEventInput>;

const mapEvent = (payload: unknown): Event => {
  const data = payload as Record<string, unknown>;
  const author = data.author as Record<string, unknown> | undefined;

  return {
    id: (data.id as string) ?? "",
    title: (data.title as string) ?? "",
    description:
      (data.description as string) ??
      (data.content as string) ??
      (data.excerpt as string) ??
      "",
    summary:
      (data.summary as string | null | undefined) ??
      (data.excerpt as string | null | undefined) ??
      null,
    slug: (data.slug as string) ?? "",
    imageUrl: (data.imageUrl as string) ?? (data.coverImage as string) ?? null,
    date: data.eventDate
      ? toLocalDate(data.eventDate)
      : toLocalDate(data.createdAt ?? Date.now()),
    time: (data.eventTime as string | null | undefined) ?? null,
    location: (data.location as string | null | undefined) ?? null,
    hideLocation: (data.hideLocation as boolean | undefined) ?? false,
    requireAttendance:
      (data.requireAttendance as boolean | undefined) ?? false,
    published:
      (data.isPublished as boolean | undefined) ??
      (data.published as boolean | undefined) ??
      false,
    publishedAt: data.publishedAt
      ? new Date(data.publishedAt as string)
      : null,
    createdAt: data.createdAt
      ? new Date(data.createdAt as string)
      : undefined,
    updatedAt: data.updatedAt
      ? new Date(data.updatedAt as string)
      : undefined,
    views: (data.viewCount as number | undefined) ?? 0,
    authorId:
      (author?.id ? String(author.id) : undefined) ??
      (data.authorId as string | null | undefined) ??
      null,
  };
};

const normalizePayload = (data: CreateEventInput | UpdateEventInput) => {
  const payload: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    date: data.date,
    time: data.time,
    location: data.location,
    hideLocation: data.hideLocation,
    imageUrl: data.imageUrl,
    isPublished: data.published,
    requireAttendance: data.requireAttendance,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });

  return payload;
};

export async function getEventsAction(params?: {
  search?: string;
  includeDeleted?: boolean;
  publishedOnly?: boolean;
}): Promise<Event[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.includeDeleted) query.set("includeDeleted", "true");
  if (params?.publishedOnly) query.set("publishedOnly", "true");

  const events = await apiClient.get<unknown[]>(
    `/events${query.toString() ? `?${query.toString()}` : ""}`,
  );
  return (events || []).map(mapEvent);
}

export async function createEventAction(
  data: CreateEventInput,
): Promise<Event> {
  const payload = normalizePayload(data);
  const event = await apiClient.post<unknown>("/events", payload);
  return mapEvent(Array.isArray(event) ? event[0] : event);
}

export async function updateEventAction(
  id: string | number,
  data: UpdateEventInput,
): Promise<Event> {
  const payload = normalizePayload(data);
  const event = await apiClient.patch<unknown>(`/events/${id}`, payload);
  return mapEvent(Array.isArray(event) ? event[0] : event);
}

export async function deleteEventAction(
  id: string | number,
): Promise<{ success: boolean }> {
  await apiClient.delete(`/events/${id}`);
  return { success: true };
}

export async function downloadEventAttendancePdfAction(
  id: string | number,
): Promise<Blob> {
  const buffer = await apiClient.requestBinary(
    `/events/${id}/confirmations/pdf`,
    {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    },
  );

  return new Blob([buffer], { type: "application/pdf" });
}

export type AttendanceEntry = {
  id: string;
  name: string;
  email?: string | null;
  confirmedAt: string;
};

export async function getEventAttendanceAction(
  id: string | number,
): Promise<AttendanceEntry[]> {
  return apiClient.get(`/events/${id}/confirmations`);
}
