import { apiClient } from "@/lib/api-client";

export type UpdateHealthPayload = {
  heightCm?: string | number;
  weightKg?: string | number;
  bloodType?: string;
  hasPracticedSports?: boolean;
  lastExercise?: string;
  sportsHistory?: string;
  historyDiseases?: string;
  medications?: string;
  allergies?: string;
  injuries?: string;
  alimentalRoutine?: string;
  diaryRoutine?: string;
  useSupplements?: boolean;
  whatSupplements?: string;
  otherNotes?: string;
};

export async function updateStudentHealthAction(
  id: string,
  payload: UpdateHealthPayload,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.patch(`/students/${id}/health`, payload);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar saúde";
    return { success: false, error: message };
  }
}
