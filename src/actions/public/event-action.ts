import { apiClient } from "@/lib/api-client";
import type { BirthdayEntry, Event, EventCalendarData } from "@/types/events";

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

const parseBirthdayDate = (value: unknown): Date => {
  if (!value) return new Date();
  const raw = value instanceof Date ? value.toISOString() : String(value);
  const datePart = raw.includes("T") ? raw.split("T")[0] : raw;
  // Normaliza para 12:00Z para evitar voltar um dia com fuso
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return new Date(`${datePart}T12:00:00Z`);
  }
  return new Date(raw);
};

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

const mapBirthday = (payload: unknown): BirthdayEntry => {
  const data = payload as Record<string, unknown>;
  return {
    id: (data.id as string) ?? "",
    name: (data.name as string) ?? "Aniversariante",
    birthDate: data.bornDate
      ? parseBirthdayDate(data.bornDate)
      : parseBirthdayDate(data.birthDate ?? Date.now()),
  };
};

export async function getPublishedEventsAction(): Promise<Event[]> {
  const events = await apiClient.get<unknown[]>("/events/public");
  return (events || []).map(mapEvent);
}

export async function getEventsCalendarAction(): Promise<EventCalendarData> {
  const response = await apiClient.get<{
    events?: unknown[];
    birthdays?: unknown[];
  }>("/events/calendar");

  return {
    events: (response?.events || []).map(mapEvent),
    birthdays: (response?.birthdays || []).map(mapBirthday),
  };
}

export async function getPublishedEventBySlugAction(
  slug: string,
): Promise<Event | null> {
  try {
    const event = await apiClient.get<unknown>(`/events/public/${slug}`);
    return event ? mapEvent(event) : null;
  } catch {
    return null;
  }
}

export async function incrementEventViewsAction(
  _eventId: string | number,
): Promise<{ success: boolean }> {
  void _eventId;
  return { success: true };
}

export async function confirmEventAttendanceAction(
  slug: string,
  payload: { name: string; email?: string },
): Promise<{ success: boolean; attendanceId?: string }> {
  const result = await apiClient.post<{
    success: boolean;
    attendanceId?: string;
  }>(`/events/public/${slug}/confirm`, payload);
  return result;
}
