"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { studioSettingsTable } from "@/db/schema";
import { adminGuard } from "@/lib/auth-utils";

/**
 * Busca as configurações do estúdio
 * Público - qualquer um pode visualizar
 */
export async function getStudioSettingsAction() {
  try {
    const settings = await db.select().from(studioSettingsTable).limit(1);

    if (!settings || settings.length === 0) {
      return {
        success: false,
        error: "Configurações do estúdio não encontradas",
      };
    }

    return {
      success: true,
      data: settings[0],
    };
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return {
      success: false,
      error: "Erro ao buscar configurações do estúdio",
    };
  }
}

/**
 * Atualiza as configurações do estúdio
 * Apenas admin pode executar
 */
export async function updateStudioSettingsAction(data: {
  waitlistEnabled?: boolean;
  studioName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Adicione outros campos conforme necessário
}) {
  try {
    // Verificar permissão de admin
    await adminGuard();

    // Buscar configuração existente
    const existingSettings = await db
      .select()
      .from(studioSettingsTable)
      .limit(1);

    if (!existingSettings || existingSettings.length === 0) {
      return {
        success: false,
        error: "Configurações do estúdio não encontradas",
      };
    }

    // Atualizar apenas os campos fornecidos
    const updateData: Partial<typeof studioSettingsTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.waitlistEnabled !== undefined) {
      updateData.waitlistEnabled = data.waitlistEnabled;
    }
    if (data.studioName !== undefined) {
      updateData.studioName = data.studioName;
    }
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }
    if (data.address !== undefined) {
      updateData.address = data.address;
    }
    if (data.city !== undefined) {
      updateData.city = data.city;
    }
    if (data.state !== undefined) {
      updateData.state = data.state;
    }
    if (data.zipCode !== undefined) {
      updateData.zipCode = data.zipCode;
    }

    const updatedSettings = await db
      .update(studioSettingsTable)
      .set(updateData)
      .where(eq(studioSettingsTable.id, existingSettings[0].id))
      .returning();

    return {
      success: true,
      data: updatedSettings[0],
      message: "Configurações atualizadas com sucesso",
    };
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    return {
      success: false,
      error: "Erro ao atualizar configurações do estúdio",
    };
  }
}
