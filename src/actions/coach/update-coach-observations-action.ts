"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { healthMetricsTable } from "@/db/schema";

export interface UpdateCoachObservationsState {
  success: boolean;
  error?: string;
  message?: string;
}

export async function updateCoachObservationsAction(
  prevState: UpdateCoachObservationsState,
  formData: FormData,
): Promise<UpdateCoachObservationsState> {
  try {
    const userId = formData.get("userId") as string;
    const coachObservations = formData.get("coachObservations") as string;
    const coachObservationsParticular = formData.get(
      "coachObservationsParticular",
    ) as string;

    if (!userId) {
      return {
        success: false,
        error: "ID do usuário é obrigatório",
      };
    }

    if (!coachObservations?.trim() && !coachObservationsParticular?.trim()) {
      return {
        success: false,
        error: "Pelo menos uma observação deve ser preenchida",
      };
    }

    // Buscar as observações atuais para criar histórico
    const currentData = await db
      .select({
        coachObservations: healthMetricsTable.coachaObservations,
        coachObservationsParticular:
          healthMetricsTable.coachObservationsParticular,
      })
      .from(healthMetricsTable)
      .where(eq(healthMetricsTable.userId, userId))
      .limit(1);

    if (currentData.length === 0) {
      return {
        success: false,
        error: "Aluno não encontrado",
      };
    }

    const current = currentData[0];
    const timestamp = new Date().toLocaleString("pt-BR");

    // Criar histórico das observações gerais
    let newCoachObservations = current.coachObservations || "";
    if (coachObservations?.trim()) {
      const newEntry = `\n\n[${timestamp}] ${coachObservations.trim()}`;
      newCoachObservations = newCoachObservations + newEntry;
    }

    // Criar histórico das observações particulares
    let newCoachObservationsParticular =
      current.coachObservationsParticular || "";
    if (coachObservationsParticular?.trim()) {
      const newEntry = `\n\n[${timestamp}] ${coachObservationsParticular.trim()}`;
      newCoachObservationsParticular =
        newCoachObservationsParticular + newEntry;
    }

    // Atualizar as observações no banco
    await db
      .update(healthMetricsTable)
      .set({
        coachaObservations: newCoachObservations || null,
        coachObservationsParticular: newCoachObservationsParticular || null,
      })
      .where(eq(healthMetricsTable.userId, userId));

    revalidatePath("/admin/coach");
    revalidatePath("/coach");

    return {
      success: true,
      message: "Observações adicionadas com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao atualizar observações do coach:", error);
    return {
      success: false,
      error: "Erro interno do servidor. Tente novamente.",
    };
  }
}
