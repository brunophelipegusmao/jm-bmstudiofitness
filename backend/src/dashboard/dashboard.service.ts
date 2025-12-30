import { Injectable } from '@nestjs/common';
import { and, count, eq, gte, lte, sql } from 'drizzle-orm';

import { db } from '../database/db';
import {
  tbCheckIns,
  tbFinancial,
  tbPersonalData,
  tbUsers,
  UserRole,
} from '../database/schema';

@Injectable()
export class DashboardService {
  /**
   * Estatísticas resumidas para o dashboard
   */
  async getStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    // Total de alunos ativos
    const [studentsResult] = await db
      .select({ count: count() })
      .from(tbUsers)
      .where(
        and(
          eq(tbUsers.userRole, UserRole.ALUNO),
          eq(tbUsers.isActive, true),
          sql`${tbUsers.deletedAt} IS NULL`,
        ),
      );
    const totalStudents = studentsResult?.count ?? 0;

    // Total de funcionários e coaches
    const [staffResult] = await db
      .select({ count: count() })
      .from(tbUsers)
      .where(
        and(
          sql`${tbUsers.userRole} IN ('funcionario', 'coach', 'admin')`,
          eq(tbUsers.isActive, true),
          sql`${tbUsers.deletedAt} IS NULL`,
        ),
      );
    const totalStaff = staffResult?.count ?? 0;

    // Check-ins de hoje
    const [todayCheckInsResult] = await db
      .select({ count: count() })
      .from(tbCheckIns)
      .where(eq(tbCheckIns.checkInDate, todayStr));
    const todayCheckIns = todayCheckInsResult?.count ?? 0;

    // Check-ins do mês
    const [monthCheckInsResult] = await db
      .select({ count: count() })
      .from(tbCheckIns)
      .where(
        and(
          gte(tbCheckIns.checkInDate, startOfMonthStr),
          lte(tbCheckIns.checkInDate, todayStr),
        ),
      );
    const monthCheckIns = monthCheckInsResult?.count ?? 0;

    // Pagamentos pendentes
    const [pendingPaymentsResult] = await db
      .select({ count: count() })
      .from(tbFinancial)
      .where(eq(tbFinancial.paid, false));
    const pendingPayments = pendingPaymentsResult?.count ?? 0;

    // Pagamentos recebidos este mês
    const [paidThisMonthResult] = await db
      .select({
        count: count(),
        total: sql<number>`COALESCE(SUM(${tbFinancial.monthlyFeeValue}), 0)`,
      })
      .from(tbFinancial)
      .where(
        and(
          eq(tbFinancial.paid, true),
          gte(tbFinancial.lastPaymentDate, startOfMonthStr),
        ),
      );
    const paidThisMonth = paidThisMonthResult?.count ?? 0;
    const revenueThisMonth = paidThisMonthResult?.total ?? 0;

    return {
      students: {
        total: totalStudents,
        label: 'Alunos Ativos',
      },
      staff: {
        total: totalStaff,
        label: 'Equipe',
      },
      checkIns: {
        today: todayCheckIns,
        month: monthCheckIns,
        label: 'Check-ins',
      },
      financial: {
        pending: pendingPayments,
        paidThisMonth,
        revenueThisMonth, // Em centavos
        revenueFormatted: `R$ ${(revenueThisMonth / 100).toFixed(2).replace('.', ',')}`,
        label: 'Financeiro',
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Dados detalhados do dashboard (inclui listas)
   */
  async getDetailedStats() {
    const stats = await this.getStats();

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Últimos 5 check-ins de hoje
    const recentCheckIns = await db
      .select({
        id: tbCheckIns.id,
        checkInTime: tbCheckIns.checkInTime,
        method: tbCheckIns.method,
        userName: tbUsers.name,
      })
      .from(tbCheckIns)
      .innerJoin(tbUsers, eq(tbCheckIns.userId, tbUsers.id))
      .where(eq(tbCheckIns.checkInDate, todayStr))
      .orderBy(sql`${tbCheckIns.checkInTime} DESC`)
      .limit(5);

    // Pagamentos pendentes (próximos a vencer)
    const pendingPayments = await db
      .select({
        id: tbFinancial.id,
        monthlyFeeValue: tbFinancial.monthlyFeeValue,
        dueDate: tbFinancial.dueDate,
        userName: tbUsers.name,
        userEmail: tbPersonalData.email,
      })
      .from(tbFinancial)
      .innerJoin(tbUsers, eq(tbFinancial.userId, tbUsers.id))
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(eq(tbFinancial.paid, false))
      .orderBy(tbFinancial.dueDate)
      .limit(10);

    // Alunos recentes (últimos 5 cadastrados)
    const recentStudents = await db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        createdAt: tbUsers.createdAt,
        email: tbPersonalData.email,
      })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(
        and(
          eq(tbUsers.userRole, UserRole.ALUNO),
          sql`${tbUsers.deletedAt} IS NULL`,
        ),
      )
      .orderBy(sql`${tbUsers.createdAt} DESC`)
      .limit(5);

    return {
      ...stats,
      recentCheckIns: recentCheckIns.map((c) => ({
        id: c.id,
        time: c.checkInTime,
        method: c.method,
        studentName: c.userName,
      })),
      pendingPayments: pendingPayments.map((p) => ({
        id: p.id,
        amount: p.monthlyFeeValue,
        amountFormatted: `R$ ${(p.monthlyFeeValue / 100).toFixed(2).replace('.', ',')}`,
        dueDate: p.dueDate,
        studentName: p.userName,
        studentEmail: p.userEmail,
      })),
      recentStudents: recentStudents.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        createdAt: s.createdAt,
      })),
    };
  }

  /**
   * Estatísticas de check-ins por período
   */
  async getCheckInStats(startDate?: string, endDate?: string) {
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];

    const start = startDate ?? defaultStartDate;
    const end = endDate ?? defaultEndDate;

    // Check-ins por dia no período
    const checkInsByDay = await db
      .select({
        date: tbCheckIns.checkInDate,
        count: count(),
      })
      .from(tbCheckIns)
      .where(
        and(
          gte(tbCheckIns.checkInDate, start),
          lte(tbCheckIns.checkInDate, end),
        ),
      )
      .groupBy(tbCheckIns.checkInDate)
      .orderBy(tbCheckIns.checkInDate);

    // Check-ins por método
    const checkInsByMethod = await db
      .select({
        method: tbCheckIns.method,
        count: count(),
      })
      .from(tbCheckIns)
      .where(
        and(
          gte(tbCheckIns.checkInDate, start),
          lte(tbCheckIns.checkInDate, end),
        ),
      )
      .groupBy(tbCheckIns.method);

    // Total no período
    const [totalResult] = await db
      .select({ count: count() })
      .from(tbCheckIns)
      .where(
        and(
          gte(tbCheckIns.checkInDate, start),
          lte(tbCheckIns.checkInDate, end),
        ),
      );

    return {
      period: { start, end },
      total: totalResult?.count ?? 0,
      byDay: checkInsByDay,
      byMethod: checkInsByMethod,
    };
  }

  /**
   * Estatísticas financeiras por período
   */
  async getFinancialStats(startDate?: string, endDate?: string) {
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];

    const start = startDate ?? defaultStartDate;
    const end = endDate ?? defaultEndDate;

    // Pagamentos recebidos no período
    const [paidResult] = await db
      .select({
        count: count(),
        total: sql<number>`COALESCE(SUM(${tbFinancial.monthlyFeeValue}), 0)`,
      })
      .from(tbFinancial)
      .where(
        and(
          eq(tbFinancial.paid, true),
          gte(tbFinancial.lastPaymentDate, start),
          lte(tbFinancial.lastPaymentDate, end),
        ),
      );

    // Pagamentos por método
    const paymentsByMethod = await db
      .select({
        method: tbFinancial.paymentMethod,
        count: count(),
        total: sql<number>`COALESCE(SUM(${tbFinancial.monthlyFeeValue}), 0)`,
      })
      .from(tbFinancial)
      .where(
        and(
          eq(tbFinancial.paid, true),
          gte(tbFinancial.lastPaymentDate, start),
          lte(tbFinancial.lastPaymentDate, end),
        ),
      )
      .groupBy(tbFinancial.paymentMethod);

    // Pendentes
    const [pendingResult] = await db
      .select({
        count: count(),
        total: sql<number>`COALESCE(SUM(${tbFinancial.monthlyFeeValue}), 0)`,
      })
      .from(tbFinancial)
      .where(eq(tbFinancial.paid, false));

    return {
      period: { start, end },
      received: {
        count: paidResult?.count ?? 0,
        total: paidResult?.total ?? 0,
        totalFormatted: `R$ ${((paidResult?.total ?? 0) / 100).toFixed(2).replace('.', ',')}`,
      },
      pending: {
        count: pendingResult?.count ?? 0,
        total: pendingResult?.total ?? 0,
        totalFormatted: `R$ ${((pendingResult?.total ?? 0) / 100).toFixed(2).replace('.', ',')}`,
      },
      byMethod: paymentsByMethod.map((p) => ({
        method: p.method,
        count: p.count,
        total: p.total,
        totalFormatted: `R$ ${(p.total / 100).toFixed(2).replace('.', ',')}`,
      })),
    };
  }
}
