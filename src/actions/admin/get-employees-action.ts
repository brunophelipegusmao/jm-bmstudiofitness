import { apiClient } from "@/lib/api-client";

export interface EmployeeFullData {
  id: string;
  employeeId: string;
  userId: string;
  name: string;
  cpf?: string;
  email?: string;
  telephone?: string;
  address?: string;
  position: string;
  shift: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  salaryInCents?: number;
  hireDate?: string;
  isActive?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
}

type EmployeeApi = {
  id: string;
  userId: string;
  position: string;
  shift: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  salaryInCents?: number;
  hireDate?: string;
  deletedAt?: string | null;
  createdAt?: string;
  user?: {
    id: string;
    name: string;
    isActive?: boolean;
  };
  personalData?: {
    email?: string;
    telephone?: string;
    address?: string;
    cpf?: string;
  };
};

export async function getEmployeesAction(): Promise<{
  success: boolean;
  data?: EmployeeFullData[];
  error?: string;
}> {
  try {
    const employees = await apiClient.get<EmployeeApi[]>("/employees");

    const mapped =
      employees?.map((emp) => ({
        id: emp.id,
        employeeId: emp.id,
        userId: emp.user?.id ?? emp.userId,
        name: emp.user?.name ?? "",
        cpf: emp.personalData?.cpf,
        email: emp.personalData?.email,
        telephone: emp.personalData?.telephone,
        address: emp.personalData?.address,
        position: emp.position,
        shift: emp.shift,
        shiftStartTime: emp.shiftStartTime,
        shiftEndTime: emp.shiftEndTime,
        salaryInCents: emp.salaryInCents,
        hireDate: emp.hireDate,
        isActive: emp.user?.isActive,
        deletedAt: emp.deletedAt,
        createdAt: emp.createdAt,
      })) ?? [];

    return { success: true, data: mapped };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar funcionários";
    return { success: false, error: message };
  }
}
