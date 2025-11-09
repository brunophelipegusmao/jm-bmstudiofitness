"use server";

import { and, count, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { financialTable, usersTable } from "@/db/schema";
import { formatCurrency } from "@/lib/payment-utils";
import { UserRole } from "@/types/user-roles";

export interface RecentPayment {
  id: string;
  studentName: string;
  amount: string;
  date: string;
  status: "paid" | "pending" | "overdue";
  studentId: string;
}

export interface MonthlyData {
  month: string;
  students: number;
  revenue: number;
}

export interface FinancialReportData {
  overview: {
    totalStudents: number;
    activeStudents: number;
    totalRevenue: string;
    pendingPayments: string;
    monthlyGrowth: number;
    paymentRate: number;
  };
  recentPayments: RecentPayment[];
  monthlyData: MonthlyData[];
}

/**
 * Busca dados para relatórios financeiros
 */
export async function getFinancialReportsAction(): Promise<{
  success: boolean;
  data?: FinancialReportData;
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

    // Alunos ativos (com pagamento em dia)
    const activeStudentsResult = await db
      .select({ count: count() })
      .from(financialTable)
      .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
      .where(
        sql`${usersTable.userRole} = ${UserRole.ALUNO} AND ${financialTable.paid} = true AND ${usersTable.deletedAt} IS NULL`,
      );

    const activeStudents = activeStudentsResult[0]?.count || 0;

    // Receita total mensal
    const totalRevenueResult = await db
      .select({
        total: sql<number>`SUM(${financialTable.monthlyFeeValueInCents})`,
      })
      .from(financialTable)
      .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
      .where(
        sql`${usersTable.userRole} = ${UserRole.ALUNO} AND ${usersTable.deletedAt} IS NULL`,
      );

    const totalRevenueInCents = totalRevenueResult[0]?.total || 0;
    const totalRevenue = formatCurrency(totalRevenueInCents);

    // Pagamentos pendentes (soma dos valores não pagos)
    const pendingPaymentsResult = await db
      .select({
        total: sql<number>`SUM(${financialTable.monthlyFeeValueInCents})`,
      })
      .from(financialTable)
      .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
      .where(
        sql`${usersTable.userRole} = ${UserRole.ALUNO} AND ${financialTable.paid} = false AND ${usersTable.deletedAt} IS NULL`,
      );

    const pendingPaymentsInCents = pendingPaymentsResult[0]?.total || 0;
    const pendingPayments = formatCurrency(pendingPaymentsInCents);

    // Taxa de pagamento (percentual de alunos com pagamento em dia)
    const paymentRate =
      totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0;

    // Buscar alunos dos últimos 2 meses para calcular crescimento
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const lastMonthStudentsResult = await db
      .select({ count: count() })
      .from(usersTable)
      .where(
        sql`${usersTable.userRole} = ${UserRole.ALUNO} AND ${usersTable.createdAt} >= ${lastMonth.toISOString().split("T")[0]} AND ${usersTable.deletedAt} IS NULL`,
      );

    const twoMonthsAgoStudentsResult = await db
      .select({ count: count() })
      .from(usersTable)
      .where(
        sql`${usersTable.userRole} = ${UserRole.ALUNO} AND ${usersTable.createdAt} >= ${twoMonthsAgo.toISOString().split("T")[0]} AND ${usersTable.createdAt} < ${lastMonth.toISOString().split("T")[0]} AND ${usersTable.deletedAt} IS NULL`,
      );

    const lastMonthStudents = lastMonthStudentsResult[0]?.count || 0;
    const twoMonthsAgoStudents = twoMonthsAgoStudentsResult[0]?.count || 1; // Evitar divisão por zero

    const monthlyGrowth =
      ((lastMonthStudents - twoMonthsAgoStudents) / twoMonthsAgoStudents) * 100;

    // Pagamentos recentes (últimos 10)
    const recentPaymentsData = await db
      .select({
        userId: usersTable.id,
        studentName: usersTable.name,
        amount: financialTable.monthlyFeeValueInCents,
        lastPaymentDate: financialTable.lastPaymentDate,
        paid: financialTable.paid,
        dueDate: financialTable.dueDate,
        createdAt: usersTable.createdAt,
      })
      .from(financialTable)
      .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
      .where(
        and(
          eq(usersTable.userRole, UserRole.ALUNO),
          isNull(usersTable.deletedAt),
        ),
      )
      .orderBy(sql`${financialTable.lastPaymentDate} DESC NULLS LAST`)
      .limit(10);

    const recentPayments: RecentPayment[] = recentPaymentsData.map(
      (payment) => {
        const today = new Date();
        const dueDay = payment.dueDate;
        const currentDay = today.getDate();

        let status: "paid" | "pending" | "overdue" = "pending";

        if (payment.paid) {
          status = "paid";
        } else if (currentDay > dueDay) {
          status = "overdue";
        }

        return {
          id: payment.userId,
          studentId: payment.userId,
          studentName: payment.studentName,
          amount: formatCurrency(payment.amount),
          date: payment.lastPaymentDate || payment.createdAt,
          status,
        };
      },
    );

    // Dados mensais dos últimos 4 meses
    const monthlyData: MonthlyData[] = [];
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    for (let i = 3; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        1,
      );

      const monthStart = monthDate.toISOString().split("T")[0];
      const monthEnd = nextMonthDate.toISOString().split("T")[0];

      // Contar alunos criados neste mês
      const monthStudentsResult = await db
        .select({ count: count() })
        .from(usersTable)
        .where(
          sql`${usersTable.userRole} = ${UserRole.ALUNO} AND ${usersTable.createdAt} >= ${monthStart} AND ${usersTable.createdAt} < ${monthEnd} AND ${usersTable.deletedAt} IS NULL`,
        );

      const monthStudents = monthStudentsResult[0]?.count || 0;

      // Calcular receita do mês (alunos que pagaram neste mês)
      const monthRevenueResult = await db
        .select({
          total: sql<number>`SUM(${financialTable.monthlyFeeValueInCents})`,
        })
        .from(financialTable)
        .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
        .where(
          sql`${usersTable.userRole} = ${UserRole.ALUNO} AND ${financialTable.lastPaymentDate} >= ${monthStart} AND ${financialTable.lastPaymentDate} < ${monthEnd} AND ${usersTable.deletedAt} IS NULL`,
        );

      const monthRevenue = monthRevenueResult[0]?.total || 0;

      monthlyData.push({
        month: monthNames[monthDate.getMonth()],
        students: monthStudents,
        revenue: monthRevenue,
      });
    }

    return {
      success: true,
      data: {
        overview: {
          totalStudents,
          activeStudents,
          totalRevenue,
          pendingPayments,
          monthlyGrowth: Number(monthlyGrowth.toFixed(1)),
          paymentRate: Number(paymentRate.toFixed(1)),
        },
        recentPayments,
        monthlyData,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar relatórios financeiros:", error);
    return {
      success: false,
      error: "Erro ao carregar dados do relatório",
    };
  }
}
