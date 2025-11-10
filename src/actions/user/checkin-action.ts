"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  checkInTable,
  financialTable,
  personalDataTable,
  usersTable,
} from "@/db/schema";
import { isCheckInAllowed } from "@/lib/checkin-utils";
import { getDaysUntilDue, isPaymentUpToDate } from "@/lib/payment-utils";

// Schema de validação para o check-in
const checkInSchema = z.object({
  identifier: z.string().min(1, "CPF ou email é obrigatório"),
  method: z.enum(["cpf", "email"]),
});

export type CheckInFormData = z.infer<typeof checkInSchema>;

export interface CheckInFormState {
  success: boolean;
  message: string;
  userName?: string;
  showPaymentDialog?: boolean;
  paymentInfo?: {
    dueDate: number;
    lastPaymentDate: string | null;
    daysOverdue: number;
  };
  errors?: Record<string, string[]>;
}

export async function checkInAction(
  prevState: CheckInFormState,
  formData: FormData,
): Promise<CheckInFormState> {
  try {
    // Extrair dados do formulário
    const identifier = formData.get("identifier") as string;

    // Determinar método baseado no formato do identificador
    const isCPF = /^\d{11}$/.test(identifier);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!isCPF && !isEmail) {
      return {
        success: false,
        message: "Digite um CPF (11 dígitos) ou email válido",
        errors: { identifier: ["Formato inválido"] },
      };
    }

    const method = isCPF ? "cpf" : "email";

    // Validar dados
    const validatedData = checkInSchema.parse({
      identifier: identifier.trim(),
      method,
    });

    // Buscar usuário pelo CPF ou email incluindo dados financeiros
    const userQuery = await db
      .select({
        userId: usersTable.id,
        userName: usersTable.name,
        userRole: usersTable.userRole,
        cpf: personalDataTable.cpf,
        email: personalDataTable.email,
        // Dados financeiros
        dueDate: financialTable.dueDate,
        paid: financialTable.paid,
        lastPaymentDate: financialTable.lastPaymentDate,
      })
      .from(usersTable)
      .innerJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .innerJoin(financialTable, eq(usersTable.id, financialTable.userId))
      .where(
        method === "cpf"
          ? eq(personalDataTable.cpf, validatedData.identifier)
          : eq(personalDataTable.email, validatedData.identifier),
      )
      .limit(1);

    if (userQuery.length === 0) {
      return {
        success: false,
        message:
          method === "cpf"
            ? "CPF não encontrado no sistema"
            : "Email não encontrado no sistema",
        errors: { identifier: ["Usuário não encontrado"] },
      };
    }

    const user = userQuery[0];

    // Verificar se é um aluno (apenas alunos podem fazer check-in)
    if (user.userRole !== "aluno") {
      return {
        success: false,
        message: "Apenas alunos podem fazer check-in",
        errors: { identifier: ["Acesso negado"] },
      };
    }

    // Verificar se é dia útil (segunda a sexta-feira)
    const today = new Date();

    if (!isCheckInAllowed(today)) {
      return {
        success: false,
        message: "Check-ins são permitidos apenas de segunda a sexta-feira",
        errors: { identifier: ["Check-in não permitido nos finais de semana"] },
      };
    }

    // Verificar se o pagamento está em dia
    const paymentUpToDate = isPaymentUpToDate(
      user.dueDate,
      user.lastPaymentDate,
      user.paid,
    );

    if (!paymentUpToDate) {
      const daysOverdue = Math.abs(getDaysUntilDue(user.dueDate));

      return {
        success: false,
        message: `Pagamento em atraso`,
        userName: user.userName,
        showPaymentDialog: true,
        paymentInfo: {
          dueDate: user.dueDate,
          lastPaymentDate: user.lastPaymentDate,
          daysOverdue,
        },
        errors: { identifier: ["Pagamento em atraso"] },
      };
    }

    // Verificar se já fez check-in hoje
    const todayString = today.toISOString().split("T")[0];
    const existingCheckIn = await db
      .select()
      .from(checkInTable)
      .where(eq(checkInTable.userId, user.userId))
      .orderBy(checkInTable.createdAt)
      .limit(1);

    // Verificar se o último check-in foi hoje
    if (existingCheckIn.length > 0) {
      const lastCheckIn = existingCheckIn[0];
      if (lastCheckIn.checkInDate === todayString) {
        return {
          success: false,
          message: `${user.userName}, você já fez check-in hoje às ${lastCheckIn.checkInTime}`,
          userName: user.userName,
        };
      }
    }

    // Realizar check-in
    const now = new Date();
    const timeString = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });

    await db.insert(checkInTable).values({
      userId: user.userId,
      checkInDate: todayString,
      checkInTime: timeString,
      method: validatedData.method,
      identifier: validatedData.identifier,
    });

    return {
      success: true,
      message: `Check-in realizado com sucesso!`,
      userName: user.userName,
    };
  } catch (error) {
    console.error("Erro ao realizar check-in:", error);

    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      });

      return {
        success: false,
        message: "Dados inválidos. Verifique os campos destacados.",
        errors,
      };
    }

    return {
      success: false,
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}
