import { apiClient } from "@/lib/api-client";

export interface DashboardStats {
  totalStudents: number;
  paymentsUpToDate: number;
  pendingPayments: number;
  totalMonthlyRevenue: number;
  newStudentsThisMonth: number;
}

export async function getDashboardStatsAction(): Promise<{
  success: boolean;
  stats?: DashboardStats;
  error?: string;
}> {
  try {
    type StatsResponse = {
      students?: { total?: number };
    };

    type FinancialResponse = {
      pending?: { count?: number; total?: number };
      received?: { count?: number; total?: number };
    };

    type DetailedResponse = {
      recentStudents?: unknown[];
    };

    const [statsResponse, financialResponse, detailedResponse] =
      await Promise.all([
        apiClient.get<StatsResponse>("/dashboard/stats"),
        apiClient.get<FinancialResponse>("/dashboard/financial"),
        apiClient.get<DetailedResponse>("/dashboard/detailed"),
      ]);

    const stats: DashboardStats = {
      totalStudents: statsResponse?.students?.total ?? 0,
      paymentsUpToDate: financialResponse?.received?.count ?? 0,
      pendingPayments: financialResponse?.pending?.count ?? 0,
      totalMonthlyRevenue: financialResponse?.received?.total ?? 0,
      newStudentsThisMonth: detailedResponse?.recentStudents?.length ?? 0,
    };

    return { success: true, stats };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao carregar estatísticas do dashboard";
    return { success: false, error: message };
  }
}
