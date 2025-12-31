import { apiClient } from "@/lib/api-client";

export interface UpdateUserPayload {
  id: string;
  name?: string;
  email?: string;
  telephone?: string;
  address?: string;
  cpf?: string;
  bornDate?: string;
  password?: string;
  confirmPassword?: string;
  userRole?: string;
  // extensible for additional fields
  [key: string]: unknown;
}

export async function updateUserAction(
  adminId: string,
  payload: UpdateUserPayload,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { id, ...data } = payload;
    await apiClient.patch(`/users/${id}`, { ...data, adminId });
    return { success: true, message: "Usuário atualizado com sucesso" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar usuário";
    return { success: false, error: message, message };
  }
}
