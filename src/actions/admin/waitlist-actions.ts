"use server";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  financialTable,
  personalDataTable,
  usersTable,
  waitlistTable,
} from "@/db/schema";
import { adminGuard, hashPassword } from "@/lib/auth-utils";
import { UserRole } from "@/types/user-roles";

/**
 * Adiciona alguém à lista de espera
 * Público - qualquer um pode se inscrever
 */
export async function joinWaitlistAction(data: {
  fullName: string;
  email: string;
  whatsapp: string;
  preferredShift: string;
  goal: string;
  healthRestrictions?: string;
}) {
  try {
    // Validar dados básicos
    if (
      !data.fullName ||
      !data.email ||
      !data.whatsapp ||
      !data.preferredShift ||
      !data.goal
    ) {
      return {
        success: false,
        error: "Todos os campos obrigatórios devem ser preenchidos",
      };
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        error: "Email inválido",
      };
    }

    // Validar se já está na lista de espera (por email)
    const existingEntry = await db
      .select()
      .from(waitlistTable)
      .where(
        and(
          eq(waitlistTable.email, data.email.toLowerCase()),
          eq(waitlistTable.status, "waiting"),
        ),
      )
      .limit(1);

    if (existingEntry.length > 0) {
      return {
        success: false,
        error: "Este email já está na lista de espera",
      };
    }

    // Calcular próxima posição
    const lastEntry = await db
      .select()
      .from(waitlistTable)
      .orderBy(desc(waitlistTable.position))
      .limit(1);

    const nextPosition = lastEntry.length > 0 ? lastEntry[0].position + 1 : 1;

    // Inserir na lista de espera
    const newEntry = await db
      .insert(waitlistTable)
      .values({
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        whatsapp: data.whatsapp,
        preferredShift: data.preferredShift,
        goal: data.goal,
        healthRestrictions: data.healthRestrictions || null,
        position: nextPosition,
        status: "waiting",
      })
      .returning();

    return {
      success: true,
      data: newEntry[0],
      message: `Você foi adicionado à lista de espera na posição ${nextPosition}!`,
    };
  } catch (error) {
    console.error("Erro ao adicionar à lista de espera:", error);
    return {
      success: false,
      error: "Erro ao adicionar à lista de espera",
    };
  }
}

/**
 * Busca toda a lista de espera
 * Público - qualquer um pode ver (apenas nome e posição)
 */
export async function getWaitlistPublicAction() {
  try {
    const waitlist = await db
      .select({
        id: waitlistTable.id,
        fullName: waitlistTable.fullName,
        position: waitlistTable.position,
        createdAt: waitlistTable.createdAt,
      })
      .from(waitlistTable)
      .where(eq(waitlistTable.status, "waiting"))
      .orderBy(waitlistTable.position);

    return {
      success: true,
      data: waitlist,
    };
  } catch (error) {
    console.error("Erro ao buscar lista de espera:", error);
    return {
      success: false,
      error: "Erro ao buscar lista de espera",
    };
  }
}

/**
 * Busca lista de espera completa (com todos os dados)
 * Admin apenas
 */
export async function getWaitlistAdminAction() {
  try {
    await adminGuard();

    const waitlist = await db
      .select()
      .from(waitlistTable)
      .orderBy(waitlistTable.position);

    return {
      success: true,
      data: waitlist,
    };
  } catch (error) {
    console.error("Erro ao buscar lista de espera:", error);
    return {
      success: false,
      error: "Erro ao buscar lista de espera",
    };
  }
}

/**
 * Remove entrada da lista de espera
 * Admin apenas
 */
export async function deleteWaitlistEntryAction(id: string) {
  try {
    await adminGuard();

    const deleted = await db
      .delete(waitlistTable)
      .where(eq(waitlistTable.id, id))
      .returning();

    if (deleted.length === 0) {
      return {
        success: false,
        error: "Entrada não encontrada",
      };
    }

    return {
      success: true,
      message: "Entrada removida com sucesso",
    };
  } catch (error) {
    console.error("Erro ao remover entrada:", error);
    return {
      success: false,
      error: "Erro ao remover entrada da lista de espera",
    };
  }
}

/**
 * Matricula alguém da lista de espera COM DADOS COMPLETOS
 * Cria usuário completo (user + personalData + financial) e marca entrada como enrolled
 * Admin apenas
 */
export async function completeEnrollFromWaitlistAction(data: {
  waitlistId: string;
  fullName: string;
  cpf: string;
  email: string;
  telephone: string;
  address: string;
  bornDate: string;
  sex: "masculino" | "feminino";
  monthlyFeeValue: string; // Ex: "150.00"
  paymentMethod: string;
  dueDate: string;
}) {
  try {
    await adminGuard();

    // Buscar entrada da waitlist
    const entry = await db
      .select()
      .from(waitlistTable)
      .where(eq(waitlistTable.id, data.waitlistId))
      .limit(1);

    if (entry.length === 0) {
      return {
        success: false,
        error: "Entrada não encontrada na lista de espera",
      };
    }

    const waitlistEntry = entry[0];

    // Verificar se já foi matriculado
    if (waitlistEntry.status === "enrolled") {
      return {
        success: false,
        error: "Esta pessoa já foi matriculada",
      };
    }

    // Verificar se CPF já existe
    const existingCPF = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.cpf, data.cpf))
      .limit(1);

    if (existingCPF.length > 0) {
      return {
        success: false,
        error: "Já existe um usuário com este CPF",
      };
    }

    // Verificar se email já existe
    const existingEmail = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.email, data.email.toLowerCase()))
      .limit(1);

    if (existingEmail.length > 0) {
      return {
        success: false,
        error: "Já existe um usuário com este email",
      };
    }

    // Gerar senha: primeiros 3 caracteres do nome + últimos 4 dígitos do CPF
    const firstName = data.fullName.split(" ")[0].toLowerCase();
    const cpfDigits = data.cpf.replace(/\D/g, "");
    const generatedPassword = `${firstName.slice(0, 3)}${cpfDigits.slice(-4)}`;
    const hashedPassword = await hashPassword(generatedPassword);

    // Converter valor da mensalidade para centavos
    const monthlyFeeInCents = Math.round(
      parseFloat(data.monthlyFeeValue) * 100,
    );

    // Criar transação para criar usuário completo
    const result = await db.transaction(async (tx) => {
      // 1. Criar usuário
      const [newUser] = await tx
        .insert(usersTable)
        .values({
          name: data.fullName,
          userRole: UserRole.ALUNO,
          password: hashedPassword,
          createdAt: new Date().toISOString().split("T")[0],
        })
        .returning({ id: usersTable.id });

      // 2. Criar dados pessoais completos
      await tx.insert(personalDataTable).values({
        userId: newUser.id,
        cpf: data.cpf,
        email: data.email.toLowerCase(),
        sex: data.sex,
        bornDate: data.bornDate,
        address: data.address,
        telephone: data.telephone,
      });

      // 3. Criar registro financeiro
      await tx.insert(financialTable).values({
        userId: newUser.id,
        monthlyFeeValueInCents: monthlyFeeInCents,
        paymentMethod: data.paymentMethod,
        dueDate: parseInt(data.dueDate),
        paid: false,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      });

      // 4. Atualizar entrada da waitlist
      await tx
        .update(waitlistTable)
        .set({
          status: "enrolled",
          enrolledAt: new Date(),
          userId: newUser.id,
        })
        .where(eq(waitlistTable.id, data.waitlistId));

      return { newUser, generatedPassword };
    });

    return {
      success: true,
      userId: result.newUser.id,
      password: result.generatedPassword,
      message: "Aluno matriculado com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao matricular aluno:", error);
    return {
      success: false,
      error: "Erro ao matricular aluno da lista de espera",
    };
  }
}

/**
 * DEPRECADO - Use completeEnrollFromWaitlistAction
 * Mantido para compatibilidade
 */
export async function enrollFromWaitlistAction(waitlistId: string) {
  try {
    await adminGuard();

    // Buscar entrada da waitlist
    const entry = await db
      .select()
      .from(waitlistTable)
      .where(eq(waitlistTable.id, waitlistId))
      .limit(1);

    if (entry.length === 0) {
      return {
        success: false,
        error: "Entrada não encontrada na lista de espera",
      };
    }

    const waitlistEntry = entry[0];

    // Verificar se já foi matriculado
    if (waitlistEntry.status === "enrolled") {
      return {
        success: false,
        error: "Esta pessoa já foi matriculada",
      };
    }

    // Verificar se email já existe
    const existingPersonalData = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.email, waitlistEntry.email))
      .limit(1);

    if (existingPersonalData.length > 0) {
      return {
        success: false,
        error: "Já existe um usuário com este email",
      };
    }

    // Criar senha temporária (primeiros 6 dígitos do WhatsApp sem formatação)
    const tempPassword = waitlistEntry.whatsapp.replace(/\D/g, "").slice(0, 6);
    const hashedPassword = await hashPassword(tempPassword);

    // Criar transação para criar usuário e dados pessoais
    const result = await db.transaction(async (tx) => {
      // 1. Criar usuário básico
      const [newUser] = await tx
        .insert(usersTable)
        .values({
          name: waitlistEntry.fullName,
          userRole: UserRole.ALUNO,
          password: hashedPassword,
          createdAt: new Date().toISOString().split("T")[0],
        })
        .returning({ id: usersTable.id });

      // 2. Criar dados pessoais básicos (CPF temporário baseado no timestamp)
      const tempCPF = `WL${Date.now().toString().slice(-9)}`; // WL + 9 dígitos
      await tx.insert(personalDataTable).values({
        userId: newUser.id,
        cpf: tempCPF,
        email: waitlistEntry.email,
        sex: "masculino", // Padrão temporário - admin completará depois
        bornDate: "2000-01-01", // Padrão temporário - admin completará depois
        address: "A completar",
        telephone: waitlistEntry.whatsapp,
      });

      // 3. Criar registro financeiro básico
      await tx.insert(financialTable).values({
        userId: newUser.id,
        monthlyFeeValueInCents: 15000, // R$ 150,00 padrão - admin completará depois
        paymentMethod: "pix", // Padrão temporário
        dueDate: 10, // Dia 10 padrão
        paid: false,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      });

      // 4. Atualizar entrada da waitlist
      await tx
        .update(waitlistTable)
        .set({
          status: "enrolled",
          enrolledAt: new Date(),
          userId: newUser.id,
        })
        .where(eq(waitlistTable.id, waitlistId));

      return { newUser, tempPassword };
    });

    return {
      success: true,
      userId: result.newUser.id,
      tempPassword: result.tempPassword,
      message: `Usuário criado! Complete os dados do aluno no sistema. Senha temporária: ${result.tempPassword}`,
    };
  } catch (error) {
    console.error("Erro ao matricular da lista de espera:", error);
    return {
      success: false,
      error: "Erro ao matricular da lista de espera",
    };
  }
}

/**
 * Atualiza status de uma entrada da waitlist
 * Admin apenas
 */
export async function updateWaitlistStatusAction(
  id: string,
  status: "waiting" | "enrolled",
) {
  try {
    await adminGuard();

    const updated = await db
      .update(waitlistTable)
      .set({ status })
      .where(eq(waitlistTable.id, id))
      .returning();

    if (updated.length === 0) {
      return {
        success: false,
        error: "Entrada não encontrada",
      };
    }

    return {
      success: true,
      data: updated[0],
      message: "Status atualizado com sucesso",
    };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return {
      success: false,
      error: "Erro ao atualizar status",
    };
  }
}
