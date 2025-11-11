"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { personalDataTable, usersTable } from "@/db/schema";
import { generateTokenEdge } from "@/lib/auth-edge";
import { verifyPassword } from "@/lib/auth-utils";
import { UserRole } from "@/types/user-roles";

export interface EmployeeLoginState {
  email: string;
  error: string;
  success?: boolean;
}

export async function employeeLoginAction(
  prevState: EmployeeLoginState,
  formData: FormData,
): Promise<EmployeeLoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validação básica
  if (!email || !password) {
    return {
      email: email || "",
      error: "Email e senha são obrigatórios",
    };
  }

  try {
    // Buscar usuário pelo email
    const userWithPersonalData = await db
      .select({
        user: usersTable,
        personalData: personalDataTable,
      })
      .from(usersTable)
      .innerJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .where(eq(personalDataTable.email, email.toLowerCase()))
      .limit(1);

    if (userWithPersonalData.length === 0) {
      return {
        email,
        error: "Email ou senha incorretos",
      };
    }

    const { user, personalData } = userWithPersonalData[0];

    // Verificar se o usuário tem senha
    if (!user.password) {
      return {
        email,
        error: "Este usuário não possui acesso ao sistema",
      };
    }

    // Verificar senha
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return {
        email,
        error: "Email ou senha incorretos",
      };
    }

    // Verificar se é funcionário
    if (user.userRole !== UserRole.FUNCIONARIO) {
      return {
        email,
        error: "Acesso negado: apenas funcionários podem fazer login aqui",
      };
    }

    // Gerar JWT token
    const token = await generateTokenEdge({
      userId: user.id,
      email: personalData.email,
      role: user.userRole,
    });

    // Definir cookie com token
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: "/",
    });
  } catch (error) {
    console.error("Erro no login do funcionário:", error);
    return {
      email,
      error: "Erro interno do servidor. Tente novamente.",
    };
  }

  // Redirecionar para área do funcionário
  redirect("/employee/dashboard");
}
