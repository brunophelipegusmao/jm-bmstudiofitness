import { apiClient } from "@/lib/api-client";

export interface WaitlistEntry {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  preferredShift: string;
  goal: string;
  healthRestrictions: string | null;
  position: number;
  status: string;
  createdAt: Date;
  enrolledAt: Date | null;
  userId: string | null;
}

type WaitlistApi = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  convertedAt?: string | null;
  convertedToUserId?: string | null;
};

function mapWaitlist(entries: WaitlistApi[]): WaitlistEntry[] {
  return entries.map((entry, index) => ({
    id: entry.id,
    fullName: entry.name,
    email: entry.email,
    whatsapp: entry.phone || "",
    preferredShift: entry.source || "",
    goal: entry.notes || "",
    healthRestrictions: null,
    position: index + 1,
    status: entry.status,
    createdAt: new Date(entry.createdAt),
    enrolledAt: entry.convertedAt ? new Date(entry.convertedAt) : null,
    userId: entry.convertedToUserId || null,
  }));
}

export async function getWaitlistPublicAction(): Promise<{
  success: boolean;
  data?: WaitlistEntry[];
  error?: string;
}> {
  try {
    const entries = await apiClient.get<WaitlistApi[]>("/waitlist");
    const mapped = mapWaitlist(entries);
    return { success: true, data: mapped };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar lista de espera";
    return { success: false, error: message, data: [] };
  }
}

export async function joinWaitlistAction(input: {
  fullName: string;
  email: string;
  whatsapp?: string;
  preferredShift?: string;
  goal?: string;
  healthRestrictions?: string;
}) {
  try {
    await apiClient.post("/waitlist/signup", {
      name: input.fullName,
      email: input.email,
      phone: input.whatsapp,
      source: input.preferredShift,
      notes: input.goal,
    });

    return { success: true, message: "Cadastro realizado com sucesso!" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao cadastrar na lista de espera";
    return { success: false, error: message };
  }
}

export async function getWaitlistAdminAction(): Promise<{
  success: boolean;
  data?: WaitlistEntry[];
  error?: string;
}> {
  try {
    const entries = await apiClient.get<WaitlistApi[]>("/waitlist");
    const mapped = mapWaitlist(entries);
    return { success: true, data: mapped };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar lista de espera";
    return { success: false, error: message, data: [] };
  }
}

export async function deleteWaitlistEntryAction(id: string) {
  try {
    await apiClient.delete(`/waitlist/${id}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao remover entrada";
    return { success: false, error: message };
  }
}

export async function completeEnrollFromWaitlistAction(params: {
  waitlistId: string;
  fullName: string;
  cpf: string;
  email: string;
  telephone: string;
  address: string;
  bornDate: string;
  sex: string;
  monthlyFeeValue: string;
  paymentMethod: string;
  dueDate: string;
}) {
  try {
    const password = Math.random().toString(36).slice(-8);
    const monthlyFeeValue = Math.round(parseFloat(params.monthlyFeeValue) * 100);

    // Cria aluno
    const user = await apiClient.post<{ id: string }>("/users", {
      name: params.fullName,
      email: params.email,
      password,
      cpf: params.cpf,
      bornDate: params.bornDate,
      address: params.address,
      telephone: params.telephone,
      role: "aluno",
    });

    // Cria registro financeiro
    await apiClient.post("/financial", {
      userId: user.id,
      monthlyFeeValue,
      dueDate: Number(params.dueDate),
      paymentMethod: params.paymentMethod,
      paid: false,
    });

    // Marca waitlist como convertida
    await apiClient.post(`/waitlist/${params.waitlistId}/convert`, {
      studentId: user.id,
    });

    return { success: true, userId: user.id, password };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao matricular aluno";
    return { success: false, error: message };
  }
}

export async function exportWaitlistPdfAction() {
  const result = await getWaitlistAdminAction();
  if (!result.success || !result.data) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
}
