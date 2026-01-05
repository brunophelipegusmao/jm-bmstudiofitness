import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import type { SQLWrapper } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../database/schema';

import {
  tbExpenses,
  tbFinancial,
  tbPersonalData,
  tbUsers,
  UserRole,
} from '../database/schema';
import { sendEmail } from '../common/mailer';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { QueryFinancialDto } from './dto/query-financial.dto';
import { MarkAsPaidDto, UpdateFinancialDto } from './dto/update-financial.dto';

@Injectable()
export class FinancialService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<typeof schema>,
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
    const conditions: SQLWrapper[] = [];
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

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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
        userEmail: tbPersonalData.email,
        userPhone: tbPersonalData.telephone,
      })
      .from(tbFinancial)
      .leftJoin(tbUsers, eq(tbFinancial.userId, tbUsers.id))
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
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
        userEmail: tbPersonalData.email,
        userPhone: tbPersonalData.telephone,
      })
      .from(tbFinancial)
      .leftJoin(tbUsers, eq(tbFinancial.userId, tbUsers.id))
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
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
   * Enviar lembrete (placeholder para futura integração)
   */
  async remind(
    id: string,
    remindDto: {
      channel: 'email' | 'whatsapp';
      template: 'upcoming' | 'today' | 'blocked';
      message?: string;
    },
    userId: string,
  ) {
    const [existing] = await this.db
      .select({
        id: tbFinancial.id,
        userId: tbFinancial.userId,
        userName: tbUsers.name,
        userEmail: tbPersonalData.email,
        monthlyFeeValue: tbFinancial.monthlyFeeValue,
        dueDate: tbFinancial.dueDate,
        paid: tbFinancial.paid,
      })
      .from(tbFinancial)
      .leftJoin(tbUsers, eq(tbFinancial.userId, tbUsers.id))
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(eq(tbFinancial.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Registro financeiro não encontrado');
    }

    const channel = remindDto.channel ?? 'email';
    const amount = existing.monthlyFeeValue ?? 0;
    const formattedAmount = `R$ ${(amount / 100).toFixed(2).replace('.', ',')}`;
    const due =
      typeof existing.dueDate === 'number'
        ? `dia ${existing.dueDate}`
        : existing.dueDate ?? '';

    const templateTexts: Record<
      'upcoming' | 'today' | 'blocked',
      { subject: string; body: string }
    > = {
      upcoming: {
        subject: 'Sua mensalidade está próxima do vencimento',
        body: `Olá ${existing.userName ?? 'aluno(a)'}!

Notamos que sua mensalidade (${formattedAmount}) vence em breve (${due}). Para evitar bloqueio do check-in, pedimos que conclua o pagamento até o vencimento.

Qualquer dúvida, estamos à disposição.`,
      },
      today: {
        subject: 'Sua mensalidade vence hoje',
        body: `Olá ${existing.userName ?? 'aluno(a)'}!

Lembrando que sua mensalidade (${formattedAmount}) vence hoje (${due}). Assim que o pagamento for concluído, seu acesso permanece liberado normalmente.

Conte conosco se precisar de ajuda.`,
      },
      blocked: {
        subject: 'Regularize sua mensalidade para liberar o check-in',
        body: `Olá ${existing.userName ?? 'aluno(a)'}!

Identificamos que sua mensalidade (${formattedAmount}) está em aberto e o check-in foi temporariamente bloqueado. Por favor, regularize o pagamento referente a ${due} para restabelecer o acesso.

Se precisar de suporte ou parcelamento, fale com a nossa equipe.`,
      },
    };

    const template = templateTexts[remindDto.template];

    const response = {
      success: true,
      channel,
      to: existing.userEmail ?? null,
      subject: template.subject,
      body: remindDto.message ?? template.body,
      requestedBy: userId,
      financialId: id,
    };
    if (channel === 'email' && existing.userEmail) {
      const html = `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:24px;font-family:Arial,sans-serif;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#0b1221;border-radius:12px;overflow:hidden;border:1px solid #1e293b;">
                <tr>
                  <td style="padding:16px 20px;background:linear-gradient(90deg,#C2A537,#8a6b1f);color:#0b1221;font-weight:700;font-size:16px;">
                    JM Fitness Studio · Cobrança
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;color:#e2e8f0;font-size:14px;line-height:1.6">
                    <p style="margin:0 0 12px 0;">Olá ${existing.userName ?? 'aluno(a)'},</p>
                    ${(remindDto.message ?? template.body)
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => `<p style="margin:0 0 8px 0;">${line}</p>`)
                      .join('')}
                    <table cellpadding="8" cellspacing="0" style="margin-top:12px;background:#111827;border:1px solid #1e293b;border-radius:8px;color:#e2e8f0;font-size:13px;">
                      <tr>
                        <td>Valor</td>
                        <td style="color:#C2A537;font-weight:700;">${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td>Vencimento</td>
                        <td>${due}</td>
                      </tr>
                      <tr>
                        <td>Status</td>
                        <td>${existing.paid ? 'Pago' : 'Pendente'}</td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 0 0;color:#94a3b8;font-size:12px;">
                      Qualquer dúvida, responda este e-mail. Estamos à disposição.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 20px;background:#0f172a;color:#64748b;font-size:12px;">
                    JM Fitness Studio · Cobrança automática
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
      await sendEmail({
        to: existing.userEmail,
        subject: template.subject,
        text: remindDto.message ?? template.body,
        html,
      });
    }
    return response;
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

  /**
   * Relatório combinado (alunos/estúdio/geral)
   */
  async getFullReport(
    scope: 'alunos' | 'estudio' | 'geral',
    includePaid: boolean,
  ) {
    const includeStudents = scope === 'alunos' || scope === 'geral';
    const includeExpenses = scope === 'estudio' || scope === 'geral';

    let students: Array<Record<string, unknown>> = [];
    if (includeStudents) {
      const studentQuery = await this.db
        .select({
          id: tbFinancial.id,
          userId: tbFinancial.userId,
          name: tbUsers.name,
          email: tbPersonalData.email,
          monthlyFeeValue: tbFinancial.monthlyFeeValue,
          dueDate: tbFinancial.dueDate,
          paid: tbFinancial.paid,
          paymentMethod: tbFinancial.paymentMethod,
          lastPaymentDate: tbFinancial.lastPaymentDate,
          createdAt: tbFinancial.createdAt,
        })
        .from(tbFinancial)
        .leftJoin(tbUsers, eq(tbFinancial.userId, tbUsers.id))
        .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
        .where(includePaid ? undefined : eq(tbFinancial.paid, false))
        .orderBy(desc(tbFinancial.createdAt));

      students = studentQuery.map((s) => ({
        id: s.id,
        userId: s.userId,
        name: s.name,
        email: s.email,
        monthlyFeeValue: s.monthlyFeeValue,
        dueDate: s.dueDate,
        paid: s.paid,
        paymentMethod: s.paymentMethod,
        lastPaymentDate: s.lastPaymentDate,
        createdAt: s.createdAt,
      }));
    }

    let expenses: Array<Record<string, unknown>> = [];
    if (includeExpenses) {
      // Reusar service de despesas para obter todas
      const allExpenses = await this.db.query.tbExpenses.findMany();
      expenses = allExpenses.map((e) => ({
        id: e.id,
        description: e.description,
        category: e.category,
        amountInCents: e.amountInCents,
        expenseDate: e.expenseDate,
        paymentMethod: e.paymentMethod,
        notes: e.notes,
        receipt: e.receipt,
        createdBy: e.createdBy,
      }));
    }

    return {
      scope,
      students,
      expenses,
    };
  }
}
