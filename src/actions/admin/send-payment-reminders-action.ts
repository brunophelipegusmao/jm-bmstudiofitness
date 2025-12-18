"use server";

import { and, eq, sql } from "drizzle-orm";

import { sendPaymentRemindersWebhook } from "@/actions/admin/send-n8n-webhook-action";
import { db } from "@/db";
import { financialTable, personalDataTable, usersTable } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";

interface SendRemindersResult {
  success: boolean;
  message: string;
  sentCount?: number;
}

/**
 * Envia lembretes de cobrança via n8n
 * @param type - Tipo de lembrete: 'due_today' | 'due_soon' | 'overdue'
 * @param triggeredBy - ID do usuário que acionou o lembrete
 */
export async function sendPaymentRemindersAction(
  type: "due_today" | "due_soon" | "overdue",
  triggeredBy: string,
): Promise<SendRemindersResult> {
  try {
    const today = new Date();
    const currentDay = today.getDate();

    // Buscar alunos de acordo com o tipo de lembrete
    let students;

    if (type === "due_today") {
      // Vence hoje
      students = await db
        .select({
          userId: usersTable.id,
          userName: usersTable.name,
          email: personalDataTable.email,
          phone: personalDataTable.phone,
          amountInCents: financialTable.monthlyFeeValueInCents,
          dueDate: financialTable.dueDate,
          isPaid: financialTable.paid,
        })
        .from(financialTable)
        .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
        .innerJoin(
          personalDataTable,
          eq(usersTable.id, personalDataTable.userId),
        )
        .where(
          and(
            eq(usersTable.userRole, "aluno"),
            eq(usersTable.deletedAt, sql`NULL`),
            eq(financialTable.dueDate, currentDay),
            eq(financialTable.paid, false),
          ),
        );
    } else if (type === "due_soon") {
      // Vence nos próximos 7 dias
      const next7Days: number[] = [];
      for (let i = 1; i <= 7; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        next7Days.push(futureDate.getDate());
      }

      students = await db
        .select({
          userId: usersTable.id,
          userName: usersTable.name,
          email: personalDataTable.email,
          phone: personalDataTable.phone,
          amountInCents: financialTable.monthlyFeeValueInCents,
          dueDate: financialTable.dueDate,
          isPaid: financialTable.paid,
        })
        .from(financialTable)
        .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
        .innerJoin(
          personalDataTable,
          eq(usersTable.id, personalDataTable.userId),
        )
        .where(
          and(
            eq(usersTable.userRole, "aluno"),
            eq(usersTable.deletedAt, sql`NULL`),
            sql`${financialTable.dueDate} IN (${sql.join(next7Days, sql`, `)})`,
            eq(financialTable.paid, false),
          ),
        );
    } else {
      // Em atraso
      students = await db
        .select({
          userId: usersTable.id,
          userName: usersTable.name,
          email: personalDataTable.email,
          phone: personalDataTable.phone,
          amountInCents: financialTable.monthlyFeeValueInCents,
          dueDate: financialTable.dueDate,
          isPaid: financialTable.paid,
        })
        .from(financialTable)
        .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
        .innerJoin(
          personalDataTable,
          eq(usersTable.id, personalDataTable.userId),
        )
        .where(
          and(
            eq(usersTable.userRole, "aluno"),
            eq(usersTable.deletedAt, sql`NULL`),
            sql`${financialTable.dueDate} < ${currentDay}`,
            eq(financialTable.paid, false),
          ),
        );
    }

    if (!students || students.length === 0) {
      return {
        success: true,
        message: "Nenhum aluno encontrado para enviar lembretes.",
        sentCount: 0,
      };
    }

    // Formatar dados para envio ao n8n
    const studentsData = students.map((student) => ({
      id: student.userId,
      name: student.userName,
      email: student.email || "",
      phone: student.phone || undefined,
      amountInCents: student.amountInCents,
      amountFormatted: formatCurrency(student.amountInCents),
      dueDate: student.dueDate,
      daysOverdue:
        type === "overdue" ? currentDay - student.dueDate : undefined,
    }));

    // Enviar ao n8n
    const result = await sendPaymentRemindersWebhook({
      type,
      students: studentsData,
      triggeredBy,
      triggeredAt: new Date().toISOString(),
    });

    if (!result.success) {
      throw new Error(result.error || "Falha ao enviar webhook");
    }

    return {
      success: true,
      message: `Lembretes enviados com sucesso para ${students.length} aluno(s).`,
      sentCount: students.length,
    };
  } catch (error) {
    console.error("Erro ao enviar lembretes de pagamento:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro ao enviar lembretes de pagamento.",
    };
  }
}
