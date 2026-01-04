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
  health: {
    heightCm?: number | string | null;
    weightKg?: number | string | null;
    bloodType?: string | null;
    updatedAt?: string | Date | null;
    sportsHistory?: string | null;
    otherNotes?: string | null;
  } | null;
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
  const rawHealth = (data.health as Record<string, unknown> | null) ?? null;
  const normalizeNumberLike = (value: unknown) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number" || typeof value === "string") return value;
    return null;
  };

  return {
    student: (data.student as StudentFullProfile["student"]) ?? {
      id,
      name: "",
    },
    health: rawHealth
      ? {
          heightCm: normalizeNumberLike(rawHealth.heightCm),
          weightKg: normalizeNumberLike(rawHealth.weightKg),
          bloodType:
            typeof rawHealth.bloodType === "string" ? rawHealth.bloodType : null,
          updatedAt: (rawHealth.updatedAt as string | Date | null | undefined) ?? null,
          sportsHistory:
            typeof rawHealth.sportsHistory === "string"
              ? rawHealth.sportsHistory
              : null,
          otherNotes:
            typeof rawHealth.otherNotes === "string" ? rawHealth.otherNotes : null,
        }
      : null,
    financial:
      (data.financial as StudentFullProfile["financial"])?.map((f) => ({
        ...f,
        amountInCents: Number(f.amountInCents ?? 0),
      })) ?? [],
    checkIns: (data.checkIns as StudentFullProfile["checkIns"]) ?? [],
  };
}
