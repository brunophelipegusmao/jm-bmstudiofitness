import { apiClient } from "@/lib/api-client";
import type { StudentPaymentData } from "@/types/payments";

export type { StudentPaymentData };

type FinancialRecord = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  monthlyFeeValue?: number;
  monthlyFeeValueInCents?: number;
  dueDate?: number | string;
  paid?: boolean;
  lastPaymentDate?: string | null;
  paymentMethod?: string | null;
};

export async function getStudentsPaymentsAction(options?: {
  includePaid?: boolean;
}): Promise<StudentPaymentData[]> {
  try {
    const includePaid = options?.includePaid ?? false;
    const query = includePaid ? "" : "?limit=500&page=1&paid=false";
    const records = await apiClient.get<
      { data?: FinancialRecord[] } | FinancialRecord[]
    >(`/financial${query}`);

    if (Array.isArray(records)) {
      // Caso o backend retorne array direto
      return records.map(mapFinancialToPayment);
    }

    const data = records?.data ?? [];
    return data.map(mapFinancialToPayment);
  } catch (error) {
    console.error("Erro ao carregar pagamentos de alunos:", error);
    return [];
  }
}

function mapFinancialToPayment(record: FinancialRecord): StudentPaymentData {
  const monthlyFee = record.monthlyFeeValue ?? record.monthlyFeeValueInCents ?? 0;
  const dueDate = record.dueDate;
  const today = new Date();
  const day = typeof dueDate === "number" ? dueDate : Number(dueDate) || 0;
  const todayDay = today.getDate();
  const isOverdue = !record.paid && day > 0 && todayDay > day;

  return {
    id: record.id,
    userId: record.userId,
    name: record.userName ?? "",
    email: record.userEmail ?? "",
    telephone: record.userPhone ?? "",
    planName: "Mensalidade",
    planValue: monthlyFee,
    paid: !!record.paid,
    paymentMethod: record.paymentMethod ?? undefined,
    isUpToDate: !!record.paid && !isOverdue,
    paymentDate: record.lastPaymentDate ? new Date(record.lastPaymentDate) : null,
    lastPaymentDate: record.lastPaymentDate
      ? new Date(record.lastPaymentDate)
      : null,
    dueDate: typeof dueDate === "number" ? dueDate : Number(dueDate) || 0,
    monthlyFeeValueInCents: monthlyFee,
    formattedValue: `R$ ${(monthlyFee / 100).toFixed(2).replace(".", ",")}`,
  };
}
