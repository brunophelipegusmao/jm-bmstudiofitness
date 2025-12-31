import { apiClient } from "@/lib/api-client";

interface DueDatesSummary {
  dueToday: number;
  dueNext7Days: number;
  overdue: number;
}

function isValidDateString(value: string | undefined | null) {
  return !!value && !Number.isNaN(Date.parse(value));
}

export async function getPaymentDueDatesAction(): Promise<{
  success: boolean;
  data?: DueDatesSummary;
  error?: string;
}> {
  try {
    type DetailedResponse = {
      pendingPayments?: Array<{ dueDate?: string }>;
    };

    const detailed = await apiClient.get<DetailedResponse>(
      "/dashboard/detailed",
    );
    const pendingPayments = detailed?.pendingPayments ?? [];

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const next7 = new Date();
    next7.setDate(today.getDate() + 7);
    const next7Str = next7.toISOString().split("T")[0];

    let dueToday = 0;
    let dueNext7Days = 0;
    let overdue = 0;

    for (const payment of pendingPayments) {
      if (!isValidDateString(payment.dueDate)) continue;
      const due = payment.dueDate!;

      if (due === todayStr) {
        dueToday += 1;
      } else if (due < todayStr) {
        overdue += 1;
      } else if (due <= next7Str) {
        dueNext7Days += 1;
      }
    }

    return {
      success: true,
      data: { dueToday, dueNext7Days, overdue },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar vencimentos";
    return { success: false, error: message };
  }
}
