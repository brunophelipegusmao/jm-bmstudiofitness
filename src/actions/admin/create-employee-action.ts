import { apiClient } from "@/lib/api-client";

interface CreateEmployeeParams {
  name: string;
  cpf: string;
  email: string;
  telephone: string;
  address: string;
  bornDate: string;
  password: string;
  position: string;
  shift: string;
  shiftStartTime: string;
  shiftEndTime: string;
  salary: string;
  salaryInCents?: number;
  hireDate: string;
}

export async function createEmployeeAction(params: CreateEmployeeParams) {
  try {
    const salaryInCents =
      params.salaryInCents ?? Math.round(parseFloat(params.salary) * 100);

    const user = await apiClient.post<{ id: string }>("/users", {
      name: params.name,
      email: params.email,
      password: params.password,
      cpf: params.cpf,
      bornDate: params.bornDate,
      address: params.address,
      telephone: params.telephone,
      role: "funcionario",
    });

    await apiClient.post("/employees", {
      userId: user.id,
      position: params.position,
      shift: params.shift,
      shiftStartTime: params.shiftStartTime,
      shiftEndTime: params.shiftEndTime,
      salaryInCents,
      hireDate: params.hireDate,
    });

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao cadastrar funcionário";
    return { success: false, error: message };
  }
}
