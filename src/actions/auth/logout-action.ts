"use server";

import { cookies } from "next/headers";

import { apiClient } from "@/lib/api-client";

export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  } finally {
    // 1) Limpa tokens no client (localStorage/cookies via document.cookie) quando aplicável
    apiClient.clearTokens?.();

    // 2) Também garante limpeza no server (cookies do App Router), para o middleware não "ver" token antigo.
    try {
      const cookieStore = await cookies();
      const isProd = process.env.NEXT_PUBLIC_BASE_URL?.includes(
        "jmfitnessstudio.com.br",
      );
      const domain = isProd ? ".jmfitnessstudio.com.br" : undefined;

      cookieStore.set("accessToken", "", {
        path: "/",
        expires: new Date(0),
        sameSite: "lax",
        secure: !!isProd,
        httpOnly: false,
        domain,
      });

      cookieStore.set("refreshToken", "", {
        path: "/",
        expires: new Date(0),
        sameSite: "lax",
        secure: !!isProd,
        httpOnly: false,
        domain,
      });
    } catch {
      // Ignora: se estiver fora do App Router/server context, seguimos apenas com a limpeza do client.
    }
  }

  return { success: true };
}

export async function logoutFormAction(): Promise<void> {
  await logoutAction();
}
