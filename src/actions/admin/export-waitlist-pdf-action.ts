import type { WaitlistEntry } from "./waitlist-actions";
import { getWaitlistAdminAction } from "./waitlist-actions";

export async function exportWaitlistPdfAction(): Promise<{
  success: boolean;
  data?: WaitlistEntry[];
  error?: string;
}> {
  const result = await getWaitlistAdminAction();

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error ?? "Erro ao buscar dados da lista de espera",
    };
  }

  return { success: true, data: result.data };
}
