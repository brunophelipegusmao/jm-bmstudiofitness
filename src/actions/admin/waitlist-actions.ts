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
    const entries = await apiClient.get<WaitlistApi[]>("/waitlist/public");
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
    try {
      const entries = await apiClient.get<WaitlistApi[]>("/waitlist");
      const mapped = mapWaitlist(entries);
      return { success: true, data: mapped };
    } catch (err) {
      // Fallback para endpoint público se o token não estiver presente
      const entries = await apiClient.get<WaitlistApi[]>("/waitlist/public");
      const mapped = mapWaitlist(entries);
      return { success: true, data: mapped };
    }
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
    const monthlyFeeValue = Math.round(
      parseFloat(params.monthlyFeeValue) * 100,
    );

    let userId = "";
    let createdNewUser = true;

    // Cria aluno; se email já existir, usa usuário existente
    try {
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
      userId = user.id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("email já cadastrado")) {
        // Recupera usuário existente pelo e-mail
        const existing = await apiClient.get<{ id: string }>(
          `/users/email/${encodeURIComponent(params.email)}`,
        );
        if (!existing?.id) {
          return { success: false, error: "Email já cadastrado em outro usuário" };
        }
        userId = existing.id;
        createdNewUser = false;
      } else {
        throw err;
      }
    }

    // Cria registro financeiro
    try {
      await apiClient.post("/financial", {
        userId,
        monthlyFeeValue,
        dueDate: Number(params.dueDate),
        paymentMethod: params.paymentMethod,
        paid: false,
      });
    } catch (err) {
      console.error("Erro ao criar registro financeiro para aluno:", err);
      // continua mesmo assim
    }

    // Marca waitlist como convertida
    await apiClient.post(`/waitlist/${params.waitlistId}/convert`, {
      studentId: userId,
    });

    // Dispara e-mail para o aluno criar a senha (após cadastro/associação)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const resp = await fetch(`${baseUrl}/api/waitlist/enroll-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: params.email, name: params.fullName }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        console.error("Falha ao enviar e-mail de criação de senha:", body);
      }
    } catch (err) {
      console.error("Erro ao enviar e-mail de criação de senha:", err);
    }

    return { success: true, userId, password: createdNewUser ? password : "" };
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

