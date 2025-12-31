import { apiClient } from "@/lib/api-client";

export interface MaintenanceSettings {
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
}

export async function getMaintenanceSettings(): Promise<{
  success: boolean;
  data?: MaintenanceSettings;
  message?: string;
  error?: string;
}> {
  try {
    const data = await apiClient.get<MaintenanceSettings>("/settings/maintenance");
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar configurações";
    return { success: false, message, error: message };
  }
}

export async function updateMaintenanceSettings(
  payload: MaintenanceSettings,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await apiClient.patch("/settings/maintenance", payload);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar configurações";
    return { success: false, message, error: message };
  }
}
