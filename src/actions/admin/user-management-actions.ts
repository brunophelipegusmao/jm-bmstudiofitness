"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  checkInTable,
  coachObservationsHistoryTable,
  financialTable,
  healthMetricsTable,
  personalDataTable,
  studentHealthHistoryTable,
  userConfirmationTokensTable,
  usersTable,
} from "@/db/schema";
import { CreateUserData, User } from "@/types/user";

export async function createUserAction(
  data: CreateUserData,
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Validar dados
    if (!data.name.trim() || !data.email.trim() || !data.password.trim()) {
      return { success: false, error: "Dados obrigatórios não fornecidos" };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, error: "Senhas não coincidem" };
    }

    // Validação robusta de senha
    const password = data.password;
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password,
    );

    if (!hasMinLength) {
      return {
        success: false,
        error: "Senha deve ter pelo menos 8 caracteres",
      };
    }
    if (!hasUpperCase) {
      return {
        success: false,
        error: "Senha deve ter pelo menos uma letra maiúscula",
      };
    }
    if (!hasLowerCase) {
      return {
        success: false,
        error: "Senha deve ter pelo menos uma letra minúscula",
      };
    }
    if (!hasNumber) {
      return { success: false, error: "Senha deve ter pelo menos um número" };
    }
    if (!hasSpecialChar) {
      return {
        success: false,
        error: "Senha deve ter pelo menos um caractere especial (!@#$%^&*)",
      };
    }

    // Verificar se email já existe
    const existingUserByEmail = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.email, data.email))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      return { success: false, error: "Email já está em uso" };
    }

    // Verificar se CPF já existe (se fornecido)
    if (data.cpf) {
      const cpfNumbers = data.cpf.replace(/\D/g, "");
      if (cpfNumbers.length !== 11) {
        return { success: false, error: "CPF deve ter 11 dígitos" };
      }

      const existingUserByCPF = await db
        .select()
        .from(personalDataTable)
        .where(eq(personalDataTable.cpf, cpfNumbers))
        .limit(1);

      if (existingUserByCPF.length > 0) {
        return { success: false, error: "CPF já está em uso" };
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Criar usuário
    const [createdUser] = await db
      .insert(usersTable)
      .values({
        name: data.name.trim(),
        userRole: data.role,
        password: hashedPassword,
      })
      .returning();

    // Criar dados pessoais se fornecidos
    if (
      data.email ||
      data.cpf ||
      data.telephone ||
      data.address ||
      data.bornDate
    ) {
      await db.insert(personalDataTable).values({
        userId: createdUser.id,
        email: data.email.trim(),
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : "",
        telephone: data.telephone || "",
        address: data.address || "",
        bornDate: data.bornDate || new Date().toISOString().split("T")[0],
      });
    }

    // Buscar usuário completo
    const fullUser = await getUserWithPersonalData(createdUser.id);

    if (!fullUser) {
      return { success: false, error: "Erro ao buscar usuário criado" };
    }

    return { success: true, user: fullUser };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

export async function getAllUsersAction(): Promise<{
  success: boolean;
  error?: string;
  users?: User[];
}> {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        role: usersTable.userRole,
        createdAt: usersTable.createdAt,
        email: personalDataTable.email,
        cpf: personalDataTable.cpf,
        telephone: personalDataTable.telephone,
        address: personalDataTable.address,
        bornDate: personalDataTable.bornDate,
      })
      .from(usersTable)
      .leftJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId));

    const formattedUsers: User[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email || "",
      role: user.role,
      cpf: user.cpf ? formatCPF(user.cpf) : undefined,
      telephone: user.telephone || undefined,
      address: user.address || undefined,
      bornDate: user.bornDate || undefined,
      createdAt: user.createdAt,
      updatedAt: user.createdAt, // Por enquanto, usar createdAt como updatedAt
      isActive: true, // Por enquanto, todos os usuários são ativos
    }));

    return { success: true, users: formattedUsers };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

export async function deleteUserAction(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId || typeof userId !== "string") {
      return {
        success: false,
        error: "ID do usuário é obrigatório e deve ser uma string válida",
      };
    }

    console.log(`🔍 Verificando existência do usuário: ${userId}`);

    // Verificar se o usuário existe
    const existingUser = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        role: usersTable.userRole,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      console.log(`❌ Usuário não encontrado: ${userId}`);
      return { success: false, error: "Usuário não encontrado" };
    }

    const user = existingUser[0];
    console.log(`✅ Usuário encontrado: ${user.name} (${user.role})`);
    console.log(`🗑️ Iniciando HARD DELETE do usuário: ${userId}`);

    // Contadores para estatísticas
    let totalDeleted = 0;

    // HARD DELETE - Ordem é importante devido às foreign keys

    // 1. Histórico de observações do coach (como aluno)
    console.log("🗑️ Deletando observações como aluno...");
    const deletedObservations1 = await db
      .delete(coachObservationsHistoryTable)
      .where(eq(coachObservationsHistoryTable.userId, userId));
    console.log(
      `   ↳ Deletadas ${deletedObservations1.rowCount || 0} observações como aluno`,
    );
    totalDeleted += deletedObservations1.rowCount || 0;

    // 2. Histórico de observações do coach (como professor)
    console.log("🗑️ Deletando observações como professor...");
    const deletedObservations2 = await db
      .delete(coachObservationsHistoryTable)
      .where(eq(coachObservationsHistoryTable.professorId, userId));
    console.log(
      `   ↳ Deletadas ${deletedObservations2.rowCount || 0} observações como professor`,
    );
    totalDeleted += deletedObservations2.rowCount || 0;

    // 3. Histórico de saúde do aluno
    console.log("🗑️ Deletando histórico de saúde...");
    const deletedHealthHistory = await db
      .delete(studentHealthHistoryTable)
      .where(eq(studentHealthHistoryTable.userId, userId));
    console.log(
      `   ↳ Deletados ${deletedHealthHistory.rowCount || 0} registros de histórico de saúde`,
    );
    totalDeleted += deletedHealthHistory.rowCount || 0;

    // 4. Tokens de confirmação
    console.log("🗑️ Deletando tokens de confirmação...");
    const deletedTokens = await db
      .delete(userConfirmationTokensTable)
      .where(eq(userConfirmationTokensTable.userId, userId));
    console.log(`   ↳ Deletados ${deletedTokens.rowCount || 0} tokens`);
    totalDeleted += deletedTokens.rowCount || 0;

    // 5. Check-ins
    console.log("🗑️ Deletando check-ins...");
    const deletedCheckIns = await db
      .delete(checkInTable)
      .where(eq(checkInTable.userId, userId));
    console.log(`   ↳ Deletados ${deletedCheckIns.rowCount || 0} check-ins`);
    totalDeleted += deletedCheckIns.rowCount || 0;

    // 6. Dados financeiros
    console.log("🗑️ Deletando dados financeiros...");
    const deletedFinancial = await db
      .delete(financialTable)
      .where(eq(financialTable.userId, userId));
    console.log(
      `   ↳ Deletados ${deletedFinancial.rowCount || 0} registros financeiros`,
    );
    totalDeleted += deletedFinancial.rowCount || 0;

    // 7. Dados de saúde (métricas)
    console.log("🗑️ Deletando métricas de saúde...");
    const deletedHealth = await db
      .delete(healthMetricsTable)
      .where(eq(healthMetricsTable.userId, userId));
    console.log(
      `   ↳ Deletados ${deletedHealth.rowCount || 0} registros de métricas`,
    );
    totalDeleted += deletedHealth.rowCount || 0;

    // 8. Dados pessoais
    console.log("🗑️ Deletando dados pessoais...");
    const deletedPersonal = await db
      .delete(personalDataTable)
      .where(eq(personalDataTable.userId, userId));
    console.log(
      `   ↳ Deletados ${deletedPersonal.rowCount || 0} registros pessoais`,
    );
    totalDeleted += deletedPersonal.rowCount || 0;

    // 9. Por último, deletar o usuário principal
    console.log("🗑️ Deletando usuário principal...");
    const deletedUser = await db
      .delete(usersTable)
      .where(eq(usersTable.id, userId));
    console.log(
      `   ↳ Usuário principal deletado: ${deletedUser.rowCount || 0}`,
    );
    totalDeleted += deletedUser.rowCount || 0;

    // Verificar se o usuário realmente foi deletado
    if ((deletedUser.rowCount || 0) === 0) {
      console.log("❌ Falha ao deletar usuário principal!");
      return {
        success: false,
        error:
          "Falha ao deletar usuário. O usuário pode estar sendo referenciado por outros dados.",
      };
    }

    console.log(`✅ HARD DELETE concluído com sucesso!`);
    console.log(`📊 Total de registros deletados: ${totalDeleted}`);
    console.log(
      `👤 Usuário ${user.name} (${user.role}) completamente removido do sistema`,
    );

    return { success: true };
  } catch (error) {
    console.error("❌ ERRO CRÍTICO na exclusão do usuário:", error);

    // Log detalhado do erro
    if (error instanceof Error) {
      console.error("📄 Mensagem:", error.message);
      console.error("🔍 Stack trace:", error.stack);
      console.error("🏷️ Nome do erro:", error.name);
    }

    // Tentar fornecer uma mensagem de erro mais específica
    let errorMessage = "Erro interno ao excluir usuário";

    if (error instanceof Error) {
      if (error.message.includes("foreign key")) {
        errorMessage =
          "Não foi possível excluir o usuário devido a dependências no banco de dados";
      } else if (error.message.includes("permission")) {
        errorMessage = "Sem permissão para excluir este usuário";
      } else if (error.message.includes("connection")) {
        errorMessage = "Erro de conexão com o banco de dados";
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Função auxiliar para buscar usuário com dados pessoais
async function getUserWithPersonalData(userId: string): Promise<User | null> {
  try {
    const result = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        role: usersTable.userRole,
        createdAt: usersTable.createdAt,
        email: personalDataTable.email,
        cpf: personalDataTable.cpf,
        telephone: personalDataTable.telephone,
        address: personalDataTable.address,
        bornDate: personalDataTable.bornDate,
      })
      .from(usersTable)
      .leftJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const user = result[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email || "",
      role: user.role,
      cpf: user.cpf ? formatCPF(user.cpf) : undefined,
      telephone: user.telephone || undefined,
      address: user.address || undefined,
      bornDate: user.bornDate || undefined,
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
      isActive: true,
    };
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}

// Função auxiliar para formatar CPF
function formatCPF(cpf: string): string {
  const numbers = cpf.replace(/\D/g, "");
  if (numbers.length !== 11) return cpf;
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
