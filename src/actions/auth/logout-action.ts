"use server";

import { cookies } from "next/headers";

export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();

    // Remover o cookie de autenticação
    cookieStore.delete("auth-token");

    return { success: true };
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return { success: false };
  }
}
