import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../database/schema';
import { tbWaitlist, tbPlans } from '../database/schema';
import { eq, desc, and, ilike, or, inArray } from 'drizzle-orm';
import type { SQLWrapper } from 'drizzle-orm';
import {
  CreateWaitlistDto,
  UpdateWaitlistDto,
  QueryWaitlistDto,
  ConvertWaitlistDto,
  WaitlistStatus,
} from './dto/waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  async findAll(query: QueryWaitlistDto = {}) {
    const conditions: SQLWrapper[] = [];

    if (query.status) {
      conditions.push(eq(tbWaitlist.status, query.status));
    }

    if (query.planId) {
      conditions.push(eq(tbWaitlist.interestPlanId, query.planId));
    }

    if (query.search) {
      const searchConditions: SQLWrapper[] = [];
      if (query.search) {
        searchConditions.push(ilike(tbWaitlist.name, `%${query.search}%`));
        searchConditions.push(ilike(tbWaitlist.email, `%${query.search}%`));
        searchConditions.push(ilike(tbWaitlist.phone, `%${query.search}%`));
      }

      if (searchConditions.length > 0) {
        conditions.push(or(...searchConditions) as SQLWrapper);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const entries = await this.db
      .select({
        id: tbWaitlist.id,
        name: tbWaitlist.name,
        email: tbWaitlist.email,
        phone: tbWaitlist.phone,
        interestPlanId: tbWaitlist.interestPlanId,
        source: tbWaitlist.source,
        notes: tbWaitlist.notes,
        status: tbWaitlist.status,
        contactedAt: tbWaitlist.contactedAt,
        convertedAt: tbWaitlist.convertedAt,
        convertedToUserId: tbWaitlist.convertedToUserId,
        createdAt: tbWaitlist.createdAt,
        updatedAt: tbWaitlist.updatedAt,
        plan: {
          id: tbPlans.id,
          name: tbPlans.name,
          priceInCents: tbPlans.priceInCents,
        },
      })
      .from(tbWaitlist)
      .leftJoin(tbPlans, eq(tbWaitlist.interestPlanId, tbPlans.id))
      .where(whereClause)
      .orderBy(desc(tbWaitlist.createdAt));

    return entries;
  }

  async findPublic() {
    const visibleStatuses = [
      WaitlistStatus.PENDING,
      WaitlistStatus.WAITING,
    ] as const;

    const entries = await this.db
      .select({
        id: tbWaitlist.id,
        name: tbWaitlist.name,
        email: tbWaitlist.email,
        phone: tbWaitlist.phone,
        source: tbWaitlist.source,
        notes: tbWaitlist.notes,
        status: tbWaitlist.status,
        createdAt: tbWaitlist.createdAt,
        convertedAt: tbWaitlist.convertedAt,
        convertedToUserId: tbWaitlist.convertedToUserId,
      })
      .from(tbWaitlist)
      .where(inArray(tbWaitlist.status, visibleStatuses))
      .orderBy(tbWaitlist.createdAt);

    return entries;
  }

  async findOne(id: string) {
    const [entry] = await this.db
      .select({
        id: tbWaitlist.id,
        name: tbWaitlist.name,
        email: tbWaitlist.email,
        phone: tbWaitlist.phone,
        interestPlanId: tbWaitlist.interestPlanId,
        source: tbWaitlist.source,
        notes: tbWaitlist.notes,
        status: tbWaitlist.status,
        contactedAt: tbWaitlist.contactedAt,
        convertedAt: tbWaitlist.convertedAt,
        convertedToUserId: tbWaitlist.convertedToUserId,
        createdAt: tbWaitlist.createdAt,
        updatedAt: tbWaitlist.updatedAt,
        plan: {
          id: tbPlans.id,
          name: tbPlans.name,
          priceInCents: tbPlans.priceInCents,
        },
      })
      .from(tbWaitlist)
      .leftJoin(tbPlans, eq(tbWaitlist.interestPlanId, tbPlans.id))
      .where(eq(tbWaitlist.id, id));

    if (!entry) {
      throw new NotFoundException('Entrada na lista de espera não encontrada');
    }

    return entry;
  }

  async create(dto: CreateWaitlistDto) {
    // Verifica se o email já está na lista de espera com status pendente
    const [existing] = await this.db
      .select()
      .from(tbWaitlist)
      .where(
        and(
          eq(tbWaitlist.email, dto.email),
          inArray(tbWaitlist.status, [WaitlistStatus.PENDING, WaitlistStatus.WAITING]),
        ),
      );

    if (existing) {
      throw new ConflictException('Este email já está na lista de espera');
    }

    // Se tem plano de interesse, verifica se existe
    if (dto.interestPlanId) {
      const [plan] = await this.db
        .select()
        .from(tbPlans)
        .where(eq(tbPlans.id, dto.interestPlanId));

      if (!plan) {
        throw new NotFoundException('Plano não encontrado');
      }
    }

    const [entry] = await this.db
      .insert(tbWaitlist)
      .values({
        name: dto.name,
        email: dto.email,
        phone: dto.phone || null,
        interestPlanId: dto.interestPlanId || null,
        source: dto.source || null,
        notes: dto.notes || null,
        status: WaitlistStatus.WAITING,
      })
      .returning();

    return entry;
  }

  async update(id: string, dto: UpdateWaitlistDto) {
    await this.findOne(id);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone || null;
    if (dto.interestPlanId !== undefined)
      updateData.interestPlanId = dto.interestPlanId || null;
    if (dto.source !== undefined) updateData.source = dto.source || null;
    if (dto.notes !== undefined) updateData.notes = dto.notes || null;
    if (dto.status !== undefined) updateData.status = dto.status;

    const [updated] = await this.db
      .update(tbWaitlist)
      .set(updateData)
      .where(eq(tbWaitlist.id, id))
      .returning();

    return updated;
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.db.delete(tbWaitlist).where(eq(tbWaitlist.id, id));

    return { message: 'Entrada removida da lista de espera' };
  }

  async markContacted(id: string) {
    const entry = await this.findOne(id);

    if (entry.status === WaitlistStatus.CONVERTED) {
      throw new ConflictException('Esta entrada já foi convertida');
    }

    const [updated] = await this.db
      .update(tbWaitlist)
      .set({
        status: WaitlistStatus.CONTACTED,
        contactedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tbWaitlist.id, id))
      .returning();

    return updated;
  }

  async convert(id: string, dto: ConvertWaitlistDto) {
    const entry = await this.findOne(id);

    if (entry.status === WaitlistStatus.CONVERTED) {
      throw new ConflictException('Esta entrada já foi convertida');
    }

    // Após a matrícula, removemos a entrada da lista de espera
    await this.db.delete(tbWaitlist).where(eq(tbWaitlist.id, id));

    return {
      id,
      convertedToUserId: dto.studentId,
      status: WaitlistStatus.CONVERTED,
    };
  }

  async cancel(id: string) {
    const entry = await this.findOne(id);

    if (entry.status === WaitlistStatus.CONVERTED) {
      throw new ConflictException(
        'Não é possível cancelar uma entrada já convertida',
      );
    }

    const [updated] = await this.db
      .update(tbWaitlist)
      .set({
        status: WaitlistStatus.CANCELLED,
        updatedAt: new Date(),
      })
      .where(eq(tbWaitlist.id, id))
      .returning();

    return updated;
  }

  async getStats() {
    const all = await this.db.select().from(tbWaitlist);

    const stats = {
      total: all.length,
      pending: all.filter((e) => e.status === WaitlistStatus.PENDING).length,
      contacted: all.filter((e) => e.status === WaitlistStatus.CONTACTED)
        .length,
      converted: all.filter((e) => e.status === WaitlistStatus.CONVERTED)
        .length,
      cancelled: all.filter((e) => e.status === WaitlistStatus.CANCELLED)
        .length,
      conversionRate:
        all.length > 0
          ? (
              (all.filter((e) => e.status === WaitlistStatus.CONVERTED).length /
                all.length) *
              100
            ).toFixed(1) + '%'
          : '0%',
    };

    return stats;
  }
}
