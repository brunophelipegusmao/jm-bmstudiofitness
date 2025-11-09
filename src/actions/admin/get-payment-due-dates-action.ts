"use server";

import { count, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { financialTable, usersTable } from "@/db/schema";
import { UserRole } from "@/types/user-roles";

export interface PaymentDueDatesData {
  dueToday: number;
  dueNext7Days: number;
  overdue: number;
}

/**
 * Busca dados de vencimentos de pagamentos
 */
export async function getPaymentDueDatesAction(): Promise<{
  success: boolean;
  data?: PaymentDueDatesData;
  error?: string;
}> {
  try {
    const today = new Date();
    const currentDay = today.getDate();

    // Vencimentos hoje (dia atual)
    const dueTodayResult = await db
      .select({ count: count() })
      .from(financialTable)
      .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
      .where(
        sql`${usersTable.userRole} = ${UserRole.ALUNO} 
            AND ${financialTable.dueDate} = ${currentDay} 
            AND ${financialTable.paid} = false 
            AND ${usersTable.deletedAt} IS NULL`,
      );

    const dueToday = dueTodayResult[0]?.count || 0;

    // Vencimentos nos próximos 7 dias
    const next7Days: number[] = [];
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      next7Days.push(futureDate.getDate());
    }

    const dueNext7DaysResult = await db
      .select({ count: count() })
      .from(financialTable)
      .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
      .where(
        sql`${usersTable.userRole} = ${UserRole.ALUNO} 
            AND ${financialTable.dueDate} IN (${sql.join(
              next7Days.map((day) => sql`${day}`),
              sql`, `,
            )}) 
            AND ${financialTable.paid} = false 
            AND ${usersTable.deletedAt} IS NULL`,
      );

    const dueNext7Days = dueNext7DaysResult[0]?.count || 0;

    // Pagamentos em atraso (vencimento passou e não foi pago)
    const overdueResult = await db
      .select({ count: count() })
      .from(financialTable)
      .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
      .where(
        sql`${usersTable.userRole} = ${UserRole.ALUNO} 
            AND ${financialTable.dueDate} < ${currentDay} 
            AND ${financialTable.paid} = false 
            AND ${usersTable.deletedAt} IS NULL`,
      );

    const overdue = overdueResult[0]?.count || 0;

    return {
      success: true,
      data: {
        dueToday,
        dueNext7Days,
        overdue,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar vencimentos de pagamentos:", error);
    return {
      success: false,
      error: "Erro ao carregar dados de vencimentos",
    };
  }
}
