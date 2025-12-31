import { apiClient } from "@/lib/api-client";

export type AddHealthEntryState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function addStudentHealthEntryAction(
  _prevState: AddHealthEntryState,
  formData: FormData,
): Promise<AddHealthEntryState> {
  try {
    const heightCm = formData.get("heightCm");
    const weightKg = formData.get("weightKg");
    const notes = formData.get("notes");

    await apiClient.post("/students/health", {
      heightCm: heightCm ? Number(heightCm) : undefined,
      weightKg: weightKg ? Number(weightKg) : undefined,
      notes: notes ?? undefined,
    });

    return { success: true, message: "Métricas atualizadas com sucesso" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao registrar métricas";
    return { success: false, message };
  }
}
