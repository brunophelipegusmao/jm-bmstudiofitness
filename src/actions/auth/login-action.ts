"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { personalDataTable, usersTable } from "@/db/schema";
import { generateTokenEdge } from "@/lib/auth-edge";
import { verifyPassword } from "@/lib/auth-utils";
import { UserRole } from "@/types/user-roles";

export interface LoginState {
  email: string;
  error: string;
  success?: boolean;
}

export async function loginAction(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  let userRole: UserRole | null = null;

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

    // Verificar se o usuário tem senha (apenas admin e professores)
    if (!user.password) {
      return {
        email,
        error: "Este usuário não possui acesso ao sistema administrativo",
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

    // Verificar se é admin, professor, funcionário ou aluno
    if (
      user.userRole !== UserRole.ADMIN &&
      user.userRole !== UserRole.PROFESSOR &&
      user.userRole !== UserRole.FUNCIONARIO &&
      user.userRole !== UserRole.ALUNO
    ) {
      return {
        email,
        error: "Tipo de usuário não permitido para login",
      };
    }

    // Gerar JWT token
    const token = await generateTokenEdge({
      userId: user.id,
      email: personalData.email,
      role: user.userRole,
      name: personalData.fullName,
    });

    // Armazenar role para uso após o try/catch
    userRole = user.userRole;

    // Definir cookie com token (sem maxAge = cookie de sessão, removido ao fechar navegador)
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // Sem maxAge: cookie de sessão - será removido ao fechar o navegador
    });

    console.log(
      "✅ Token JWT criado como cookie de sessão (será removido ao fechar navegador)",
    );

    const successResult = {
      email,
      error: "",
      success: true as const,
    };
    // In tests we avoid performing redirects so tests can inspect the result
    if (process.env.NODE_ENV === "test") {
      return successResult;
    }
  } catch (error) {
    console.error("Erro no login:", error);
    return {
      email,
      error: "Erro ao realizar login. Tente novamente.",
    };
  }

  // Redirecionar para dashboard apropriado baseado no tipo de usuário
  if (userRole === UserRole.ADMIN) {
    redirect("/admin/dashboard");
  } else if (userRole === UserRole.PROFESSOR) {
    redirect("/coach");
  } else if (userRole === UserRole.ALUNO) {
    redirect("/user/dashboard");
  } else {
    // Fallback para admin dashboard
    redirect("/admin/dashboard");
  }
}
