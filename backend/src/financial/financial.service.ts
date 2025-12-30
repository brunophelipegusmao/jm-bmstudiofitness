import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc,eq, gte, lte, sql } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { tbFinancial, tbUsers, UserRole } from '../database/schema';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { QueryFinancialDto } from './dto/query-financial.dto';
import { MarkAsPaidDto,UpdateFinancialDto } from './dto/update-financial.dto';

@Injectable()
export class FinancialService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<any>,
  ) {}

  /**
   * Criar registro financeiro (ADMIN/MASTER)
   */
  async create(createFinancialDto: CreateFinancialDto) {
    // Verificar se usuário existe
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, createFinancialDto.userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const insertData = {
      userId: createFinancialDto.userId,
      monthlyFeeValue: createFinancialDto.monthlyFeeValue,
      dueDate: createFinancialDto.dueDate,
      paid: createFinancialDto.paid || false,
      ...(createFinancialDto.paymentMethod && {
        paymentMethod: createFinancialDto.paymentMethod,
      }),
      ...(createFinancialDto.lastPaymentDate && {
        lastPaymentDate: createFinancialDto.lastPaymentDate,
      }),
    } as typeof tbFinancial.$inferInsert;

    const [financial] = await this.db
      .insert(tbFinancial)
      .values(insertData)
      .returning();

    return financial;
  }

  /**
   * Listar registros financeiros com filtros
   */
  async findAll(
    queryDto: QueryFinancialDto,
    requestingUserId: string,
    userRole: UserRole,
  ) {
    const { userId, paid, startDate, endDate, page = 1, limit = 10 } = queryDto;
    const offset = (page - 1) * limit;

    // Se for aluno, só pode ver próprios registros
    const targetUserId =
      userRole === UserRole.ALUNO ? requestingUserId : userId;

    // Construir condições
    const conditions: any[] = [];
    if (targetUserId) {
      conditions.push(eq(tbFinancial.userId, targetUserId));
    }
    if (paid !== undefined) {
      conditions.push(eq(tbFinancial.paid, paid));
    }
    if (startDate) {
      conditions.push(gte(tbFinancial.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(tbFinancial.createdAt, endDate));
    }

    const whereClause =
      conditions.length > 0 ? and(...(conditions as any[])) : undefined;

    // Query principal
    const records = await this.db
      .select({
        id: tbFinancial.id,
        userId: tbFinancial.userId,
        monthlyFeeValue: tbFinancial.monthlyFeeValue,
        dueDate: tbFinancial.dueDate,
        paid: tbFinancial.paid,
        paymentMethod: tbFinancial.paymentMethod,
        lastPaymentDate: tbFinancial.lastPaymentDate,
        createdAt: tbFinancial.createdAt,
        updatedAt: tbFinancial.updatedAt,
        userName: tbUsers.name,
      })
      .from(tbFinancial)
      .leftJoin(tbUsers, eq(tbFinancial.userId, tbUsers.id))
      .where(whereClause)
      .orderBy(desc(tbFinancial.createdAt))
      .limit(limit)
      .offset(offset);

    // Contar total
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(tbFinancial)
      .where(whereClause);

    return {
      data: records,
      meta: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  /**
   * Buscar registro por ID
   */
  async findOne(id: string, requestingUserId: string, userRole: UserRole) {
    const [financial] = await this.db
      .select({
        id: tbFinancial.id,
        userId: tbFinancial.userId,
        monthlyFeeValue: tbFinancial.monthlyFeeValue,
        dueDate: tbFinancial.dueDate,
        paid: tbFinancial.paid,
        paymentMethod: tbFinancial.paymentMethod,
        lastPaymentDate: tbFinancial.lastPaymentDate,
        createdAt: tbFinancial.createdAt,
        updatedAt: tbFinancial.updatedAt,
        userName: tbUsers.name,
      })
      .from(tbFinancial)
      .leftJoin(tbUsers, eq(tbFinancial.userId, tbUsers.id))
      .where(eq(tbFinancial.id, id))
      .limit(1);

    if (!financial) {
      throw new NotFoundException('Registro financeiro não encontrado');
    }

    // Aluno só pode ver próprios registros
    if (userRole === UserRole.ALUNO && financial.userId !== requestingUserId) {
      throw new ForbiddenException('Acesso negado');
    }

    return financial;
  }

  /**
   * Buscar registros por usuário
   */
  async findByUser(
    userId: string,
    requestingUserId: string,
    userRole: UserRole,
  ) {
    // Aluno só pode ver próprios registros
    if (userRole === UserRole.ALUNO && userId !== requestingUserId) {
      throw new ForbiddenException('Acesso negado');
    }

    const records = await this.db
      .select()
      .from(tbFinancial)
      .where(eq(tbFinancial.userId, userId))
      .orderBy(desc(tbFinancial.createdAt));

    return records;
  }

  /**
   * Atualizar registro financeiro
   */
  async update(id: string, updateFinancialDto: UpdateFinancialDto) {
    const [existing] = await this.db
      .select()
      .from(tbFinancial)
      .where(eq(tbFinancial.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Registro financeiro não encontrado');
    }

    const [updated] = await this.db
      .update(tbFinancial)
      .set({
        ...updateFinancialDto,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tbFinancial.id, id))
      .returning();

    return updated;
  }

  /**
   * Marcar como pago
   */
  async markAsPaid(id: string, markAsPaidDto: MarkAsPaidDto) {
    const [existing] = await this.db
      .select()
      .from(tbFinancial)
      .where(eq(tbFinancial.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Registro financeiro não encontrado');
    }

    const paymentDate =
      markAsPaidDto.paymentDate || new Date().toISOString().split('T')[0];

    const [updated] = await this.db
      .update(tbFinancial)
      .set({
        paid: true,
        paymentMethod: markAsPaidDto.paymentMethod,
        lastPaymentDate: paymentDate,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tbFinancial.id, id))
      .returning();

    return updated;
  }

  /**
   * Soft delete de registro (apenas MASTER)
   */
  async remove(id: string) {
    const [existing] = await this.db
      .select()
      .from(tbFinancial)
      .where(eq(tbFinancial.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Registro financeiro não encontrado');
    }

    // Como não temos deletedAt em tbFinancial, vamos fazer delete real
    // Ou podemos adicionar o campo na migration
    await this.db.delete(tbFinancial).where(eq(tbFinancial.id, id));

    return { message: 'Registro financeiro deletado com sucesso' };
  }

  /**
   * Relatório mensal
   */
  async getMonthlyReport(year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const records = await this.db
      .select({
        total: sql<number>`count(*)`,
        totalPaid: sql<number>`count(*) filter (where ${tbFinancial.paid} = true)`,
        totalUnpaid: sql<number>`count(*) filter (where ${tbFinancial.paid} = false)`,
        totalRevenue: sql<number>`sum(case when ${tbFinancial.paid} = true then ${tbFinancial.monthlyFeeValue} else 0 end)`,
        expectedRevenue: sql<number>`sum(${tbFinancial.monthlyFeeValue})`,
      })
      .from(tbFinancial)
      .where(
        and(
          gte(tbFinancial.lastPaymentDate, startDate),
          lte(tbFinancial.lastPaymentDate, endDate),
        ),
      );

    return records[0];
  }
}
