import { apiClient } from "@/lib/api-client";

export interface TodayCheckIn {
  id: string;
  userId: string;
  checkInDate: string;
  checkInTime: string;
  method: string;
  userName: string;
  userRole?: string;
  studentName?: string;
  performedByName?: string;
  notes?: string;
  paymentDaysOverdue?: number | null;
}

export async function getTodayCheckInsAction(): Promise<{
  success: boolean;
  data?: TodayCheckIn[];
  error?: string;
}> {
  try {
    const checkIns = await apiClient.get<TodayCheckIn[]>("/check-ins/today");
    return { success: true, data: checkIns };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar check-ins";
    return { success: false, error: message, data: [] };
  }
}
