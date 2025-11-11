"use server";

import { asc, desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { plansTable, usersTable } from "@/db/schema";
import { verifyToken } from "@/lib/auth-utils";

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

export interface CreatePlanData {
  title: string;
  description: string;
  features: string[];
  price: string;
  priceValue: number;
  duration: string;
  capacity: string;
  icon: string;
  gradient: string;
  popular?: boolean;
  active?: boolean;
  displayOrder?: number;
}

export interface UpdatePlanData extends Partial<CreatePlanData> {
  id: string;
}

// ==========================================
// GET ALL PLANS (Admin)
// ==========================================

export async function getPlansAdminAction(): Promise<{
  success: boolean;
  data?: Plan[];
  error?: string;
}> {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Você precisa estar logado",
      };
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return {
        success: false,
        error: "Token inválido ou expirado",
      };
    }

    // Verificar se é admin
    const userData = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (userData.length === 0) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    const user = userData[0];

    if (user.userRole !== "admin") {
      return {
        success: false,
        error: "Apenas administradores podem acessar este recurso",
      };
    }

    // Buscar todos os planos ordenados
    const plans = await db
      .select()
      .from(plansTable)
      .orderBy(asc(plansTable.displayOrder), desc(plansTable.createdAt));

    const formattedPlans: Plan[] = plans.map((plan) => ({
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
      active: plan.active,
      displayOrder: plan.displayOrder,
    }));

    return {
      success: true,
      data: formattedPlans,
    };
  } catch (error) {
    console.error("Erro ao buscar planos:", error);

    return {
      success: false,
      error: "Erro ao buscar planos. Tente novamente.",
    };
  }
}

// ==========================================
// CREATE PLAN
// ==========================================

export async function createPlanAction(
  data: CreatePlanData,
): Promise<{ success: boolean; planId?: string; error?: string }> {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Você precisa estar logado",
      };
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return {
        success: false,
        error: "Token inválido ou expirado",
      };
    }

    // Verificar se é admin
    const userData = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (userData.length === 0 || userData[0].userRole !== "admin") {
      return {
        success: false,
        error: "Apenas administradores podem criar planos",
      };
    }

    // Criar plano
    const [newPlan] = await db
      .insert(plansTable)
      .values({
        title: data.title,
        description: data.description,
        features: JSON.stringify(data.features),
        price: data.price,
        priceValue: data.priceValue,
        duration: data.duration,
        capacity: data.capacity,
        icon: data.icon,
        gradient: data.gradient,
        popular: data.popular ?? false,
        active: data.active ?? true,
        displayOrder: data.displayOrder ?? 0,
      })
      .returning({ id: plansTable.id });

    return {
      success: true,
      planId: newPlan.id,
    };
  } catch (error) {
    console.error("Erro ao criar plano:", error);

    return {
      success: false,
      error: "Erro ao criar plano. Tente novamente.",
    };
  }
}

// ==========================================
// UPDATE PLAN
// ==========================================

export async function updatePlanAction(
  data: UpdatePlanData,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Você precisa estar logado",
      };
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return {
        success: false,
        error: "Token inválido ou expirado",
      };
    }

    // Verificar se é admin
    const userData = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (userData.length === 0 || userData[0].userRole !== "admin") {
      return {
        success: false,
        error: "Apenas administradores podem atualizar planos",
      };
    }

    // Preparar dados para atualização
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.features !== undefined)
      updateData.features = JSON.stringify(data.features);
    if (data.price !== undefined) updateData.price = data.price;
    if (data.priceValue !== undefined) updateData.priceValue = data.priceValue;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.gradient !== undefined) updateData.gradient = data.gradient;
    if (data.popular !== undefined) updateData.popular = data.popular;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.displayOrder !== undefined)
      updateData.displayOrder = data.displayOrder;

    // Atualizar plano
    await db
      .update(plansTable)
      .set(updateData)
      .where(eq(plansTable.id, data.id));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao atualizar plano:", error);

    return {
      success: false,
      error: "Erro ao atualizar plano. Tente novamente.",
    };
  }
}

// ==========================================
// DELETE PLAN
// ==========================================

export async function deletePlanAction(
  planId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Você precisa estar logado",
      };
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return {
        success: false,
        error: "Token inválido ou expirado",
      };
    }

    // Verificar se é admin
    const userData = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId))
      .limit(1);

    if (userData.length === 0 || userData[0].userRole !== "admin") {
      return {
        success: false,
        error: "Apenas administradores podem deletar planos",
      };
    }

    // Deletar plano
    await db.delete(plansTable).where(eq(plansTable.id, planId));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao deletar plano:", error);

    return {
      success: false,
      error: "Erro ao deletar plano. Tente novamente.",
    };
  }
}
