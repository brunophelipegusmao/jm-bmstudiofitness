"use server";

import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { checkInTable, usersTable } from "@/db/schema";
import { verifyToken } from "@/lib/auth-utils";

export interface TodayCheckIn {
  id: string;
  studentName: string;
  checkInTime: string;
  performedByName: string;
  paymentDaysOverdue: number | null;
  notes: string | null;
}

export interface TodayCheckInsResult {
  success: boolean;
  data?: TodayCheckIn[];
  error?: string;
}

/**
 * Busca check-ins realizados hoje
 * Retorna todos os check-ins do dia com informações do aluno e funcionário
 */
export async function getTodayCheckInsAction(): Promise<TodayCheckInsResult> {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Você precisa estar logado",
      };
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return {
        success: false,
        error: "Token inválido ou expirado",
      };
    }

    // Buscar dados do funcionário para verificar permissão
    const employeeData = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (employeeData.length === 0) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    const employee = employeeData[0];

    // Verificar se é funcionário ou admin
    if (employee.userRole !== "funcionario" && employee.userRole !== "admin") {
      return {
        success: false,
        error: "Apenas funcionários podem acessar este recurso",
      };
    }

    // Data de hoje no formato YYYY-MM-DD
    const today = format(new Date(), "yyyy-MM-dd");

    // Buscar check-ins de hoje com informações do aluno e funcionário
    const checkIns = await db
      .select({
        id: checkInTable.id,
        studentId: checkInTable.userId,
        checkInTime: checkInTable.checkInTime,
        performedById: checkInTable.performedById,
        paymentDaysOverdue: checkInTable.paymentDaysOverdue,
        notes: checkInTable.notes,
      })
      .from(checkInTable)
      .where(eq(checkInTable.checkInDate, today))
      .orderBy(desc(checkInTable.createdAt));

    // Se não há check-ins hoje
    if (checkIns.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Buscar todos os usuários (alunos e funcionários)
    const allUsers = await db.select().from(usersTable);

    // Montar dados formatados
    const formattedCheckIns: TodayCheckIn[] = checkIns.map((checkIn) => {
      const student = allUsers.find((s) => s.id === checkIn.studentId);
      const performer = allUsers.find((p) => p.id === checkIn.performedById);

      return {
        id: checkIn.id,
        studentName: student?.name || "Aluno Desconhecido",
        checkInTime: checkIn.checkInTime,
        performedByName: performer?.name || "Sistema",
        paymentDaysOverdue: checkIn.paymentDaysOverdue,
        notes: checkIn.notes,
      };
    });

    return {
      success: true,
      data: formattedCheckIns,
    };
  } catch (error) {
    console.error("Erro ao buscar check-ins de hoje:", error);

    return {
      success: false,
      error: "Erro ao buscar check-ins. Tente novamente.",
    };
  }
}
