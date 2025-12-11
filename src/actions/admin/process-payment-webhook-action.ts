"use server";

import { eq } from "drizzle-orm";

import {
  sendPaymentFailedWebhook,
  sendPaymentReceivedWebhook,
} from "@/actions/admin/send-n8n-webhook-action";
import { db } from "@/db";
import { financialTable, personalDataTable, usersTable } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";

interface ProcessPaymentResult {
  success: boolean;
  message: string;
}

/**
 * Processa notificação de pagamento recebido
 * Atualiza o banco de dados e envia webhook ao n8n
 */
export async function processPaymentReceivedAction(
  userId: string,
  amountInCents: number,
  transactionId?: string,
  paymentMethod?: string,
): Promise<ProcessPaymentResult> {
  try {
    // Buscar dados do aluno
    const [student] = await db
      .select({
        userId: usersTable.id,
        userName: usersTable.name,
        email: personalDataTable.email,
        phone: personalDataTable.phone,
        dueDate: financialTable.dueDate,
      })
      .from(usersTable)
      .innerJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .innerJoin(financialTable, eq(usersTable.id, financialTable.userId))
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!student) {
      throw new Error("Aluno não encontrado");
    }

    // Atualizar status de pagamento no banco
    const now = new Date();
    await db
      .update(financialTable)
      .set({
        paid: true,
        lastPaymentDate: now,
        // Pode adicionar campos como transactionId se existirem na tabela
      })
      .where(eq(financialTable.userId, userId));

    // Enviar webhook ao n8n (não bloqueia se falhar)
    sendPaymentReceivedWebhook({
      studentId: student.userId,
      studentName: student.userName,
      studentEmail: student.email || "",
      studentPhone: student.phone || undefined,
      amountInCents,
      amountFormatted: formatCurrency(amountInCents),
      paymentDate: now.toISOString(),
      paymentMethod,
      transactionId,
      dueDate: student.dueDate,
      referenceMonth: now.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      }),
    }).catch((error) => {
      console.error("Erro ao enviar webhook de pagamento ao n8n:", error);
    });

    return {
      success: true,
      message: "Pagamento processado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Erro ao processar pagamento.",
    };
  }
}

/**
 * Processa notificação de falha de pagamento
 * Envia webhook ao n8n para notificar sobre a falha
 */
export async function processPaymentFailedAction(
  userId: string,
  amountInCents: number,
  failureReason?: string,
): Promise<ProcessPaymentResult> {
  try {
    // Buscar dados do aluno
    const [student] = await db
      .select({
        userId: usersTable.id,
        userName: usersTable.name,
        email: personalDataTable.email,
        phone: personalDataTable.phone,
        dueDate: financialTable.dueDate,
      })
      .from(usersTable)
      .innerJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .innerJoin(financialTable, eq(usersTable.id, financialTable.userId))
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!student) {
      throw new Error("Aluno não encontrado");
    }

    // Enviar webhook ao n8n para notificar falha
    const result = await sendPaymentFailedWebhook({
      studentId: student.userId,
      studentName: student.userName,
      studentEmail: student.email || "",
      studentPhone: student.phone || undefined,
      amountInCents,
      amountFormatted: formatCurrency(amountInCents),
      attemptDate: new Date().toISOString(),
      failureReason,
      dueDate: student.dueDate,
    });

    if (!result.success) {
      console.error(
        "Falha ao enviar webhook de pagamento falho:",
        result.error,
      );
    }

    return {
      success: true,
      message: "Notificação de falha processada.",
    };
  } catch (error) {
    console.error("Erro ao processar falha de pagamento:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro ao processar falha de pagamento.",
    };
  }
}
