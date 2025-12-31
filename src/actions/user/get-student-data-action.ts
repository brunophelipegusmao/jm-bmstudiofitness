import { apiClient } from "@/lib/api-client";

export interface StudentData {
  user: {
    name: string;
    id: string;
  };
  personalData: {
    email: string;
    cpf: string;
    bornDate: string;
    address: string;
    telephone: string;
  };
  healthMetrics: {
    heightCm: number;
    weightKg: number;
    bloodType: string;
    updatedAt: string;
  };
  financial: {
    id: string | null;
    paid: boolean;
    monthlyFeeValueInCents: number;
    dueDate: number;
    paymentMethod: string | null;
    lastPaymentDate: string | null;
  };
}

export interface StudentDataResponse {
  success: boolean;
  message: string;
  data: StudentData | null;
}

export async function getStudentDataAction(): Promise<StudentDataResponse> {
  try {
    const data = await apiClient.get<StudentDataResponse>("/students/me");
    return {
      success: data?.success ?? true,
      message: data?.message ?? "",
      data: data?.data ?? null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar dados do aluno";
    return { success: false, message, data: null };
  }
}
