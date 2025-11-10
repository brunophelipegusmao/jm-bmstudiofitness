"use server";

import { and, count, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { financialTable, usersTable } from "@/db/schema";
import { isPaymentUpToDate } from "@/lib/payment-utils";
import { UserRole } from "@/types/user-roles";

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  paymentsUpToDate: number;
  pendingPayments: number;
  totalMonthlyRevenue: number;
  newStudentsThisMonth: number;
}

/**
 * Busca estatísticas do dashboard administrativo
 */
export async function getDashboardStatsAction(): Promise<{
  success: boolean;
  stats?: DashboardStats;
  error?: string;
}> {
  try {
    // Total de alunos (não deletados)
    const totalStudentsResult = await db
      .select({ count: count() })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.userRole, UserRole.ALUNO),
          isNull(usersTable.deletedAt),
        ),
      );

    const totalStudents = totalStudentsResult[0]?.count || 0;

    // Alunos com pagamentos em dia (paid = true e não deletados)
    const paymentsUpToDateResult = await db
      .select({ count: count() })
      .from(financialTable)
      .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
      .where(
        sql`${usersTable.userRole} = ${UserRole.ALUNO} AND ${financialTable.paid} = true AND ${usersTable.deletedAt} IS NULL`,
      );

    const paymentsUpToDate = paymentsUpToDateResult[0]?.count || 0;

    // Alunos com pagamentos pendentes (considerando data de vencimento)
    const pendingPaymentsResult = await db
      .select({
        userId: usersTable.id,
        dueDate: financialTable.dueDate,
        lastPaymentDate: financialTable.lastPaymentDate,
        paid: financialTable.paid,
      })
      .from(usersTable)
      .leftJoin(financialTable, eq(financialTable.userId, usersTable.id))
      .where(
        and(
          eq(usersTable.userRole, UserRole.ALUNO),
          isNull(usersTable.deletedAt),
        ),
      );

    const pendingPayments = pendingPaymentsResult.filter((payment) => {
      // Se não tem dados financeiros, considera como pendente
      if (!payment.dueDate || payment.paid === null) {
        return true;
      }
      return !isPaymentUpToDate(
        payment.dueDate,
        payment.lastPaymentDate,
        payment.paid,
      );
    }).length;

    // Receita mensal total (soma de todas as mensalidades de alunos não deletados)
    const totalRevenueResult = await db
      .select({
        total: sql<number>`SUM(${financialTable.monthlyFeeValueInCents})`,
      })
      .from(financialTable)
      .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
      .where(
        sql`${usersTable.userRole} = ${UserRole.ALUNO} AND ${usersTable.deletedAt} IS NULL`,
      );

    const totalMonthlyRevenue = totalRevenueResult[0]?.total || 0;

    // Novos alunos neste mês (não deletados)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayStr = firstDayOfMonth.toISOString().split("T")[0];

    const newStudentsResult = await db
      .select({ count: count() })
      .from(usersTable)
      .where(
        sql`${usersTable.userRole} = ${UserRole.ALUNO} AND ${usersTable.createdAt} >= ${firstDayStr} AND ${usersTable.deletedAt} IS NULL`,
      );

    const newStudentsThisMonth = newStudentsResult[0]?.count || 0;

    // Alunos ativos (considerando todos os alunos cadastrados - futuramente pode usar campo isActive)
    const activeStudents = totalStudents;

    return {
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        paymentsUpToDate,
        pendingPayments,
        totalMonthlyRevenue,
        newStudentsThisMonth,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    return {
      success: false,
      error: "Erro ao carregar estatísticas",
    };
  }
}
