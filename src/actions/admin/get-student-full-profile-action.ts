import { apiClient } from "@/lib/api-client";

export interface StudentFullProfile {
  student: {
    id: string;
    name: string;
    email?: string | null;
    cpf?: string | null;
    bornDate?: string | Date | null;
    address?: string | null;
    telephone?: string | null;
    isActive?: boolean;
    createdAt?: string | Date | null;
    userRole?: string | null;
  };
  health: Record<string, unknown> | null;
  financial: Array<
    {
      id: string;
      amountInCents: number;
      dueDate: number | null;
      paid: boolean;
      paymentMethod: string | null;
      lastPaymentDate: string | Date | null;
      createdAt?: string | Date | null;
    }
  >;
  checkIns: Array<{
    id: string;
    checkInDate: string | Date | null;
    checkInTime: string | null;
    method: string | null;
    identifier: string | null;
  }>;
}

export async function getStudentFullProfileAction(
  id: string,
): Promise<StudentFullProfile> {
  const response = await apiClient.get<unknown>(`/students/${id}/full`);
  const data = response as Record<string, unknown>;

  return {
    student: (data.student as StudentFullProfile["student"]) ?? {
      id,
      name: "",
    },
    health: (data.health as Record<string, unknown> | null) ?? null,
    financial:
      (data.financial as StudentFullProfile["financial"])?.map((f) => ({
        ...f,
        amountInCents: Number(f.amountInCents ?? 0),
      })) ?? [],
    checkIns: (data.checkIns as StudentFullProfile["checkIns"]) ?? [],
  };
}
