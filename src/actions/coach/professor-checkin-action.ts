import { apiClient } from "@/lib/api-client";

export type ProfessorCheckIn = {
  date: string;
  time: string;
  checkInTime: string;
  notes: string | null;
};

export async function professorCheckInAction(): Promise<{
  success: boolean;
  message?: string;
  checkInData?: ProfessorCheckIn;
}> {
  try {
    const data = await apiClient.post<ProfessorCheckIn>("/check-ins/employee");
    const normalized: ProfessorCheckIn = {
      date: data.date,
      time: data.time ?? data.checkInTime ?? "",
      checkInTime: data.checkInTime ?? data.time ?? "",
      notes: data.notes ?? null,
    };
    return {
      success: true,
      checkInData: normalized,
      message: "Check-in realizado",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao realizar check-in";
    return { success: false, message };
  }
}

export async function getProfessorCheckInsAction(
  startDate: string,
  endDate: string,
): Promise<{ success: boolean; data: ProfessorCheckIn[] }> {
  try {
    const data = await apiClient.get<ProfessorCheckIn[]>(
      `/check-ins/employee?startDate=${startDate}&endDate=${endDate}`,
    );
    const list = Array.isArray(data)
      ? data.map((item) => ({
          date: item.date,
          time: item.time ?? item.checkInTime ?? "",
          checkInTime: item.checkInTime ?? item.time ?? "",
          notes: item.notes ?? null,
        }))
      : [];
    return { success: true, data: list };
  } catch (error) {
    console.error("Erro ao carregar check-ins do professor:", error);
    return { success: false, data: [] };
  }
}
