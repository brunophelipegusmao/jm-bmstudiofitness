import { apiClient } from "@/lib/api-client";

export interface StudentCheckInAdmin {
  id: string;
  userId: string;
  checkInDate: string;
  checkInTime: string;
  method: string | null;
  identifier: string | null;
  checkedInBy?: string | null;
}

export async function getStudentCheckinsAction(
  studentId: string,
): Promise<{ success: boolean; data?: StudentCheckInAdmin[]; error?: string }> {
  if (!studentId) {
    return { success: false, error: "Aluno não informado" };
  }

  try {
    const data = await apiClient.get<StudentCheckInAdmin[]>(
      `/check-ins/user/${studentId}/history`,
    );
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao buscar histórico de check-ins";
    return { success: false, error: message, data: [] };
  }
}
