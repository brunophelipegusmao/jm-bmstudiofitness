import { apiClient } from "@/lib/api-client";

export interface EmployeeCheckInResult {
  success: boolean;
  message: string;
  studentName?: string;
  daysOverdue?: number;
}

export async function employeeCheckInAction(
  identifier: string,
  method: "cpf" | "email" | "manual",
  notes?: string,
): Promise<EmployeeCheckInResult> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      studentName?: string;
    }>("/check-ins/employee", { identifier, method, notes });

    return {
      success: response.success ?? true,
      message: response.message ?? "Check-in realizado com sucesso",
      studentName: response.studentName,
      daysOverdue: 0,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao realizar check-in";
    return { success: false, message };
  }
}
