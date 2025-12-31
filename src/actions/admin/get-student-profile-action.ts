import { apiClient } from "@/lib/api-client";

export interface StudentProfile {
  student: {
    id: string;
    name: string;
    isActive: boolean;
    createdAt?: string;
    userRole?: string;
    personalData?: {
      email?: string;
      cpf?: string;
      bornDate?: string;
      address?: string;
      telephone?: string;
      sex?: string;
    };
  };
  health?: Record<string, unknown> | null;
  financial: Array<{
    id: string;
    amountInCents: number;
    dueDate: number | null;
    paid: boolean;
    paymentMethod: string | null;
    lastPaymentDate: string | null;
    createdAt?: string | null;
  }>;
  checkIns: Array<{
    id: string;
    checkInDate: string;
    checkInTime: string;
    method?: string | null;
    identifier?: string | null;
  }>;
}

export async function getStudentProfileAction(
  id: string,
): Promise<{ success: boolean; data?: StudentProfile; error?: string }> {
  try {
    const data = await apiClient.get<StudentProfile>(`/students/${id}/full`);
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao carregar detalhes do aluno";
    return { success: false, error: message };
  }
}
