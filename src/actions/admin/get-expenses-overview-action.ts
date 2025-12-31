import { apiClient } from "@/lib/api-client";

interface ExpensesOverview {
  pending: {
    count: number;
    totalInCents: number;
    totalFormatted: string;
  };
  paid: {
    count: number;
    totalInCents: number;
    totalFormatted: string;
  };
}

function formatCurrency(valueInCents: number) {
  return `R$ ${(valueInCents / 100).toFixed(2).replace(".", ",")}`;
}

export async function getExpensesOverviewAction(): Promise<{
  success: boolean;
  data?: ExpensesOverview;
  error?: string;
}> {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const report = await apiClient.get<{
      period: { month: number; year: number };
      total: number;
      byCategory: Record<string, number>;
      count: number;
    }>(`/expenses/report?month=${month}&year=${year}`);

    const paidTotal = report?.total ?? 0;
    const paidCount = report?.count ?? 0;

    return {
      success: true,
      data: {
        pending: {
          count: 0,
          totalInCents: 0,
          totalFormatted: formatCurrency(0),
        },
        paid: {
          count: paidCount,
          totalInCents: paidTotal,
          totalFormatted: formatCurrency(paidTotal),
        },
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao obter despesas";
    return { success: false, error: message };
  }
}
