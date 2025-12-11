"use server";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { financialTable, usersTable } from "@/db/schema";
import { UserRole } from "@/types/user-roles";

export interface StudentWithDueDate {
  id: string;
  name: string;
  monthlyFee: number;
  monthlyFeeFormatted: string;
  dueDate: number;
  isPaid: boolean;
  daysOverdue: number | null;
}

export interface DashboardDetailedData {
  vencimentos: number;
  valor: number;
  valorFormatted: string;
  pagamentos: number;
  valorRecebido: number;
  valorRecebidoFormatted: string;
  pendentes: number;
  valorPendente: number;
  valorPendenteFormatted: string;
  taxaConversao: number;
  students: StudentWithDueDate[];
}

/**
 * Formata valor em centavos para moeda
 */
function formatCurrency(valueInCents: number): string {
  const valueInReais = valueInCents / 100;
  return valueInReais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Busca dados detalhados do dashboard para um período específico
 * @param timeframe - 'today', 'week', 'month', ou 'overdue'
 */
export async function getDashboardDetailedAction(
  timeframe: "today" | "week" | "month" | "overdue" = "today",
): Promise<{
  success: boolean;
  data?: DashboardDetailedData;
  error?: string;
}> {
  try {
    const today = new Date();
    const currentDay = today.getDate();

    let dueDateCondition: ReturnType<typeof sql>;

    // Define o filtro de data baseado no timeframe
    switch (timeframe) {
      case "today":
        dueDateCondition = sql`${financialTable.dueDate} = ${currentDay}`;
        break;
      case "week":
        // Próximos 7 dias
        const next7Days: number[] = [];
        for (let i = 0; i <= 7; i++) {
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + i);
          next7Days.push(futureDate.getDate());
        }
        dueDateCondition = sql`${financialTable.dueDate} IN (${sql.join(
          next7Days.map((day) => sql`${day}`),
          sql`, `,
        )})`;
        break;
      case "month":
        // Próximos 30 dias
        const next30Days: number[] = [];
        for (let i = 0; i <= 30; i++) {
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + i);
          next30Days.push(futureDate.getDate());
        }
        dueDateCondition = sql`${financialTable.dueDate} IN (${sql.join(
          next30Days.map((day) => sql`${day}`),
          sql`, `,
        )})`;
        break;
      case "overdue":
        dueDateCondition = sql`${financialTable.dueDate} < ${currentDay}`;
        break;
    }

    // Busca todos os pagamentos do período
    const payments = await db
      .select({
        userId: financialTable.userId,
        userName: usersTable.name,
        monthlyFee: financialTable.monthlyFeeValueInCents,
        dueDate: financialTable.dueDate,
        isPaid: financialTable.paid,
      })
      .from(financialTable)
      .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
      .where(
        and(
          eq(usersTable.userRole, UserRole.ALUNO),
          dueDateCondition,
          sql`${usersTable.deletedAt} IS NULL`,
        ),
      )
      .orderBy(desc(financialTable.paid), financialTable.dueDate);

    // Calcula estatísticas
    let totalVencimentos = 0;
    let totalValor = 0;
    let totalPagamentos = 0;
    let totalValorRecebido = 0;
    let totalPendentes = 0;
    let totalValorPendente = 0;

    const studentsData: StudentWithDueDate[] = payments.map((payment) => {
      const monthlyFee = Number(payment.monthlyFee) || 0;
      const daysOverdue = payment.isPaid
        ? null
        : currentDay > payment.dueDate
          ? currentDay - payment.dueDate
          : null;

      totalVencimentos++;
      totalValor += monthlyFee;

      if (payment.isPaid) {
        totalPagamentos++;
        totalValorRecebido += monthlyFee;
      } else {
        totalPendentes++;
        totalValorPendente += monthlyFee;
      }

      return {
        id: payment.userId,
        name: payment.userName,
        monthlyFee: monthlyFee,
        monthlyFeeFormatted: formatCurrency(monthlyFee),
        dueDate: payment.dueDate,
        isPaid: payment.isPaid,
        daysOverdue,
      };
    });

    const taxaConversao =
      totalVencimentos > 0
        ? Math.round((totalPagamentos / totalVencimentos) * 100)
        : 0;

    return {
      success: true,
      data: {
        vencimentos: totalVencimentos,
        valor: totalValor,
        valorFormatted: formatCurrency(totalValor),
        pagamentos: totalPagamentos,
        valorRecebido: totalValorRecebido,
        valorRecebidoFormatted: formatCurrency(totalValorRecebido),
        pendentes: totalPendentes,
        valorPendente: totalValorPendente,
        valorPendenteFormatted: formatCurrency(totalValorPendente),
        taxaConversao,
        students: studentsData,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar dados detalhados do dashboard:", error);
    return {
      success: false,
      error: "Erro ao carregar dados do dashboard",
    };
  }
}
