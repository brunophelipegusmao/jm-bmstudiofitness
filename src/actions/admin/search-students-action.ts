import { apiClient } from "@/lib/api-client";

export interface AdminSearchStudent {
  id: string;
  name: string;
  email: string;
  cpf: string;
}

export async function searchStudentsAction(
  term: string,
): Promise<{ success: boolean; data?: AdminSearchStudent[]; error?: string }> {
  if (!term.trim()) {
    return { success: true, data: [] };
  }

  try {
    const query = new URLSearchParams({
      search: term,
      limit: "20",
      page: "1",
    }).toString();

    const res = await apiClient.get<{
      data: Array<{
        id: string;
        name: string;
        email: string;
        cpf: string;
      }>;
    }>(`/students?${query}`);

    return {
      success: true,
      data: res.data.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        cpf: s.cpf,
      })),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar alunos";
    return { success: false, error: message, data: [] };
  }
}
