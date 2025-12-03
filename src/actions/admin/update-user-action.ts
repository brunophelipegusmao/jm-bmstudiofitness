"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  employeeSalaryHistoryTable,
  employeesTable,
  financialTable,
  personalDataTable,
  usersTable,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth-utils";
import { canUpdateUserType } from "@/lib/check-permission";

interface UpdateUserData {
  userId: string;
  name: string;
  email: string;
  telephone: string;
  address: string;
  cpf?: string;
  bornDate?: string;
  password?: string;

  // Dados de funcionário/professor
  position?: string;
  shift?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  salaryInCents?: number;
  salaryChangeReason?: string;
  salaryEffectiveDate?: string;

  // Dados de aluno
  monthlyFeeValueInCents?: number;
  paymentMethod?: string;
  dueDate?: number;
}

export async function updateUserAction(
  adminId: string,
  userData: UpdateUserData,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Buscar role do usuário sendo editado
    const [user] = await db
      .select({ role: usersTable.userRole })
      .from(usersTable)
      .where(eq(usersTable.id, userData.userId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // Verificar permissões se for funcionário ou professor
    if (user.role === "funcionario" || user.role === "professor") {
      const hasPermission = await canUpdateUserType(adminId, userData.userId);
      if (!hasPermission) {
        return {
          success: false,
          error: "Você não tem permissão para atualizar este usuário",
        };
      }
    }

    // Atualizar nome do usuário e senha (se fornecida)
    const updateData: {
      name: string;
      password?: string;
    } = {
      name: userData.name,
    };

    // Se a senha foi fornecida, fazer hash e incluir na atualização
    if (userData.password && userData.password.length > 0) {
      updateData.password = await hashPassword(userData.password);
    }

    await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, userData.userId));

    // Atualizar dados pessoais
    await db
      .update(personalDataTable)
      .set({
        email: userData.email,
        telephone: userData.telephone,
        address: userData.address,
        cpf: userData.cpf,
        bornDate: userData.bornDate,
      })
      .where(eq(personalDataTable.userId, userData.userId));

    // Se for funcionário ou professor, atualizar dados de employee
    if (user.role === "funcionario" || user.role === "professor") {
      if (
        userData.position ||
        userData.shift ||
        userData.salaryInCents !== undefined
      ) {
        // Buscar salário atual para verificar mudanças
        const [currentEmployee] = await db
          .select({ salaryInCents: employeesTable.salaryInCents })
          .from(employeesTable)
          .where(eq(employeesTable.userId, userData.userId))
          .limit(1);

        // Atualizar dados do employee
        await db
          .update(employeesTable)
          .set({
            position: userData.position,
            shift: userData.shift,
            shiftStartTime: userData.shiftStartTime || undefined,
            shiftEndTime: userData.shiftEndTime || undefined,
            salaryInCents: userData.salaryInCents,
          })
          .where(eq(employeesTable.userId, userData.userId));

        // Se o salário mudou, registrar no histórico
        if (
          userData.salaryInCents !== undefined &&
          currentEmployee &&
          userData.salaryInCents !== currentEmployee.salaryInCents
        ) {
          const [employee] = await db
            .select({ id: employeesTable.id })
            .from(employeesTable)
            .where(eq(employeesTable.userId, userData.userId))
            .limit(1);

          if (employee) {
            // Formatar data como string YYYY-MM-DD
            const effectiveDateStr = userData.salaryEffectiveDate
              ? new Date(userData.salaryEffectiveDate)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0];

            await db.insert(employeeSalaryHistoryTable).values({
              employeeId: employee.id,
              previousSalaryInCents: currentEmployee.salaryInCents,
              newSalaryInCents: userData.salaryInCents,
              changeReason:
                userData.salaryChangeReason || "Atualização salarial",
              effectiveDate: effectiveDateStr,
              changedBy: adminId,
              createdAt: new Date(),
            });
          }
        }
      }
    }

    // Se for aluno, atualizar dados financeiros
    if (user.role === "aluno") {
      if (
        userData.monthlyFeeValueInCents !== undefined ||
        userData.paymentMethod ||
        userData.dueDate !== undefined
      ) {
        await db
          .update(financialTable)
          .set({
            monthlyFeeValueInCents: userData.monthlyFeeValueInCents,
            paymentMethod: userData.paymentMethod,
            dueDate: userData.dueDate,
          })
          .where(eq(financialTable.userId, userData.userId));
      }
    }

    revalidatePath("/admin");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return {
      success: false,
      error: "Erro ao atualizar usuário",
    };
  }
}
