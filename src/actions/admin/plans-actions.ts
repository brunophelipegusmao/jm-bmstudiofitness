import { apiClient } from "@/lib/api-client";

export interface Plan {
  id: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  priceValue: number;
  durationDays: number;
  durationLabel: string;
  popular: boolean;
  active: boolean;
  displayOrder: number;
}

type PlanPayload = {
  title: string;
  description: string;
  features: string[];
  priceValue: number;
  durationDays: number;
  active?: boolean;
  popular?: boolean;
  displayOrder?: number;
};

const mapFromApi = (input: unknown): Plan => {
  const priceInCents = Number(input.priceInCents ?? 0);
  const durationInDays = Number(input.durationInDays ?? 0);
  return {
    id: String(input.id ?? ""),
    title: String(input.name ?? input.title ?? ""),
    description: String(input.description ?? ""),
    features: Array.isArray(input.features) ? input.features : [],
    price: priceInCents
      ? `R$ ${(priceInCents / 100).toFixed(2).replace(".", ",")}`
      : "R$ 0,00",
    priceValue: priceInCents,
    durationDays: durationInDays,
    durationLabel: durationInDays ? `${durationInDays} dias` : "",
    popular: Boolean(input.isPopular),
    active: input.isActive !== false,
    displayOrder: Number(input.sortOrder ?? 0),
  };
};

export async function getPlansAdminAction(): Promise<{
  success: boolean;
  data?: Plan[];
  error?: string;
}> {
  try {
    const plans = await apiClient.get<Plan[]>("/plans");
    const mapped = Array.isArray(plans) ? plans.map(mapFromApi) : [];
    return { success: true, data: mapped };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar planos";
    return { success: false, error: message, data: [] };
  }
}

export async function createPlanAction(input: PlanPayload) {
  try {
    await apiClient.post("/plans", {
      name: input.title,
      description: input.description,
      priceInCents: input.priceValue,
      durationInDays: input.durationDays,
      features: input.features,
      isPopular: input.popular,
      isActive: input.active,
      sortOrder: input.displayOrder,
    });
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
    await apiClient.patch(`/plans/${id}`, {
      name: input.title,
      description: input.description,
      priceInCents: input.priceValue,
      durationInDays: input.durationDays,
      features: input.features,
      isPopular: input.popular,
      isActive: input.active,
      sortOrder: input.displayOrder,
    });
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
