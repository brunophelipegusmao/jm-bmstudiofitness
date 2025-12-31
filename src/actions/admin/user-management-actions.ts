import { apiClient } from "@/lib/api-client";
import type { CreateUserData, User } from "@/types/user";
import { UserRole } from "@/types/user-roles";

type UsersResponse =
  | {
      data?: unknown[];
      meta?: unknown;
    }
  | unknown[];

const mapUser = (raw: unknown): User => {
  const u = (raw as Record<string, unknown>) || {};
  const personal = (u.personalData as Record<string, unknown>) || {};

  const role =
    (u.role as UserRole) ||
    (u.userRole as UserRole) ||
    (u.user_role as UserRole) ||
    UserRole.ALUNO;

  return {
    id: String(u.id ?? ""),
    name: (u.name as string) ?? "",
    email: (u.email as string) ?? (personal.email as string) ?? "",
    role,
    cpf: (u.cpf as string) ?? (personal.cpf as string),
    telephone:
      (u.telephone as string) ?? (personal.telephone as string) ?? undefined,
    address: (u.address as string) ?? (personal.address as string) ?? undefined,
    bornDate:
      (u.bornDate as string) ?? (personal.bornDate as string) ?? undefined,
    createdAt:
      (u.createdAt as string) ??
      (u.created_at as string) ??
      new Date().toISOString(),
    updatedAt:
      (u.updatedAt as string) ??
      (u.updated_at as string) ??
      (u.createdAt as string) ??
      new Date().toISOString(),
    isActive: (u.isActive as boolean) ?? (u.is_active as boolean) ?? true,
  };
};

export async function getAllUsersAction(): Promise<{
  success: boolean;
  users: User[];
  error?: string;
}> {
  try {
    const res = (await apiClient.get<UsersResponse>("/users?limit=500")) ?? [];
    const resWithData = res as { data?: unknown[] };
    const list = Array.isArray(res)
      ? (res as unknown[])
      : Array.isArray(resWithData.data)
        ? resWithData.data
        : [];
    const users = list.map(mapUser);
    return { success: true, users };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar usuários";
    return { success: false, users: [], error: message };
  }
}

export async function createUserAction(
  input: CreateUserData,
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const payload = {
      name: input.name,
      email: input.email,
      password: input.password,
      cpf: input.cpf ?? "",
      telephone: input.telephone ?? "",
      address: input.address ?? "",
      bornDate: input.bornDate ?? "",
      role: input.role ?? UserRole.ALUNO,
    };

    const created = await apiClient.post<unknown>("/users", payload);
    const user = mapUser(
      Array.isArray(created) && created.length > 0 ? created[0] : created,
    );
    return { success: true, user };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar usuário";
    return { success: false, error: message };
  }
}

export async function deleteUserAction(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.delete(`/users/${userId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir usuário";
    return { success: false, error: message };
  }
}

export async function toggleUserStatusAction(
  userId: string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.patch(`/users/${userId}`, { isActive });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar status";
    return { success: false, error: message };
  }
}
