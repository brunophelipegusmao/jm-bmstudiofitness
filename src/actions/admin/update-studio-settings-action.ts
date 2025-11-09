"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { studioSettingsTable } from "@/db/schema";

export type UpdateStudioSettingsInput = Partial<
  Omit<
    typeof studioSettingsTable.$inferInsert,
    "id" | "createdAt" | "updatedAt"
  >
>;

/**
 * Atualiza ou cria as configurações do estúdio
 * Como só existe uma configuração, sempre atualiza a primeira ou cria se não existir
 */
export async function updateStudioSettingsAction(
  data: UpdateStudioSettingsInput,
): Promise<{ success: boolean; message: string }> {
  try {
    // Busca se já existe configuração
    const existingSettings = await db.query.studioSettingsTable.findFirst();

    if (existingSettings) {
      // Atualiza configuração existente
      await db
        .update(studioSettingsTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(studioSettingsTable.id, existingSettings.id));

      return {
        success: true,
        message: "Configurações atualizadas com sucesso!",
      };
    } else {
      // Cria nova configuração
      await db.insert(studioSettingsTable).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Configurações criadas com sucesso!",
      };
    }
  } catch (error) {
    console.error("Erro ao atualizar configurações do estúdio:", error);
    return {
      success: false,
      message: "Erro ao salvar as configurações. Tente novamente.",
    };
  }
}
