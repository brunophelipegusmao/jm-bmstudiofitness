"use server";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { plansTable } from "@/db/schema";

export interface PublicPlan {
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
}

/**
 * Busca planos ativos para exibição pública
 * Não requer autenticação
 */
export async function getPublicPlansAction(): Promise<{
  success: boolean;
  data?: PublicPlan[];
  error?: string;
}> {
  try {
    // Buscar apenas planos ativos, ordenados
    const plans = await db
      .select()
      .from(plansTable)
      .where(eq(plansTable.active, true))
      .orderBy(asc(plansTable.displayOrder));

    const formattedPlans: PublicPlan[] = plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      description: plan.description,
      features: JSON.parse(plan.features),
      price: plan.price,
      priceValue: plan.priceValue,
      duration: plan.duration,
      capacity: plan.capacity,
      icon: plan.icon,
      gradient: plan.gradient,
      popular: plan.popular,
    }));

    return {
      success: true,
      data: formattedPlans,
    };
  } catch (error) {
    console.error("Erro ao buscar planos públicos:", error);

    return {
      success: false,
      error: "Erro ao buscar planos. Tente novamente.",
    };
  }
}
