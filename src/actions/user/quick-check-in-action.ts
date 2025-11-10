"use server";

import { eq, or } from "drizzle-orm";

import { db } from "@/db";
import {
  checkInTable,
  financialTable,
  personalDataTable,
  usersTable,
} from "@/db/schema";

interface QuickCheckInState {
  success: boolean;
  message: string;
  userName?: string;
}

export async function quickCheckInAction(
  prevState: QuickCheckInState,
  formData: FormData,
): Promise<QuickCheckInState> {
  try {
    const identifier = formData.get("identifier") as string;

    if (!identifier || identifier.trim() === "") {
      return {
        success: false,
        message: "Digite seu CPF ou email para fazer check-in",
      };
    }

    const cleanIdentifier = identifier.trim();

    // Buscar usuário por CPF ou email
    const [userResult] = await db
      .select({
        userId: usersTable.id,
        userName: usersTable.name,
        userRole: usersTable.userRole,
        cpf: personalDataTable.cpf,
        email: personalDataTable.email,
      })
      .from(usersTable)
      .innerJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .where(
        or(
          eq(personalDataTable.cpf, cleanIdentifier),
          eq(personalDataTable.email, cleanIdentifier.toLowerCase()),
        ),
      )
      .limit(1);

    if (!userResult) {
      return {
        success: false,
        message: "Usuário não encontrado. Verifique o CPF ou email digitado.",
      };
    }

    // Verificar se é aluno
    if (userResult.userRole !== "aluno") {
      return {
        success: false,
        message: "Check-in rápido disponível apenas para alunos.",
      };
    }

    // Verificar status de pagamento
    const [financialData] = await db
      .select({
        paid: financialTable.paid,
        dueDate: financialTable.dueDate,
        lastPaymentDate: financialTable.lastPaymentDate,
      })
      .from(financialTable)
      .where(eq(financialTable.userId, userResult.userId))
      .limit(1);

    if (financialData) {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth(); // 0-based
      const currentYear = today.getFullYear();

      // Verificar se está em atraso
      let isOverdue = false;

      if (!financialData.paid) {
        // Se não está pago, verificar se passou da data de vencimento
        if (currentDay > financialData.dueDate) {
          isOverdue = true;
        }
      } else if (financialData.lastPaymentDate) {
        // Se está pago, verificar se o pagamento foi feito no mês atual
        const lastPayment = new Date(financialData.lastPaymentDate);
        const lastPaymentMonth = lastPayment.getMonth();
        const lastPaymentYear = lastPayment.getFullYear();

        // Se o último pagamento não foi neste mês/ano e já passou do vencimento
        if (
          (lastPaymentYear < currentYear ||
            (lastPaymentYear === currentYear &&
              lastPaymentMonth < currentMonth)) &&
          currentDay > financialData.dueDate
        ) {
          isOverdue = true;
        }
      }

      if (isOverdue) {
        return {
          success: false,
          message: `${userResult.userName}, você está com pagamento em atraso. Regularize sua situação na recepção para fazer check-in.`,
          userName: userResult.userName,
        };
      }
    }

    // Verificar se já fez check-in hoje
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD

    // Buscar check-ins de hoje
    const todayCheckIns = await db
      .select()
      .from(checkInTable)
      .where(eq(checkInTable.userId, userResult.userId));

    const hasCheckedInToday = todayCheckIns.some((checkIn) => {
      const checkInDate = new Date(checkIn.checkInDate);
      return checkInDate.toISOString().split("T")[0] === todayString;
    });

    if (hasCheckedInToday) {
      return {
        success: false,
        message: `${userResult.userName}, você já fez check-in hoje!`,
        userName: userResult.userName,
      };
    }

    // Fazer check-in
    const now = new Date();
    const todayStringForInsert = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentTime = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Determinar método usado (CPF ou email)
    const method = cleanIdentifier.includes("@") ? "email" : "cpf";

    await db.insert(checkInTable).values({
      userId: userResult.userId,
      checkInDate: todayStringForInsert,
      checkInTime: currentTime,
      checkInTimestamp: now, // Data e hora exata do momento do check-in
      method,
      identifier: cleanIdentifier,
    });

    return {
      success: true,
      message: `Check-in realizado com sucesso!`,
      userName: userResult.userName,
    };
  } catch (error) {
    console.error("Erro ao fazer check-in rápido:", error);
    return {
      success: false,
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}
