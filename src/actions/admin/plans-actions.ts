import { apiClient } from "@/lib/api-client";

export interface Plan {
  id: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  priceValue: number;
  duration: string;
  capacity: string;
  icon: string;
  gradient: string;
  popular: boolean;
  active: boolean;
  displayOrder: number;
}

type PlanPayload = Omit<Plan, "id" | "active" | "popular" | "displayOrder"> & {
  id?: string;
  active?: boolean;
  popular?: boolean;
  displayOrder?: number;
};

export async function getPlansAdminAction(): Promise<{
  success: boolean;
  data?: Plan[];
  error?: string;
}> {
  try {
    const plans = await apiClient.get<Plan[]>("/plans");
    return { success: true, data: Array.isArray(plans) ? plans : [] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar planos";
    return { success: false, error: message, data: [] };
  }
}

export async function createPlanAction(input: PlanPayload) {
  try {
    await apiClient.post("/plans", input);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar plano";
    return { success: false, error: message };
  }
}

export async function updatePlanAction(
  payload: { id: string } & Partial<PlanPayload>,
) {
  try {
    const { id, ...input } = payload;
    await apiClient.patch(`/plans/${id}`, input);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar plano";
    return { success: false, error: message };
  }
}

export async function deletePlanAction(id: string) {
  try {
    await apiClient.delete(`/plans/${id}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir plano";
    return { success: false, error: message };
  }
}
