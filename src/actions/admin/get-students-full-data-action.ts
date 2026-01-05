import { apiClient } from "@/lib/api-client";
import type { StudentFullData } from "@/types/users";

export type { StudentFullData };

/**
 * Busca todos os alunos com dados básicos (adaptado do endpoint /students)
 * Retorna uma lista compatível com StudentFullData usada no dashboard.
 */
export async function getAllStudentsFullDataAction(): Promise<
  StudentFullData[]
> {
  const response = await apiClient.get<{ data?: unknown[] }>(
    "/students?limit=500",
  );

  const rawStudents = (response as { data?: unknown[] }).data || [];

  return rawStudents.map((student) => {
    const s = student as Record<string, unknown>;
    const pd = (s.personalData as Record<string, unknown> | undefined) ?? {};

    const mapped: StudentFullData = {
      id: (s.id as string) ?? "",
      userId: (s.id as string) ?? "",
      name: (s.name as string) ?? "",
      email: (s.email as string) ?? (pd.email as string) ?? "",
      cpf: (s.cpf as string) ?? (pd.cpf as string) ?? "",
      telephone: (s.telephone as string) ?? (pd.telephone as string) ?? "",
      sex:
        ((s.sex as StudentFullData["sex"]) ||
          (pd.sex as StudentFullData["sex"])) ??
        "masculino",
      bornDate: (s.bornDate as Date | string | undefined) ?? (pd.bornDate as string) ?? "",
      address: (s.address as string) ?? (pd.address as string) ?? "",
      role: "aluno",
      userRole: (s.userRole as string) || "aluno",
      planId: (s.planId as string | null | undefined) ?? null,
      planName: (s.planName as string | null | undefined) ?? null,
      planValue: (s.planValue as number | null | undefined) ?? null,
      paymentDueDay: (s.dueDate as number | null | undefined) ?? null,
      active: (s.isActive as boolean | undefined) ?? true,
      deletedAt: (s.deletedAt as Date | null | undefined) ?? null,
      createdAt: (s.createdAt as Date | string | undefined) ?? "",
      age: s.age as number | undefined,
      formattedMonthlyFee: s.formattedMonthlyFee as string | undefined,
      heightCm: s.heightCm as number | string | undefined,
      weightKg: s.weightKg as number | string | undefined,
      bloodType: s.bloodType as string | undefined,
      hasPracticedSports: s.hasPracticedSports as boolean | undefined,
      lastExercise: s.lastExercise as string | undefined,
      sportsHistory: s.sportsHistory as string | undefined,
      historyDiseases: s.historyDiseases as string | undefined,
      medications: s.medications as string | undefined,
      allergies: s.allergies as string | undefined,
      injuries: s.injuries as string | undefined,
      alimentalRoutine: s.alimentalRoutine as string | undefined,
      diaryRoutine: s.diaryRoutine as string | undefined,
      useSupplements: s.useSupplements as boolean | undefined,
      whatSupplements: s.whatSupplements as string | undefined,
      otherNotes: s.otherNotes as string | undefined,
      coachaObservations: s.coachaObservations as string | undefined,
      coachObservationsParticular: s.coachObservationsParticular as
        | string
        | undefined,
      healthUpdatedAt: s.healthUpdatedAt as Date | string | undefined,
      monthlyFeeValueInCents: s.monthlyFeeValueInCents as
        | number
        | undefined,
      paymentMethod: s.paymentMethod as string | undefined,
      dueDate: s.dueDate as number | undefined,
      paid: s.paid as boolean | undefined,
      isPaymentUpToDate: s.isPaymentUpToDate as boolean | undefined,
      lastPaymentDate: s.lastPaymentDate as Date | string | null | undefined,
    };
    return mapped;
  });
}
