import { apiClient } from "@/lib/api-client";

export interface PublicPlan {
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

const mapPlan = (input: unknown): PublicPlan => {
  const data = input as Record<string, unknown>;
  const priceInCents = Number(data.priceInCents ?? 0);
  const durationInDays = Number(data.durationInDays ?? 0);

  return {
    id: String(data.id ?? ""),
    title: String(data.name ?? data.title ?? "Plano"),
    description: String(data.description ?? ""),
    features: Array.isArray(data.features) ? (data.features as string[]) : [],
    price: priceInCents
      ? `R$ ${(priceInCents / 100).toFixed(2).replace(".", ",")}`
      : "R$ 0,00",
    priceValue: priceInCents,
    durationDays: durationInDays,
    durationLabel: durationInDays ? `${durationInDays} dias` : "Acesso livre",
    popular: Boolean(data.isPopular),
    active: data.isActive !== false,
    displayOrder: Number(data.sortOrder ?? 0),
  };
};

export async function getPublicPlansAction(): Promise<{
  success: boolean;
  data?: PublicPlan[];
  error?: string;
}> {
  try {
    const plans = await apiClient.get<unknown[]>("/plans/public");
    const mapped = Array.isArray(plans)
      ? plans.map(mapPlan).filter((plan) => plan.active)
      : [];
    const sorted = [...mapped].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    return { success: true, data: sorted };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar planos";
    return { success: false, error: message, data: [] };
  }
}
