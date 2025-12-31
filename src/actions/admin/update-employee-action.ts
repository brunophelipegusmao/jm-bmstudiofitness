import { apiClient } from "@/lib/api-client";

interface UpdateEmployeeParams {
  id: string;
  email?: string;
  telephone?: string;
  address?: string;
  position?: string;
  shift?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  salary?: string;
  salaryInCents?: number;
  hireDate?: string;
  salaryChangeReason?: string;
  salaryEffectiveDate?: string;
}

export async function updateEmployeeAction(params: UpdateEmployeeParams) {
  try {
    const payload: Partial<{
      email: string;
      telephone: string;
      address: string;
      position: string;
      shift: string;
      shiftStartTime: string;
      shiftEndTime: string;
      salaryInCents: number;
      hireDate: string;
      salaryChangeReason: string;
      salaryEffectiveDate: string;
    }> = {};
    if (params.email !== undefined) payload.email = params.email;
    if (params.telephone !== undefined) payload.telephone = params.telephone;
    if (params.address !== undefined) payload.address = params.address;
    if (params.position !== undefined) payload.position = params.position;
    if (params.shift !== undefined) payload.shift = params.shift;
    if (params.shiftStartTime !== undefined)
      payload.shiftStartTime = params.shiftStartTime;
    if (params.shiftEndTime !== undefined)
      payload.shiftEndTime = params.shiftEndTime;
    if (params.salaryInCents !== undefined) {
      payload.salaryInCents = params.salaryInCents;
    } else if (params.salary !== undefined) {
      payload.salaryInCents = Math.round(parseFloat(params.salary) * 100);
    }
    if (params.hireDate !== undefined) payload.hireDate = params.hireDate;
    if (params.salaryChangeReason !== undefined)
      payload.salaryChangeReason = params.salaryChangeReason;
    if (params.salaryEffectiveDate !== undefined)
      payload.salaryEffectiveDate = params.salaryEffectiveDate;

    await apiClient.patch(`/employees/${params.id}`, payload);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar funcionário";
    return { success: false, error: message };
  }
}
