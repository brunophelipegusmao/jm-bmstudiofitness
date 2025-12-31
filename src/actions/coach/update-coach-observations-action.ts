import { apiClient } from "@/lib/api-client";

export type CoachObservationState = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function updateCoachObservationsAction(
  _prevState: CoachObservationState,
  formData: FormData,
): Promise<CoachObservationState> {
  try {
    const studentId = formData.get("studentId") as string | null;
    const observation = formData.get("observation") as string | null;

    if (!studentId || !observation) {
      return { success: false, error: "Dados inválidos" };
    }

    await apiClient.post(`/students/${studentId}/observations`, {
      observation,
    });

    return { success: true, message: "Observação salva com sucesso" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao salvar observação";
    return { success: false, error: message };
  }
}
