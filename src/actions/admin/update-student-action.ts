import { apiClient } from "@/lib/api-client";

export interface UpdateStudentData {
  id: string;
  name?: string;
  email?: string;
  telephone?: string;
  cpf?: string;
  address?: string;
  sex?: string;
  bornDate?: string;
  monthlyFeeValueInCents?: number;
  paymentMethod?: string;
  dueDate?: number;
  planId?: string;
  isActive?: boolean;
  // allows arbitrary extra fields without breaking callers
  [key: string]: unknown;
}

export async function updateStudentAction(
  payload: UpdateStudentData,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { id, ...data } = payload;
    await apiClient.patch(`/students/${id}`, data);
    return { success: true, message: "Aluno atualizado com sucesso" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar aluno";
    return { success: false, error: message, message };
  }
}
