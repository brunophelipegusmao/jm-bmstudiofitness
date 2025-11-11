"use server";

import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { receiptsLogTable, usersTable } from "@/db/schema";
import { verifyToken } from "@/lib/auth-utils";

export interface ManualReceiptData {
  studentUserId: string;
  studentName: string;
  studentCpf: string;
  studentEmail: string;
  amountPaid: number; // em centavos
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: string;
  referenceMonth: string; // ex: "Novembro/2025"
  notes?: string;
}

export interface ReceiptResult {
  success: boolean;
  data?: {
    receiptNumber: string;
    studentName: string;
    studentCpf: string;
    studentEmail: string;
    amountPaid: number;
    paymentDate: string;
    paymentMethod: string;
    referenceMonth: string;
    generatedAt: string;
    notes?: string;
  };
  error?: string;
}

/**
 * Gera recibo manual com dados fornecidos pelo funcionário
 * Registra no log de recibos para auditoria
 */
export async function generateManualReceiptAction(
  receiptData: ManualReceiptData,
): Promise<ReceiptResult> {
  try {
    // 1. Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return {
        success: false,
        error: "Token inválido ou expirado",
      };
    }

    // 2. Buscar dados do funcionário
    const employeeData = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (employeeData.length === 0) {
      return {
        success: false,
        error: "Funcionário não encontrado",
      };
    }

    const employee = employeeData[0];

    // Verificar se é funcionário ou admin
    if (employee.userRole !== "funcionario" && employee.userRole !== "admin") {
      return {
        success: false,
        error: "Apenas funcionários ou admins podem gerar recibos manuais",
      };
    }

    // 3. Verificar se o aluno existe
    const studentExists = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, receiptData.studentUserId))
      .limit(1);

    if (studentExists.length === 0) {
      return {
        success: false,
        error: "Aluno não encontrado",
      };
    }

    // 4. Gerar número único do recibo
    const dateStamp = format(new Date(), "yyyyMMdd");
    const receiptNumber = `REC-${dateStamp}-${receiptData.studentUserId.substring(0, 8)}`;

    // Verificar se já existe recibo com esse número
    const existingReceipt = await db
      .select()
      .from(receiptsLogTable)
      .where(eq(receiptsLogTable.receiptNumber, receiptNumber))
      .limit(1);

    if (existingReceipt.length > 0) {
      // Adicionar timestamp para garantir unicidade
      const timestamp = Date.now().toString().substring(8);
      const uniqueReceiptNumber = `${receiptNumber}-${timestamp}`;

      // Registrar no log
      await db.insert(receiptsLogTable).values({
        receiptNumber: uniqueReceiptNumber,
        studentUserId: receiptData.studentUserId,
        studentName: receiptData.studentName,
        studentCpf: receiptData.studentCpf,
        studentEmail: receiptData.studentEmail,
        amountPaid: receiptData.amountPaid,
        paymentDate: receiptData.paymentDate,
        paymentMethod: receiptData.paymentMethod,
        referenceMonth: receiptData.referenceMonth,
        generatedById: employee.id,
        generatedByName: employee.name,
        generatedByRole: employee.userRole,
        isManual: true,
        manualNotes: receiptData.notes,
      });

      return {
        success: true,
        data: {
          receiptNumber: uniqueReceiptNumber,
          studentName: receiptData.studentName,
          studentCpf: receiptData.studentCpf,
          studentEmail: receiptData.studentEmail,
          amountPaid: receiptData.amountPaid,
          paymentDate: receiptData.paymentDate,
          paymentMethod: receiptData.paymentMethod,
          referenceMonth: receiptData.referenceMonth,
          generatedAt: new Date().toISOString(),
          notes: receiptData.notes,
        },
      };
    }

    // 5. Registrar no log de recibos
    await db.insert(receiptsLogTable).values({
      receiptNumber,
      studentUserId: receiptData.studentUserId,
      studentName: receiptData.studentName,
      studentCpf: receiptData.studentCpf,
      studentEmail: receiptData.studentEmail,
      amountPaid: receiptData.amountPaid,
      paymentDate: receiptData.paymentDate,
      paymentMethod: receiptData.paymentMethod,
      referenceMonth: receiptData.referenceMonth,
      generatedById: employee.id,
      generatedByName: employee.name,
      generatedByRole: employee.userRole,
      isManual: true,
      manualNotes: receiptData.notes,
    });

    return {
      success: true,
      data: {
        receiptNumber,
        studentName: receiptData.studentName,
        studentCpf: receiptData.studentCpf,
        studentEmail: receiptData.studentEmail,
        amountPaid: receiptData.amountPaid,
        paymentDate: receiptData.paymentDate,
        paymentMethod: receiptData.paymentMethod,
        referenceMonth: receiptData.referenceMonth,
        generatedAt: new Date().toISOString(),
        notes: receiptData.notes,
      },
    };
  } catch (error) {
    console.error("Erro ao gerar recibo manual:", error);

    return {
      success: false,
      error: "Erro ao gerar recibo. Tente novamente.",
    };
  }
}

/**
 * Busca histórico de recibos gerados
 */
export async function getReceiptsLogAction(): Promise<{
  success: boolean;
  data?: (typeof receiptsLogTable.$inferSelect)[];
  error?: string;
}> {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return {
        success: false,
        error: "Token inválido ou expirado",
      };
    }

    // Buscar dados do usuário
    const userData = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (userData.length === 0) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    const user = userData[0];

    // Verificar se é funcionário ou admin
    if (user.userRole !== "funcionario" && user.userRole !== "admin") {
      return {
        success: false,
        error: "Acesso negado",
      };
    }

    // Buscar todos os recibos ordenados por data de criação (mais recentes primeiro)
    const receipts = await db
      .select()
      .from(receiptsLogTable)
      .orderBy(receiptsLogTable.createdAt);

    return {
      success: true,
      data: receipts,
    };
  } catch (error) {
    console.error("Erro ao buscar histórico de recibos:", error);

    return {
      success: false,
      error: "Erro ao buscar histórico. Tente novamente.",
    };
  }
}
