import { apiClient } from "@/lib/api-client";

export interface UpdateUserPayload {
  id: string;
  name?: string;
  email?: string;
  telephone?: string;
  address?: string;
  cpf?: string;
  bornDate?: string;
  sex?: string;
  isActive?: boolean;
  userRole?: string;
  monthlyFeeValueInCents?: number;
  paymentMethod?: string;
  dueDate?: number;
  // extensible for additional fields
  [key: string]: unknown;
}

export async function updateUserAction(
  _adminId: string,
  payload: UpdateUserPayload,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { id, ...data } = payload;

    // Enviar apenas campos aceitos pelo DTO do backend
    const allowed: Record<string, unknown> = {};
    if (data.name !== undefined) allowed.name = data.name;
    if (data.email !== undefined) allowed.email = data.email;
    if (data.telephone !== undefined) allowed.telephone = data.telephone;
    if (data.address !== undefined) allowed.address = data.address;
    if (data.bornDate !== undefined) allowed.bornDate = data.bornDate;
    if (data.cpf !== undefined) allowed.cpf = data.cpf;
    if (data.sex !== undefined) allowed.sex = data.sex;
    if (data.userRole !== undefined) allowed.userRole = data.userRole;
    if (data.isActive !== undefined) allowed.isActive = data.isActive;
    if (data.monthlyFeeValueInCents !== undefined)
      allowed.monthlyFeeValueInCents = data.monthlyFeeValueInCents;
    if (data.paymentMethod !== undefined)
      allowed.paymentMethod = data.paymentMethod;
    if (data.dueDate !== undefined) allowed.dueDate = data.dueDate;

    await apiClient.patch(`/users/${id}`, allowed);
    return { success: true, message: "Usuario atualizado com sucesso" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar usuario";
    return { success: false, error: message, message };
  }
}
