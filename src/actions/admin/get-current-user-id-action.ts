import { apiClient } from "@/lib/api-client";

export async function getCurrentUserIdAction(): Promise<{
  success: boolean;
  userId?: string | null;
  role?: string;
  error?: string;
}> {
  try {
    const profile = await apiClient.get<{
      id?: string;
      sub?: string;
      role?: string;
    }>("/auth/me");

    const userId = profile?.id ?? profile?.sub ?? null;

    if (!userId) {
      return {
        success: false,
        userId: null,
        role: profile?.role,
        error: "Usuário não encontrado",
      };
    }

    return { success: true, userId, role: profile?.role };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao obter usuário atual";
    return { success: false, userId: null, error: message };
  }
}
