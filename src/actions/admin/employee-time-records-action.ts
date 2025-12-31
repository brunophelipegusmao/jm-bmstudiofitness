import { apiClient } from "@/lib/api-client";

export interface TimeRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  totalHours?: string | null;
  notes?: string | null;
  approved?: boolean;
  createdAt?: string;
  updatedAt?: string;
  employee?: {
    id: string;
    position?: string;
    shift?: string;
    userName?: string;
  };
}

export async function getEmployeeTimeRecordsAction(
  employeeId: string,
  startDate?: string,
  endDate?: string,
): Promise<{ success: boolean; data?: TimeRecord[]; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (employeeId) params.append("employeeId", employeeId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const records = await apiClient.get<TimeRecord[]>(
      `/employees/time-records/all?${params.toString()}`,
    );
    return { success: true, data: records };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao carregar registros de ponto";
    return { success: false, error: message };
  }
}

export async function registerTimeRecordAction(input: {
  employeeId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Verifica se já existe registro para a data; se sim, faz PATCH
    const existing = await apiClient.get<TimeRecord[]>(
      `/employees/time-records/all?employeeId=${input.employeeId}&startDate=${input.date}&endDate=${input.date}`,
    );

    if (existing && existing.length > 0) {
      const targetId = existing[0].id;
      await apiClient.patch(`/employees/time-records/${targetId}`, {
        checkInTime: input.checkInTime,
        checkOutTime: input.checkOutTime,
        notes: input.notes,
      });
      return { success: true };
    }

    await apiClient.post("/employees/time-records", {
      employeeId: input.employeeId,
      date: input.date,
      checkInTime: input.checkInTime,
      checkOutTime: input.checkOutTime,
      notes: input.notes,
    });

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao registrar ponto do funcionário";
    return { success: false, error: message };
  }
}
