import { apiClient } from "@/lib/api-client";
import type { FinancialReportData } from "@/types/payments";
export type { FinancialReportData } from "@/types/payments";

function formatCurrency(valueInCents: number) {
  return `R$ ${(valueInCents / 100).toFixed(2).replace(".", ",")}`;
}

export async function getFinancialReportsAction(): Promise<{
  success: boolean;
  data?: FinancialReportData;
  error?: string;
}> {
  try {
    type FinancialResponse = {
      pending?: { count?: number; total?: number; totalFormatted?: string };
      received?: { count?: number; total?: number; totalFormatted?: string };
    };

    type StatsResponse = {
      students?: { total?: number };
    };

    const [financialStats, dashboardStats] = await Promise.all([
      apiClient.get<FinancialResponse>("/dashboard/financial"),
      apiClient.get<StatsResponse>("/dashboard/stats"),
    ]);

    const paidCount = financialStats?.received?.count ?? 0;
    const pendingCount = financialStats?.pending?.count ?? 0;
    const paidTotal = financialStats?.received?.total ?? 0;
    const pendingTotal = financialStats?.pending?.total ?? 0;

    const paymentRate =
      paidCount + pendingCount > 0
        ? Math.round((paidCount / (paidCount + pendingCount)) * 100)
        : 0;

    const reportData: FinancialReportData = {
      period: "últimos 30 dias",
      totalRevenue: paidTotal,
      pendingRevenue: pendingTotal,
      paidCount,
      pendingCount,
      payments: [],
      overview: {
        totalStudents: dashboardStats?.students?.total ?? 0,
        activeStudents: dashboardStats?.students?.total ?? 0,
        totalRevenue:
          financialStats?.received?.totalFormatted ??
          formatCurrency(paidTotal),
        pendingPayments:
          financialStats?.pending?.totalFormatted ??
          formatCurrency(pendingTotal),
        monthlyGrowth: 0,
        paymentRate,
      },
      recentPayments: [],
      monthlyData: [],
    };

    return { success: true, data: reportData };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar relatórios";
    return { success: false, error: message };
  }
}
