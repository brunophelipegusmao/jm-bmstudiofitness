"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { personalDataTable, usersTable } from "@/db/schema";
import { UserRole } from "@/types/user-roles";

/**
 * Verifica se já existe algum administrador no sistema
 */
export async function hasAdminUser() {
  try {
    const admins = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userRole, UserRole.ADMIN))
      .limit(1);

    return admins.length > 0;
  } catch (error) {
    console.error("Erro ao verificar administradores:", error);
    return false;
  }
}

/**
 * Cria o primeiro usuário administrador do sistema
 * Esta função só funciona se não houver nenhum admin cadastrado
 */
export async function createFirstAdmin(data: {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
}) {
  try {
    console.log("🔍 Iniciando criação de admin...");

    // Verifica se já existe algum admin
    const adminExists = await hasAdminUser();

    if (adminExists) {
      console.log("⚠️ Admin já existe");
      return {
        success: false,
        error: "Já existe um administrador no sistema",
      };
    }

    // Valida os dados
    if (!data.name || !data.email || !data.password) {
      console.log("⚠️ Dados obrigatórios faltando");
      return {
        success: false,
        error: "Nome, email e senha são obrigatórios",
      };
    }

    if (data.password.length < 6) {
      console.log("⚠️ Senha muito curta");
      return {
        success: false,
        error: "A senha deve ter no mínimo 6 caracteres",
      };
    }

    console.log("🔐 Gerando hash da senha...");
    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    console.log("👤 Criando usuário...");
    // Cria o usuário admin
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name: data.name,
        userRole: UserRole.ADMIN,
        password: hashedPassword,
      })
      .returning();

    console.log("📋 Criando dados pessoais...");
    // Cria os dados pessoais
    await db.insert(personalDataTable).values({
      userId: newUser.id,
      email: data.email,
      telephone: data.phone || "",
      cpf: data.cpf || "00000000000",
      address: "",
      bornDate: new Date().toISOString().split("T")[0],
      sex: "masculino",
    });

    console.log("✅ Admin criado com sucesso!");
    return {
      success: true,
      message: "Administrador criado com sucesso! Você já pode fazer login.",
    };
  } catch (error) {
    console.error("❌ Erro ao criar primeiro admin:", error);

    // Verifica se é erro de autenticação do PostgreSQL
    if (error && typeof error === "object" && "code" in error) {
      const pgError = error as { code?: string; message?: string };

      if (pgError.code === "28P01") {
        return {
          success: false,
          error:
            "Erro de autenticação com o banco de dados. Verifique as credenciais no arquivo .env.local (DATABASE_URL).",
        };
      }

      if (pgError.code === "3D000") {
        return {
          success: false,
          error:
            "Banco de dados não encontrado. Verifique se o banco foi criado e se o nome está correto no DATABASE_URL.",
        };
      }

      if (pgError.code === "ECONNREFUSED") {
        return {
          success: false,
          error:
            "Não foi possível conectar ao banco de dados. Verifique se o PostgreSQL está rodando.",
        };
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return {
      success: false,
      error: `Erro ao criar administrador: ${errorMessage}. Verifique sua conexão com o banco de dados.`,
    };
  }
}
