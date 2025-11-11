"use server";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import {
  financialTable,
  personalDataTable,
  receiptsLogTable,
  usersTable,
} from "@/db/schema";
import { verifyToken } from "@/lib/auth-utils";
import { UserRole } from "@/types/user-roles";

export interface PaymentReceiptData {
  studentName: string;
  studentCPF: string;
  studentEmail: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
  monthlyFeeValue: number;
  dueDate: number;
  receiptNumber: string;
}

/**
 * Gera dados para recibo de pagamento
 * Apenas funcionários e admins podem gerar
 */
export async function generatePaymentReceiptAction(
  studentUserId: string,
): Promise<{
  success: boolean;
  data?: PaymentReceiptData;
  error?: string;
}> {
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

    // 2. Verificar se é funcionário ou admin e buscar dados completos
    const [employee] = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        role: usersTable.userRole,
      })
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (!employee) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    if (![UserRole.ADMIN, UserRole.FUNCIONARIO].includes(employee.role)) {
      return {
        success: false,
        error: "Apenas administradores e funcionários podem gerar recibos",
      };
    }

    // 3. Buscar dados do aluno e pagamento
    const [studentData] = await db
      .select({
        name: usersTable.name,
        cpf: personalDataTable.cpf,
        email: personalDataTable.email,
        monthlyFeeValueInCents: financialTable.monthlyFeeValueInCents,
        dueDate: financialTable.dueDate,
        paid: financialTable.paid,
        lastPaymentDate: financialTable.lastPaymentDate,
        paymentMethod: financialTable.paymentMethod,
      })
      .from(usersTable)
      .innerJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .innerJoin(financialTable, eq(usersTable.id, financialTable.userId))
      .where(eq(usersTable.id, studentUserId))
      .limit(1);

    if (!studentData) {
      return {
        success: false,
        error: "Aluno não encontrado",
      };
    }

    if (!studentData.paid || !studentData.lastPaymentDate) {
      return {
        success: false,
        error: "Aluno não possui pagamento registrado",
      };
    }

    // 4. Gerar número de recibo (baseado em data + ID do aluno)
    const receiptNumber = `REC-${studentData.lastPaymentDate.replace(/-/g, "")}-${studentUserId.slice(0, 8).toUpperCase()}`;

    // 5. Verificar se já existe este recibo no log
    const existingReceipt = await db
      .select()
      .from(receiptsLogTable)
      .where(eq(receiptsLogTable.receiptNumber, receiptNumber))
      .limit(1);

    // Se não existe, registrar no log
    if (existingReceipt.length === 0) {
      // Formatar mês de referência (ex: "Novembro/2025")
      const paymentDate = new Date(studentData.lastPaymentDate);
      const referenceMonth = format(paymentDate, "MMMM/yyyy", { locale: ptBR });

      await db.insert(receiptsLogTable).values({
        receiptNumber,
        studentUserId,
        studentName: studentData.name,
        studentCpf: studentData.cpf,
        studentEmail: studentData.email,
        amountPaid: studentData.monthlyFeeValueInCents,
        paymentDate: studentData.lastPaymentDate,
        paymentMethod: studentData.paymentMethod,
        referenceMonth,
        generatedById: employee.id,
        generatedByName: employee.name,
        generatedByRole: employee.role,
        isManual: false,
      });

      console.log(
        `✅ Recibo ${receiptNumber} gerado e registrado no log por ${employee.name} (${employee.role})`,
      );
    } else {
      console.log(`ℹ️ Recibo ${receiptNumber} já existe no log`);
    }

    // 6. Formatar dados do recibo
    const receiptData: PaymentReceiptData = {
      studentName: studentData.name,
      studentCPF: studentData.cpf,
      studentEmail: studentData.email,
      amountPaid: studentData.monthlyFeeValueInCents / 100,
      paymentDate: studentData.lastPaymentDate,
      paymentMethod: studentData.paymentMethod,
      monthlyFeeValue: studentData.monthlyFeeValueInCents / 100,
      dueDate: studentData.dueDate,
      receiptNumber,
    };

    console.log(
      `✅ Recibo gerado para aluno ${studentData.name} por ${employee.role} ${decoded.userId}`,
    );

    return {
      success: true,
      data: receiptData,
    };
  } catch (error) {
    console.error("Erro ao gerar recibo:", error);
    return {
      success: false,
      error: "Erro ao gerar recibo de pagamento",
    };
  }
}
