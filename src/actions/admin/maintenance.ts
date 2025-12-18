"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { studioSettingsTable } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";

/**
 * Obtém as configurações de manutenção e controle de rotas do sistema
 */
export async function getMaintenanceSettings() {
  try {
    console.log("🔍 [getMaintenanceSettings] Iniciando busca...");

    const settings = await db
      .select({
        maintenanceMode: studioSettingsTable.maintenanceMode,
        maintenanceRedirectUrl: studioSettingsTable.maintenanceRedirectUrl,
        routeHomeEnabled: studioSettingsTable.routeHomeEnabled,
        routeUserEnabled: studioSettingsTable.routeUserEnabled,
        routeCoachEnabled: studioSettingsTable.routeCoachEnabled,
        routeEmployeeEnabled: studioSettingsTable.routeEmployeeEnabled,
        routeShoppingEnabled: studioSettingsTable.routeShoppingEnabled,
        routeBlogEnabled: studioSettingsTable.routeBlogEnabled,
        routeServicesEnabled: studioSettingsTable.routeServicesEnabled,
        routeContactEnabled: studioSettingsTable.routeContactEnabled,
        routeWaitlistEnabled: studioSettingsTable.routeWaitlistEnabled,
      })
      .from(studioSettingsTable)
      .limit(1);

    console.log("📊 [getMaintenanceSettings] Resultados:", {
      count: settings?.length,
      hasData: settings && settings.length > 0,
      firstRow: settings?.[0],
    });

    if (!settings || settings.length === 0) {
      console.error(
        "❌ [getMaintenanceSettings] Nenhuma configuração encontrada",
      );
      return {
        success: false,
        error: "Configurações não encontradas",
      };
    }

    console.log(
      "✅ [getMaintenanceSettings] Configurações encontradas com sucesso",
    );
    return {
      success: true,
      data: settings[0],
    };
  } catch (error) {
    console.error(
      "❌ [getMaintenanceSettings] Erro ao obter configurações:",
      error,
    );
    return {
      success: false,
      error: "Erro ao obter configurações",
    };
  }
}

/**
 * Atualiza as configurações de manutenção e controle de rotas do sistema
 * Apenas administradores podem executar esta ação
 */
export async function updateMaintenanceSettings(data: {
  maintenanceMode: boolean;
  maintenanceRedirectUrl?: string;
  routeHomeEnabled?: boolean;
  routeUserEnabled?: boolean;
  routeCoachEnabled?: boolean;
  routeEmployeeEnabled?: boolean;
  routeShoppingEnabled?: boolean;
  routeBlogEnabled?: boolean;
  routeServicesEnabled?: boolean;
  routeContactEnabled?: boolean;
  routeWaitlistEnabled?: boolean;
}) {
  try {
    // Verifica se o usuário está autenticado e é admin
    await requireAdmin();

    // Busca o primeiro registro de configurações
    const settings = await db.select().from(studioSettingsTable).limit(1);

    if (!settings || settings.length === 0) {
      return {
        success: false,
        error: "Configurações não encontradas",
      };
    }

    // Atualiza as configurações
    await db
      .update(studioSettingsTable)
      .set({
        maintenanceMode: data.maintenanceMode,
        maintenanceRedirectUrl: data.maintenanceRedirectUrl || "/waitlist",
        routeHomeEnabled: data.routeHomeEnabled,
        routeUserEnabled: data.routeUserEnabled,
        routeCoachEnabled: data.routeCoachEnabled,
        routeEmployeeEnabled: data.routeEmployeeEnabled,
        routeShoppingEnabled: data.routeShoppingEnabled,
        routeBlogEnabled: data.routeBlogEnabled,
        routeServicesEnabled: data.routeServicesEnabled,
        routeContactEnabled: data.routeContactEnabled,
        routeWaitlistEnabled: data.routeWaitlistEnabled,
        updatedAt: new Date(),
      })
      .where(eq(studioSettingsTable.id, settings[0].id));

    // Revalida as páginas para refletir as mudanças
    revalidatePath("/admin");
    revalidatePath("/");

    return {
      success: true,
      message: `Configurações atualizadas com sucesso`,
    };
  } catch (error) {
    console.error("Erro ao atualizar configurações de manutenção:", error);
    return {
      success: false,
      error: "Erro ao atualizar configurações",
    };
  }
}
