"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    console.log("🔐 Iniciando processo de logout...");
    const cookieStore = await cookies();

    // Lista completa de cookies para remover
    const cookiesToClear = [
      "auth-token",
      "user",
      "session",
      "token",
      "jwt",
      "_token",
      "refresh-token",
      "session-id",
    ];

    // Remover todos os cookies de autenticação de forma segura
    cookiesToClear.forEach((cookieName) => {
      cookieStore.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        expires: new Date(0),
        path: "/",
      });
    });

    console.log("✅ Todos os cookies de autenticação removidos com sucesso");
    console.log("📝 Cookies removidos:", cookiesToClear.join(", "));

    return { success: true };
  } catch (error) {
    console.error("❌ Erro durante logout:", error);
    return { success: false };
  }
}

// Versão para uso em forms (sem retorno)
export async function logoutFormAction(): Promise<void> {
  try {
    await logoutAction();
    redirect("/");
  } catch (error) {
    console.error("❌ Erro durante logout no form:", error);
    redirect("/");
  }
}

// Função para logout com redirecionamento automático
export async function logoutAndRedirectAction(): Promise<void> {
  try {
    await logoutAction();
    redirect("/");
  } catch (error) {
    console.error("❌ Erro no logout com redirecionamento:", error);
    redirect("/");
  }
}
