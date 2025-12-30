import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { tbPlans } from '../database/schema';
import { eq, desc, and, isNull, asc } from 'drizzle-orm';
import { CreatePlanDto, UpdatePlanDto, QueryPlansDto } from './dto/plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<any>,
  ) {}

  async findAll(query: QueryPlansDto = {}) {
    const conditions: any[] = [];

    // Por padrão, não retorna deletados
    if (!query.includeDeleted) {
      conditions.push(isNull(tbPlans.deletedAt));
    }

    // Por padrão em queries públicas, retorna apenas ativos
    if (query.activeOnly) {
      conditions.push(eq(tbPlans.isActive, true));
    }

    const plans = await this.db
      .select()
      .from(tbPlans)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(tbPlans.sortOrder), desc(tbPlans.createdAt));

    return plans;
  }

  async findOne(id: string) {
    const [plan] = await this.db
      .select()
      .from(tbPlans)
      .where(eq(tbPlans.id, id));

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    return plan;
  }

  async findActive() {
    const plans = await this.db
      .select()
      .from(tbPlans)
      .where(and(isNull(tbPlans.deletedAt), eq(tbPlans.isActive, true)))
      .orderBy(asc(tbPlans.sortOrder));

    return plans;
  }

  async create(dto: CreatePlanDto) {
    // Se não foi informado sortOrder, pega o próximo disponível
    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const [lastPlan] = await this.db
        .select({ sortOrder: tbPlans.sortOrder })
        .from(tbPlans)
        .orderBy(desc(tbPlans.sortOrder))
        .limit(1);

      sortOrder = lastPlan ? lastPlan.sortOrder + 1 : 0;
    }

    const [plan] = await this.db
      .insert(tbPlans)
      .values({
        name: dto.name,
        description: dto.description || null,
        priceInCents: dto.priceInCents,
        durationInDays: dto.durationInDays,
        features: dto.features || [],
        isPopular: dto.isPopular ?? false,
        isActive: dto.isActive ?? true,
        sortOrder,
      })
      .returning();

    return plan;
  }

  async update(id: string, dto: UpdatePlanDto) {
    await this.findOne(id);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined)
      updateData.description = dto.description || null;
    if (dto.priceInCents !== undefined)
      updateData.priceInCents = dto.priceInCents;
    if (dto.durationInDays !== undefined)
      updateData.durationInDays = dto.durationInDays;
    if (dto.features !== undefined) updateData.features = dto.features;
    if (dto.isPopular !== undefined) updateData.isPopular = dto.isPopular;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

    const [updated] = await this.db
      .update(tbPlans)
      .set(updateData)
      .where(eq(tbPlans.id, id))
      .returning();

    return updated;
  }

  async softDelete(id: string) {
    await this.findOne(id);

    const [deleted] = await this.db
      .update(tbPlans)
      .set({ deletedAt: new Date() })
      .where(eq(tbPlans.id, id))
      .returning();

    return deleted;
  }

  async restore(id: string) {
    const [plan] = await this.db
      .select()
      .from(tbPlans)
      .where(eq(tbPlans.id, id));

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    const [restored] = await this.db
      .update(tbPlans)
      .set({ deletedAt: null })
      .where(eq(tbPlans.id, id))
      .returning();

    return restored;
  }

  async toggleActive(id: string) {
    const plan = await this.findOne(id);

    const [updated] = await this.db
      .update(tbPlans)
      .set({
        isActive: !plan.isActive,
        updatedAt: new Date(),
      })
      .where(eq(tbPlans.id, id))
      .returning();

    return updated;
  }

  async togglePopular(id: string) {
    const plan = await this.findOne(id);

    const [updated] = await this.db
      .update(tbPlans)
      .set({
        isPopular: !plan.isPopular,
        updatedAt: new Date(),
      })
      .where(eq(tbPlans.id, id))
      .returning();

    return updated;
  }

  async reorder(planIds: string[]) {
    const updates = planIds.map((id, index) =>
      this.db
        .update(tbPlans)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(eq(tbPlans.id, id)),
    );

    await Promise.all(updates);

    return { message: 'Ordem atualizada com sucesso' };
  }
}
