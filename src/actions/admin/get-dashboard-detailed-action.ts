import { apiClient } from "@/lib/api-client";

export interface StudentWithDueDate {
  id: string;
  name: string;
  monthlyFeeFormatted: string;
  isPaid: boolean;
  daysOverdue?: number;
}

export interface DashboardDetailedData {
  vencimentos: number;
  valor: number;
  valorFormatted: string;
  pagamentos: number;
  valorRecebido: number;
  valorRecebidoFormatted: string;
  pendentes: number;
  valorPendente: number;
  valorPendenteFormatted: string;
  taxaConversao: number;
  students: StudentWithDueDate[];
}

function formatCurrency(valueInCents: number) {
  return `R$ ${(valueInCents / 100).toFixed(2).replace(".", ",")}`;
}

type FinancialSummary = {
  count: number;
  total: number;
  totalFormatted?: string;
};

type FinancialResponse = {
  pending?: FinancialSummary;
  received?: FinancialSummary;
};

type PendingPayment = {
  id: string;
  studentName?: string;
  userName?: string;
  amount?: number;
  dueDate?: string;
};

type DetailedResponse = {
  pendingPayments?: PendingPayment[];
};

export async function getDashboardDetailedAction(): Promise<{
  success: boolean;
  data?: DashboardDetailedData;
  error?: string;
}> {
  try {
    const financial = await apiClient.get<FinancialResponse>(
      "/dashboard/financial",
    );
    const detailed = await apiClient.get<DetailedResponse>(
      "/dashboard/detailed",
    );

    const pendingPayments = detailed?.pendingPayments ?? [];

    const students: StudentWithDueDate[] = pendingPayments.map(
      (payment) => ({
        id: payment.id,
        name: payment.studentName ?? payment.userName ?? "Aluno",
        monthlyFeeFormatted: formatCurrency(payment.amount ?? 0),
        isPaid: false,
        daysOverdue: payment.dueDate
          ? Math.max(
              0,
              Math.floor(
                (new Date().getTime() -
                  new Date(payment.dueDate as string).getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            )
          : undefined,
      }),
    );

    const data: DashboardDetailedData = {
      vencimentos: financial?.pending?.count ?? 0,
      valor: financial?.pending?.total ?? 0,
      valorFormatted:
        financial?.pending?.totalFormatted ?? formatCurrency(0),
      pagamentos: financial?.received?.count ?? 0,
      valorRecebido: financial?.received?.total ?? 0,
      valorRecebidoFormatted:
        financial?.received?.totalFormatted ?? formatCurrency(0),
      pendentes: financial?.pending?.count ?? 0,
      valorPendente: financial?.pending?.total ?? 0,
      valorPendenteFormatted:
        financial?.pending?.totalFormatted ?? formatCurrency(0),
      taxaConversao: financial?.received && financial?.pending
        ? Math.round(
            (financial.received.count /
              (financial.received.count + financial.pending.count || 1)) *
              100,
          )
        : 0,
      students,
    };

    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao carregar dados detalhados do dashboard";
    return { success: false, error: message };
  }
}
