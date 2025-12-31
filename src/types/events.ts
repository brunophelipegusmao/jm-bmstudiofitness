export interface Event {
  id: string;
  title: string;
  description: string;
  summary?: string | null;
  slug: string;
  imageUrl: string | null;
  date: Date;
  time?: string | null;
  location?: string | null;
  hideLocation?: boolean;
  requireAttendance?: boolean;
  published?: boolean;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  views?: number;
  authorId?: string | null;
}

export interface EventListItem extends Event {}

export interface BirthdayEntry {
  id: string;
  name: string;
  birthDate: Date;
}

export interface EventCalendarData {
  events: Event[];
  birthdays: BirthdayEntry[];
}

export interface PersonalEvent extends Event {
  isPublic: boolean;
  approvalStatus: string;
  requestPublic: boolean;
  eventDate: Date | string;
}
