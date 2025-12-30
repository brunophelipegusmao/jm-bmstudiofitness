import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { tbExpenses, tbUsers } from '../database/schema';
import { eq, desc, and, isNull, gte, lte, ilike, sql } from 'drizzle-orm';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  QueryExpensesDto,
} from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<any>,
  ) {}

  async findAll(query: QueryExpensesDto = {}) {
    const conditions: any[] = [isNull(tbExpenses.deletedAt)];

    if (query.category) {
      conditions.push(eq(tbExpenses.category, query.category));
    }

    if (query.startDate) {
      conditions.push(gte(tbExpenses.expenseDate, query.startDate));
    }

    if (query.endDate) {
      conditions.push(lte(tbExpenses.expenseDate, query.endDate));
    }

    if (query.search) {
      conditions.push(ilike(tbExpenses.description, `%${query.search}%`));
    }

    const expenses = await this.db
      .select({
        id: tbExpenses.id,
        description: tbExpenses.description,
        amountInCents: tbExpenses.amountInCents,
        category: tbExpenses.category,
        paymentMethod: tbExpenses.paymentMethod,
        expenseDate: tbExpenses.expenseDate,
        receipt: tbExpenses.receipt,
        notes: tbExpenses.notes,
        createdAt: tbExpenses.createdAt,
        updatedAt: tbExpenses.updatedAt,
        createdBy: {
          id: tbUsers.id,
          name: tbUsers.name,
        },
      })
      .from(tbExpenses)
      .innerJoin(tbUsers, eq(tbExpenses.createdBy, tbUsers.id))
      .where(and(...conditions))
      .orderBy(desc(tbExpenses.expenseDate));

    return expenses;
  }

  async findOne(id: string) {
    const [expense] = await this.db
      .select({
        id: tbExpenses.id,
        description: tbExpenses.description,
        amountInCents: tbExpenses.amountInCents,
        category: tbExpenses.category,
        paymentMethod: tbExpenses.paymentMethod,
        expenseDate: tbExpenses.expenseDate,
        receipt: tbExpenses.receipt,
        notes: tbExpenses.notes,
        createdAt: tbExpenses.createdAt,
        updatedAt: tbExpenses.updatedAt,
        createdBy: {
          id: tbUsers.id,
          name: tbUsers.name,
        },
      })
      .from(tbExpenses)
      .innerJoin(tbUsers, eq(tbExpenses.createdBy, tbUsers.id))
      .where(eq(tbExpenses.id, id));

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }

    return expense;
  }

  async create(dto: CreateExpenseDto, createdBy: string) {
    const [expense] = await this.db
      .insert(tbExpenses)
      .values({
        description: dto.description,
        amountInCents: dto.amountInCents,
        category: dto.category,
        paymentMethod: dto.paymentMethod || null,
        expenseDate: dto.expenseDate,
        receipt: dto.receipt || null,
        notes: dto.notes || null,
        createdBy,
      })
      .returning();

    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.findOne(id);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.amountInCents !== undefined)
      updateData.amountInCents = dto.amountInCents;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.paymentMethod !== undefined)
      updateData.paymentMethod = dto.paymentMethod || null;
    if (dto.expenseDate !== undefined) updateData.expenseDate = dto.expenseDate;
    if (dto.receipt !== undefined) updateData.receipt = dto.receipt || null;
    if (dto.notes !== undefined) updateData.notes = dto.notes || null;

    const [updated] = await this.db
      .update(tbExpenses)
      .set(updateData)
      .where(eq(tbExpenses.id, id))
      .returning();

    return updated;
  }

  async softDelete(id: string) {
    await this.findOne(id);

    const [deleted] = await this.db
      .update(tbExpenses)
      .set({ deletedAt: new Date() })
      .where(eq(tbExpenses.id, id))
      .returning();

    return deleted;
  }

  async getCategories() {
    const result = await this.db
      .selectDistinct({ category: tbExpenses.category })
      .from(tbExpenses)
      .where(isNull(tbExpenses.deletedAt))
      .orderBy(tbExpenses.category);

    return result.map((r) => r.category);
  }

  async getMonthlyReport(month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const expenses = await this.db
      .select()
      .from(tbExpenses)
      .where(
        and(
          isNull(tbExpenses.deletedAt),
          gte(tbExpenses.expenseDate, startDate),
          lte(tbExpenses.expenseDate, endDate),
        ),
      );

    // Agrupa por categoria
    const byCategory: Record<string, number> = {};
    let total = 0;

    for (const expense of expenses) {
      byCategory[expense.category] =
        (byCategory[expense.category] || 0) + expense.amountInCents;
      total += expense.amountInCents;
    }

    return {
      period: { month, year },
      total,
      byCategory,
      count: expenses.length,
    };
  }
}
