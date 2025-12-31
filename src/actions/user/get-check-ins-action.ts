import { apiClient } from "@/lib/api-client";

export interface StudentCheckIn {
  id: string;
  checkInDate: string;
  checkInTime: string;
  checkInTimestamp: string;
  method: string;
  identifier: string;
  createdAt: string;
}

export interface CheckInStats {
  totalCheckIns: number;
  thisMonth: number;
  thisWeek: number;
  lastCheckIn: string | null;
}

export interface GetCheckInsResponse {
  success: boolean;
  message: string;
  checkIns?: StudentCheckIn[];
  stats?: CheckInStats;
}

export async function getStudentCheckInsAction(): Promise<GetCheckInsResponse> {
  try {
    const data = await apiClient.get<GetCheckInsResponse>("/check-ins/student");
    return {
      success: data?.success ?? true,
      message: data?.message ?? "",
      checkIns: data?.checkIns ?? [],
      stats: data?.stats,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar check-ins";
    return { success: false, message, checkIns: [], stats: undefined };
  }
}
