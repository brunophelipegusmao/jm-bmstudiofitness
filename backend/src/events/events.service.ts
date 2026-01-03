import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, eq, ilike, isNull, or } from 'drizzle-orm';
import type { SQLWrapper } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from '../database/schema';
import {
  tbBlogPosts,
  tbEventAttendance,
  tbPersonalEvents,
  tbPersonalData,
  tbUsers,
} from '../database/schema';
import {
  ConfirmAttendanceDto,
  CreateEventDto,
  QueryEventsDto,
  UpdateEventDto,
} from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  private normalizeDate(value: unknown): string | null {
    if (!value) return null;
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    const raw = String(value);
    return raw.includes('T') ? raw.split('T')[0] : raw;
  }

  async findAllEvents(query: QueryEventsDto = {}) {
    const conditions: SQLWrapper[] = [];

    if (!query.includeDeleted) {
      conditions.push(isNull(tbBlogPosts.deletedAt));
    }

    if (query.publishedOnly) {
      conditions.push(eq(tbBlogPosts.isPublished, true));
    }

    if (query.search) {
      conditions.push(
        or(
          ilike(tbBlogPosts.title, `%${query.search}%`),
          ilike(tbBlogPosts.content, `%${query.search}%`),
        ) as SQLWrapper,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select({
        id: tbBlogPosts.id,
        title: tbBlogPosts.title,
        slug: tbBlogPosts.slug,
        description: tbBlogPosts.content,
        summary: tbBlogPosts.excerpt,
        imageUrl: tbBlogPosts.coverImage,
        eventDate: tbBlogPosts.eventDate,
        eventTime: tbBlogPosts.eventTime,
        location: tbBlogPosts.location,
        hideLocation: tbBlogPosts.hideLocation,
        requireAttendance: tbBlogPosts.requireAttendance,
        isPublished: tbBlogPosts.isPublished,
        publishedAt: tbBlogPosts.publishedAt,
        viewCount: tbBlogPosts.viewCount,
        createdAt: tbBlogPosts.createdAt,
        updatedAt: tbBlogPosts.updatedAt,
        author: {
          id: tbUsers.id,
          name: tbUsers.name,
        },
      })
      .from(tbBlogPosts)
      .leftJoin(tbUsers, eq(tbBlogPosts.authorId, tbUsers.id))
      .where(whereClause)
      .orderBy(
        asc(tbBlogPosts.eventDate),
        asc(tbBlogPosts.eventTime),
        asc(tbBlogPosts.createdAt),
      );

    return rows.map((event) => ({
      ...event,
      eventDate: this.normalizeDate(event.eventDate),
      publishedAt: this.normalizeDate(event.publishedAt),
      createdAt: this.normalizeDate(event.createdAt),
      updatedAt: this.normalizeDate(event.updatedAt),
    }));
  }

  async findEvent(id: string) {
    const [event] = await this.db
      .select({
        id: tbBlogPosts.id,
        title: tbBlogPosts.title,
        slug: tbBlogPosts.slug,
        description: tbBlogPosts.content,
        summary: tbBlogPosts.excerpt,
        imageUrl: tbBlogPosts.coverImage,
        eventDate: tbBlogPosts.eventDate,
        eventTime: tbBlogPosts.eventTime,
        location: tbBlogPosts.location,
        hideLocation: tbBlogPosts.hideLocation,
        requireAttendance: tbBlogPosts.requireAttendance,
        isPublished: tbBlogPosts.isPublished,
        publishedAt: tbBlogPosts.publishedAt,
        viewCount: tbBlogPosts.viewCount,
        deletedAt: tbBlogPosts.deletedAt,
        createdAt: tbBlogPosts.createdAt,
        updatedAt: tbBlogPosts.updatedAt,
        author: {
          id: tbUsers.id,
          name: tbUsers.name,
        },
      })
      .from(tbBlogPosts)
      .leftJoin(tbUsers, eq(tbBlogPosts.authorId, tbUsers.id))
      .where(and(eq(tbBlogPosts.id, id), isNull(tbBlogPosts.deletedAt)));

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    return {
      ...event,
      eventDate: this.normalizeDate(event.eventDate),
      publishedAt: this.normalizeDate(event.publishedAt),
      createdAt: this.normalizeDate(event.createdAt),
      updatedAt: this.normalizeDate(event.updatedAt),
    };
  }

  async findEventBySlug(slug: string) {
    const [event] = await this.db
      .select({
        id: tbBlogPosts.id,
        title: tbBlogPosts.title,
        slug: tbBlogPosts.slug,
        description: tbBlogPosts.content,
        summary: tbBlogPosts.excerpt,
        imageUrl: tbBlogPosts.coverImage,
        eventDate: tbBlogPosts.eventDate,
        eventTime: tbBlogPosts.eventTime,
        location: tbBlogPosts.location,
        hideLocation: tbBlogPosts.hideLocation,
        requireAttendance: tbBlogPosts.requireAttendance,
        isPublished: tbBlogPosts.isPublished,
        publishedAt: tbBlogPosts.publishedAt,
        viewCount: tbBlogPosts.viewCount,
        createdAt: tbBlogPosts.createdAt,
        updatedAt: tbBlogPosts.updatedAt,
        author: {
          id: tbUsers.id,
          name: tbUsers.name,
        },
      })
      .from(tbBlogPosts)
      .leftJoin(tbUsers, eq(tbBlogPosts.authorId, tbUsers.id))
      .where(
        and(
          eq(tbBlogPosts.slug, slug),
          isNull(tbBlogPosts.deletedAt),
          eq(tbBlogPosts.isPublished, true),
        ),
      );

    if (!event) {
      // Fallback: eventos pessoais aprovados (slug: personal-<id>)
      if (slug.startsWith('personal-')) {
        const personalId = slug.replace('personal-', '');
        const [personal] = await this.db
          .select({
            id: tbPersonalEvents.id,
            title: tbPersonalEvents.title,
            description: tbPersonalEvents.description,
            eventDate: tbPersonalEvents.eventDate,
            eventTime: tbPersonalEvents.eventTime,
            location: tbPersonalEvents.location,
            hideLocation: tbPersonalEvents.hideLocation,
            createdAt: tbPersonalEvents.createdAt,
            updatedAt: tbPersonalEvents.updatedAt,
            userId: tbPersonalEvents.userId,
            authorName: tbUsers.name,
          })
          .from(tbPersonalEvents)
          .leftJoin(tbUsers, eq(tbPersonalEvents.userId, tbUsers.id))
          .where(
            and(
              eq(tbPersonalEvents.id, personalId),
              eq(tbPersonalEvents.isPublic, true),
            ),
          );

        if (personal) {
          return {
            id: personal.id,
            title: personal.title,
            slug,
            description: personal.description ?? '',
            summary:
              personal.description && personal.description.length > 240
                ? `${personal.description.slice(0, 237)}...`
                : personal.description ?? null,
            imageUrl: null,
            eventDate: this.normalizeDate(personal.eventDate),
            eventTime: personal.eventTime ? String(personal.eventTime) : null,
            location: personal.location,
            hideLocation: personal.hideLocation,
            requireAttendance: false,
            isPublished: true,
            publishedAt: this.normalizeDate(personal.createdAt),
            viewCount: 0,
            createdAt: this.normalizeDate(personal.createdAt),
            updatedAt: this.normalizeDate(personal.updatedAt),
            author: {
              id: personal.userId,
              name: personal.authorName ?? 'Aluno',
            },
          };
        }
      }

      throw new NotFoundException('Evento nao encontrado');
    }

    await this.db
      .update(tbBlogPosts)
      .set({ viewCount: event.viewCount + 1 })
      .where(eq(tbBlogPosts.id, event.id));

    return {
      ...event,
      eventDate: this.normalizeDate(event.eventDate),
      publishedAt: this.normalizeDate(event.publishedAt),
      createdAt: this.normalizeDate(event.createdAt),
      updatedAt: this.normalizeDate(event.updatedAt),
    };
  }

  async createEvent(dto: CreateEventDto, authorId: string) {
    const clean = (value?: string) =>
      typeof value === 'string' ? value.trim() : value;

    const slugBase = this.generateSlug(dto.title);
    const finalSlug = await this.ensureUniqueSlug(slugBase);

    const description = clean(dto.description) ?? '';
    const summary =
      description.length > 240
        ? `${description.slice(0, 237)}...`
        : description;

    const [event] = await this.db
      .insert(tbBlogPosts)
      .values({
        title: clean(dto.title) ?? dto.title,
        slug: finalSlug,
        excerpt: summary,
        content: description,
        coverImage: clean(dto.imageUrl) || null,
        authorId,
        eventDate: dto.date,
        eventTime: clean(dto.time) || null,
        location: clean(dto.location) || null,
        hideLocation: dto.hideLocation ?? false,
        requireAttendance: dto.requireAttendance ?? false,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
        metaTitle: clean(dto.title) ?? dto.title,
        metaDescription: summary,
      })
      .returning();

    return event;
  }

  async updateEvent(id: string, dto: UpdateEventDto) {
    const clean = (value?: string) =>
      typeof value === 'string' ? value.trim() : value;

    const event = await this.findEvent(id);
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) {
      const cleanedTitle = clean(dto.title) ?? '';
      updateData.title = cleanedTitle;
      const slugBase = this.generateSlug(cleanedTitle);
      updateData.slug = await this.ensureUniqueSlug(slugBase, id);
      updateData.metaTitle = cleanedTitle;
    }

    if (dto.description !== undefined) {
      const description = clean(dto.description) ?? '';
      updateData.content = description;
      updateData.excerpt =
        description.length > 240
          ? `${description.slice(0, 237)}...`
          : description;
      updateData.metaDescription = updateData.excerpt;
    }

    if (dto.imageUrl !== undefined) {
      updateData.coverImage = clean(dto.imageUrl) || null;
    }

    if (dto.date !== undefined) {
      updateData.eventDate = dto.date;
    }

    if (dto.time !== undefined) {
      updateData.eventTime = clean(dto.time) || null;
    }

    if (dto.location !== undefined) {
      updateData.location = clean(dto.location) || null;
    }

    if (dto.hideLocation !== undefined) {
      updateData.hideLocation = dto.hideLocation;
    }

    if (dto.requireAttendance !== undefined) {
      updateData.requireAttendance = dto.requireAttendance;
    }

    if (dto.isPublished !== undefined) {
      updateData.isPublished = dto.isPublished;
      if (dto.isPublished && !event.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const [updated] = await this.db
      .update(tbBlogPosts)
      .set(updateData)
      .where(eq(tbBlogPosts.id, id))
      .returning();

    return updated;
  }

  async softDeleteEvent(id: string) {
    await this.findEvent(id);

    const [deleted] = await this.db
      .update(tbBlogPosts)
      .set({ deletedAt: new Date() })
      .where(eq(tbBlogPosts.id, id))
      .returning();

    return deleted;
  }

  async restoreEvent(id: string) {
    const [event] = await this.db
      .select()
      .from(tbBlogPosts)
      .where(eq(tbBlogPosts.id, id));

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    const [restored] = await this.db
      .update(tbBlogPosts)
      .set({ deletedAt: null })
      .where(eq(tbBlogPosts.id, id))
      .returning();

    return restored;
  }

  async publishEvent(id: string) {
    const event = await this.findEvent(id);

    if (event.isPublished) {
      throw new ConflictException('Este evento ja esta publicado');
    }

    const [published] = await this.db
      .update(tbBlogPosts)
      .set({
        isPublished: true,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tbBlogPosts.id, id))
      .returning();

    return published;
  }

  async unpublishEvent(id: string) {
    const event = await this.findEvent(id);

    if (!event.isPublished) {
      throw new ConflictException('Este evento nao esta publicado');
    }

    const [unpublished] = await this.db
      .update(tbBlogPosts)
      .set({
        isPublished: false,
        updatedAt: new Date(),
      })
      .where(eq(tbBlogPosts.id, id))
      .returning();

    return unpublished;
  }

  async confirmAttendance(slug: string, dto: ConfirmAttendanceDto) {
    const [event] = await this.db
      .select({
        id: tbBlogPosts.id,
        title: tbBlogPosts.title,
        slug: tbBlogPosts.slug,
        requireAttendance: tbBlogPosts.requireAttendance,
        isPublished: tbBlogPosts.isPublished,
        deletedAt: tbBlogPosts.deletedAt,
      })
      .from(tbBlogPosts)
      .where(
        and(
          eq(tbBlogPosts.slug, slug),
          eq(tbBlogPosts.isPublished, true),
          isNull(tbBlogPosts.deletedAt),
        ),
      );

    if (!event) {
      throw new NotFoundException('Evento nao encontrado ou nao publicado');
    }

    if (!event.requireAttendance) {
      throw new ConflictException(
        'Este evento nao requer confirmacao de presenca',
      );
    }

    const [record] = await this.db
      .insert(tbEventAttendance)
      .values({
        eventId: event.id,
        name: dto.name.trim(),
        email: dto.email?.trim() || null,
      })
      .returning();

    return {
      success: true,
      attendanceId: record.id,
    };
  }

  async getAttendanceList(eventId: string) {
    await this.findEvent(eventId);

    const rows = await this.db
      .select({
        id: tbEventAttendance.id,
        name: tbEventAttendance.name,
        email: tbEventAttendance.email,
        confirmedAt: tbEventAttendance.confirmedAt,
      })
      .from(tbEventAttendance)
      .where(eq(tbEventAttendance.eventId, eventId))
      .orderBy(asc(tbEventAttendance.confirmedAt));

    return rows.map((row) => ({
      ...row,
      confirmedAt: this.normalizeDate(row.confirmedAt),
    }));
  }

  async getAttendanceReportPdf(eventId: string) {
    const event = await this.findEvent(eventId);

    const attendance = await this.db
      .select({
        name: tbEventAttendance.name,
        email: tbEventAttendance.email,
        confirmedAt: tbEventAttendance.confirmedAt,
      })
      .from(tbEventAttendance)
      .where(eq(tbEventAttendance.eventId, eventId))
      .orderBy(asc(tbEventAttendance.confirmedAt));

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.fontSize(18).text(`Relatorio de Presenca - ${event.title}`, {
      align: 'center',
    });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Data do evento: ${event.eventDate}`);
    doc.moveDown(0.5);
    doc.text(`Total de confirmacoes: ${attendance.length}`);
    doc.moveDown(1);

    doc.fontSize(13).text('Confirmacoes:', { underline: true });
    doc.moveDown(0.5);

    attendance.forEach((a, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${a.name} ${
            a.email ? `<${a.email}>` : ''
          } - ${new Date(a.confirmedAt).toLocaleString('pt-BR')}`,
        );
    });

    if (attendance.length === 0) {
      doc.fontSize(12).text('Nenhuma confirmacao registrada ainda.');
    }

    doc.end();

    const buffer: Buffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));
    });

    const filename = `relatorio-presencas-${event.slug}.pdf`;

    return { buffer, filename };
  }

  async getCalendarData() {
    const events = await this.findAllEvents({ publishedOnly: true });

    type EventItem = Awaited<
      ReturnType<EventsService['findAllEvents']>
    >[number];

    // Incluir eventos pessoais aprovados/publicos como fallback
    const personalEvents = await this.db
      .select({
        id: tbPersonalEvents.id,
        title: tbPersonalEvents.title,
        description: tbPersonalEvents.description,
        eventDate: tbPersonalEvents.eventDate,
        eventTime: tbPersonalEvents.eventTime,
        location: tbPersonalEvents.location,
        hideLocation: tbPersonalEvents.hideLocation,
        createdAt: tbPersonalEvents.createdAt,
        updatedAt: tbPersonalEvents.updatedAt,
        userId: tbPersonalEvents.userId,
        userName: tbUsers.name,
      })
      .from(tbPersonalEvents)
      .leftJoin(tbUsers, eq(tbPersonalEvents.userId, tbUsers.id))
      .where(eq(tbPersonalEvents.isPublic, true));

    const existingSlugs = new Set(events.map((e) => e.slug));
    const mappedPersonal = personalEvents
      .map<EventItem | null>((e) => {
        const slug = `personal-${e.id}`;
        if (existingSlugs.has(slug)) return null;
        return {
          id: e.id,
          title: e.title,
          slug,
          description: e.description,
          summary: e.description
            ? e.description.length > 240
              ? `${e.description.slice(0, 237)}...`
              : e.description
            : null,
          imageUrl: null,
          eventDate: this.normalizeDate(e.eventDate),
          eventTime: e.eventTime ? String(e.eventTime) : null,
          location: e.location,
          hideLocation: e.hideLocation,
          requireAttendance: false,
          isPublished: true,
          publishedAt: this.normalizeDate(e.createdAt),
          viewCount: 0,
          createdAt: this.normalizeDate(e.createdAt),
          updatedAt: this.normalizeDate(e.updatedAt),
          author: {
            id: e.userId,
            name: e.userName ?? 'Aluno',
          },
        };
      })
      .filter((item): item is EventItem => Boolean(item));

    const combinedEvents = [...events, ...mappedPersonal];

    const birthdays = await this.db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        bornDate: tbPersonalData.bornDate,
      })
      .from(tbUsers)
      .innerJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(and(eq(tbUsers.isActive, true), isNull(tbUsers.deletedAt)));

    return { events: combinedEvents, birthdays };
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async ensureUniqueSlug(slug: string, currentId?: string) {
    let finalSlug = slug;
    let counter = 1;

    while (true) {
      const [existing] = await this.db
        .select({ id: tbBlogPosts.id })
        .from(tbBlogPosts)
        .where(eq(tbBlogPosts.slug, finalSlug));

      if (!existing || existing.id === currentId) {
        break;
      }

      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }
}
