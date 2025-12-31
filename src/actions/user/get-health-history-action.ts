import { apiClient } from "@/lib/api-client";

export interface HealthEntry {
  id: string;
  heightCm: number | null;
  weightKg: string | null;
  notes: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface CurrentHealthData {
  heightCm: number;
  weightKg: number;
  bloodType: string;
  updatedAt: string;
}

export interface HealthHistoryResponse {
  success: boolean;
  message: string;
  history?: HealthEntry[];
  currentHealth?: CurrentHealthData | null;
}

export async function getStudentHealthHistoryAction(): Promise<HealthHistoryResponse> {
  try {
    const data = await apiClient.get<HealthHistoryResponse>(
      "/students/health/history",
    );
    return {
      success: data?.success ?? true,
      message: data?.message ?? "",
      history: data?.history ?? [],
      currentHealth: data?.currentHealth ?? null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar histórico";
    return { success: false, message, history: [], currentHealth: null };
  }
}
