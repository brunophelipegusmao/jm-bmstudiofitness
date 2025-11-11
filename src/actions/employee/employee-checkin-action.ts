"use server";

import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import {
  checkInTable,
  financialTable,
  personalDataTable,
  usersTable,
} from "@/db/schema";
import { verifyToken } from "@/lib/auth-utils";
import { isCheckInAllowed } from "@/lib/checkin-utils";
import { getDaysUntilDue, isPaymentUpToDate } from "@/lib/payment-utils";

export interface EmployeeCheckInResult {
  success: boolean;
  message: string;
  studentName?: string;
  daysOverdue?: number;
}

/**
 * Check-in realizado por funcionário para aluno
 *
 * Regras:
 * - Permite check-in com até 10 dias de atraso no pagamento
 * - Registra quem fez o check-in (performedBy)
 * - Registra quantidade de dias de atraso (se houver)
 * - Permite notas/observações do funcionário
 */
export async function employeeCheckInAction(
  identifier: string,
  method: "cpf" | "email",
  notes?: string,
): Promise<EmployeeCheckInResult> {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Você precisa estar logado para realizar check-in",
      };
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return {
        success: false,
        message: "Token inválido ou expirado",
      };
    }

    // Buscar dados do funcionário
    const employeeData = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (employeeData.length === 0) {
      return {
        success: false,
        message: "Funcionário não encontrado",
      };
    }

    const employee = employeeData[0];

    // Verificar se é funcionário ou admin
    if (employee.userRole !== "funcionario" && employee.userRole !== "admin") {
      return {
        success: false,
        message: "Apenas funcionários podem realizar check-in para alunos",
      };
    }

    // Buscar aluno pelo CPF ou email
    const studentQuery = await db
      .select({
        userId: usersTable.id,
        userName: usersTable.name,
        userRole: usersTable.userRole,
        cpf: personalDataTable.cpf,
        email: personalDataTable.email,
        dueDate: financialTable.dueDate,
        paid: financialTable.paid,
        lastPaymentDate: financialTable.lastPaymentDate,
      })
      .from(usersTable)
      .innerJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .innerJoin(financialTable, eq(usersTable.id, financialTable.userId))
      .where(
        method === "cpf"
          ? eq(personalDataTable.cpf, identifier)
          : eq(personalDataTable.email, identifier),
      )
      .limit(1);

    if (studentQuery.length === 0) {
      return {
        success: false,
        message:
          method === "cpf"
            ? "CPF não encontrado no sistema"
            : "Email não encontrado no sistema",
      };
    }

    const student = studentQuery[0];

    // Verificar se é um aluno
    if (student.userRole !== "aluno") {
      return {
        success: false,
        message: "Apenas alunos podem fazer check-in",
      };
    }

    // Verificar se é dia útil (segunda a sexta-feira)
    const today = new Date();

    if (!isCheckInAllowed(today)) {
      return {
        success: false,
        message: "Check-ins são permitidos apenas de segunda a sexta-feira",
      };
    }

    // Verificar pagamento com tolerância de 10 dias
    const paymentUpToDate = isPaymentUpToDate(
      student.dueDate,
      student.lastPaymentDate,
      student.paid,
    );

    let daysOverdue = 0;

    if (!paymentUpToDate) {
      daysOverdue = Math.abs(getDaysUntilDue(student.dueDate));

      // Tolerância de 10 dias para funcionário
      if (daysOverdue > 10) {
        return {
          success: false,
          message: `Pagamento com ${daysOverdue} dias de atraso. Máximo permitido: 10 dias`,
          studentName: student.userName,
          daysOverdue,
        };
      }
    }

    // Verificar se já fez check-in hoje
    const todayString = format(today, "yyyy-MM-dd");
    const existingCheckIn = await db
      .select()
      .from(checkInTable)
      .where(eq(checkInTable.userId, student.userId))
      .orderBy(checkInTable.createdAt)
      .limit(1);

    if (existingCheckIn.length > 0) {
      const lastCheckIn = existingCheckIn[0];
      if (lastCheckIn.checkInDate === todayString) {
        return {
          success: false,
          message: `${student.userName} já fez check-in hoje às ${lastCheckIn.checkInTime}`,
          studentName: student.userName,
        };
      }
    }

    // Realizar check-in
    const now = new Date();
    const timeString = format(now, "HH:mm");

    await db.insert(checkInTable).values({
      userId: student.userId,
      checkInDate: todayString,
      checkInTime: timeString,
      method,
      identifier,
      performedById: employee.id,
      performedByRole: employee.userRole,
      paymentDaysOverdue: daysOverdue,
      notes,
    });

    const warningMessage =
      daysOverdue > 0 ? ` (${daysOverdue} dias de atraso no pagamento)` : "";

    return {
      success: true,
      message: `Check-in de ${student.userName} realizado com sucesso!${warningMessage}`,
      studentName: student.userName,
      daysOverdue,
    };
  } catch (error) {
    console.error("Erro ao realizar check-in do funcionário:", error);

    return {
      success: false,
      message: "Erro ao realizar check-in. Tente novamente.",
    };
  }
}
