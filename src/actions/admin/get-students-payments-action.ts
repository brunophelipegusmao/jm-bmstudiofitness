"use server";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { financialTable, personalDataTable, usersTable } from "@/db/schema";
import {
  formatCurrency,
  getDaysUntilDue,
  isPaymentUpToDate,
} from "@/lib/payment-utils";
import { UserRole } from "@/types/user-roles";

export interface StudentPaymentData {
  userId: string;
  name: string;
  email: string;
  cpf: string;
  monthlyFeeValueInCents: number;
  paymentMethod: string;
  dueDate: number;
  paid: boolean;
  lastPaymentDate: string | null;
  isUpToDate: boolean;
  daysUntilDue: number;
  formattedValue: string;
}

// Interface para dados brutos do banco antes do processamento
interface RawStudentData {
  userId: string;
  name: string;
  email: string | null;
  cpf: string | null;
  monthlyFeeValueInCents: number | null;
  paymentMethod: string | null;
  dueDate: number | null;
  paid: boolean | null;
  lastPaymentDate: string | null;
}

export async function getStudentsPaymentsAction(): Promise<
  StudentPaymentData[]
> {
  try {
    // Buscar todos os alunos com dados financeiros (excluindo deletados)
    const students = await db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        email: personalDataTable.email,
        cpf: personalDataTable.cpf,
        monthlyFeeValueInCents: financialTable.monthlyFeeValueInCents,
        paymentMethod: financialTable.paymentMethod,
        dueDate: financialTable.dueDate,
        paid: financialTable.paid,
        lastPaymentDate: financialTable.lastPaymentDate,
      })
      .from(usersTable)
      .leftJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .leftJoin(financialTable, eq(usersTable.id, financialTable.userId))
      .where(
        and(
          eq(usersTable.userRole, UserRole.ALUNO),
          isNull(usersTable.deletedAt),
        ),
      )
      .orderBy(usersTable.name);

    // Processar dados com informações adicionais
    const processedStudents = students.map((student): StudentPaymentData => {
      // Valores padrão para dados não configurados
      const defaultValues: StudentPaymentData = {
        userId: student.userId,
        name: student.name,
        email: student.email || "Não configurado",
        cpf: student.cpf || "Não configurado",
        monthlyFeeValueInCents: 0,
        paymentMethod: student.paymentMethod || "Não configurado",
        dueDate: 1,
        paid: false,
        lastPaymentDate: null,
        isUpToDate: false,
        daysUntilDue: 0,
        formattedValue: "Não configurado",
      };

      // Se não tem dados financeiros, retorna valores padrão
      if (
        !student.dueDate ||
        student.paid === null ||
        !student.monthlyFeeValueInCents
      ) {
        return defaultValues;
      }

      // Se tem dados financeiros, processa as informações
      const isUpToDate = isPaymentUpToDate(
        student.dueDate,
        student.lastPaymentDate,
        student.paid,
      );

      const daysUntilDue = getDaysUntilDue(student.dueDate);
      const formattedValue = formatCurrency(student.monthlyFeeValueInCents);

      return {
        userId: student.userId,
        name: student.name,
        email: student.email || "Não configurado",
        cpf: student.cpf || "Não configurado",
        monthlyFeeValueInCents: student.monthlyFeeValueInCents,
        paymentMethod: student.paymentMethod || "Não configurado",
        dueDate: student.dueDate,
        paid: student.paid,
        lastPaymentDate: student.lastPaymentDate,
        isUpToDate,
        daysUntilDue,
        formattedValue,
      };
    });

    return processedStudents;
  } catch (error) {
    console.error("Erro ao buscar dados de pagamento dos alunos:", error);
    return [];
  }
}
